import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { TravelOrder, OrderType, OrderStatus } from '../entity/travel-order.entity';
import { ETicket, ETicketStatus } from '../entity/e-ticket.entity';
import { TicketType } from '../entity/ticket-type.entity';
import { RoutePackage } from '../entity/route-package.entity';
import { TicketTypeService } from './ticket-type.service';
import { RoutePackageService } from './route-package.service';
import { CreateTicketOrderDTO, CreateRouteOrderDTO, OrderListDTO, RefundDTO } from '../dto/travel-order.dto';

@Provide()
export class TravelOrderService {
  @InjectEntityModel(TravelOrder)
  orderModel: Repository<TravelOrder>;

  @InjectEntityModel(ETicket)
  eTicketModel: Repository<ETicket>;

  @InjectEntityModel(TicketType)
  ticketTypeModel: Repository<TicketType>;

  @InjectEntityModel(RoutePackage)
  routeModel: Repository<RoutePackage>;

  @Inject()
  ticketTypeService: TicketTypeService;

  @Inject()
  routePackageService: RoutePackageService;

  /** 生成订单号 */
  private genOrderNo(): string {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `WD${date}${rand}`;
  }

  /** 生成票号 */
  private genTicketNo(): string {
    return `TK${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }

  /** 创建门票订单 */
  async createTicketOrder(userId: number, dto: CreateTicketOrderDTO) {
    const ticketType = await this.ticketTypeModel.findOne({
      where: { ticketTypeId: dto.ticketTypeId, status: 1 },
      relations: ['scenicSpot']
    });
    if (!ticketType) throw new Error('票种不存在或已下架');

    const totalAmount = ticketType.price * dto.quantity;
    const orderNo = this.genOrderNo();

    const order = this.orderModel.create({
      orderNo,
      userId,
      orderType: OrderType.TICKET,
      targetId: ticketType.scenicId,
      targetName: ticketType.scenicSpot?.name || '',
      targetImage: ticketType.image || ticketType.scenicSpot?.mainImage || '',
      ticketTypeId: dto.ticketTypeId,
      ticketTypeName: ticketType.name,
      unitPrice: ticketType.price,
      quantity: dto.quantity,
      totalAmount,
      useDate: dto.useDate,
      visitors: dto.visitors,
      contactPhone: dto.contactPhone,
      orderStatus: OrderStatus.PENDING_PAY
    });

    await this.orderModel.save(order);
    return { orderNo, totalAmount };
  }

  /** 创建路线订单 */
  async createRouteOrder(userId: number, dto: CreateRouteOrderDTO) {
    const route = await this.routeModel.findOne({
      where: { routeId: dto.routeId, status: 1 }
    });
    if (!route) throw new Error('路线不存在或已下架');

    // R9-03: 路线套餐须提前1天购买
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const useDate = new Date(dto.useDate);
    if (useDate <= tomorrow) throw new Error('路线套餐须提前1天购买');

    const totalAmount = route.price * dto.quantity;
    const orderNo = this.genOrderNo();

    const order = this.orderModel.create({
      orderNo,
      userId,
      orderType: OrderType.ROUTE,
      targetId: dto.routeId,
      targetName: route.title,
      targetImage: route.mainImage,
      unitPrice: route.price,
      quantity: dto.quantity,
      totalAmount,
      useDate: dto.useDate,
      visitors: dto.visitors,
      contactPhone: dto.contactPhone,
      orderStatus: OrderStatus.PENDING_PAY
    });

    await this.orderModel.save(order);
    return { orderNo, totalAmount };
  }

  /** 订单列表 */
  async list(userId: number, dto: OrderListDTO) {
    const { orderType, orderStatus, page = 1, pageSize = 10 } = dto;
    const where: any = { userId };
    if (orderType) where.orderType = orderType;
    if (orderStatus) where.orderStatus = orderStatus;

    const [list, total] = await this.orderModel.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    return { list, total, page, pageSize };
  }

  /** 订单详情 */
  async detail(orderNo: string, userId?: number) {
    const where: any = { orderNo };
    if (userId) where.userId = userId;
    const order = await this.orderModel.findOne({ where });
    if (!order) throw new Error('订单不存在');

    // 获取电子票信息
    const eTickets = await this.eTicketModel.find({ where: { orderNo } });
    return { ...order, eTickets };
  }

  /** 支付成功回调 */
  async paySuccess(orderNo: string, transactionId: string) {
    const order = await this.orderModel.findOne({ where: { orderNo } });
    if (!order) throw new Error('订单不存在');
    if (order.orderStatus !== OrderStatus.PENDING_PAY) throw new Error('订单状态异常');

    // 扣减库存
    if (order.orderType === OrderType.TICKET) {
      await this.ticketTypeService.decrStock(order.ticketTypeId!, order.quantity);
    } else {
      await this.routePackageService.decrStock(order.targetId, order.quantity);
    }

    // 更新订单状态
    order.orderStatus = OrderStatus.PAID;
    order.paidAt = new Date();
    order.transactionId = transactionId;
    await this.orderModel.save(order);

    // 生成电子票
    const visitors = JSON.parse(order.visitors || '[]');
    const expireDays = order.orderType === OrderType.TICKET
      ? (await this.ticketTypeModel.findOne({ where: { ticketTypeId: order.ticketTypeId } }))?.validityDays || 30
      : 30;

    const expireDate = new Date(order.useDate);
    expireDate.setDate(expireDate.getDate() + expireDays);

    for (const visitor of visitors) {
      const eTicket = this.eTicketModel.create({
        orderNo,
        ticketTypeId: order.ticketTypeId,
        routeId: order.orderType === OrderType.ROUTE ? order.targetId : undefined,
        userId: order.userId,
        qrCode: this.genTicketNo(),
        useDate: order.useDate,
        expireDate: expireDate.toISOString().slice(0, 10),
        visitorName: visitor.name,
        visitorIdCard: visitor.idCard || '',
        visitorPhone: visitor.phone || '',
        status: ETicketStatus.UNUSED
      });
      await this.eTicketModel.save(eTicket);
    }

    return { success: true };
  }

  /** 取消订单（超时自动取消/用户手动取消） */
  async cancel(orderNo: string, userId: number) {
    const order = await this.orderModel.findOne({ where: { orderNo, userId } });
    if (!order) throw new Error('订单不存在');
    if (order.orderStatus !== OrderStatus.PENDING_PAY) throw new Error('订单状态不允许取消');

    order.orderStatus = OrderStatus.CANCELLED;
    await this.orderModel.save(order);
    return { success: true };
  }

  /** 申请退款 */
  async refund(userId: number, dto: RefundDTO) {
    const order = await this.orderModel.findOne({ where: { orderNo: dto.orderNo, userId } });
    if (!order) throw new Error('订单不存在');

    // R9-03: 出发日期3天前可免费退；出发前3天内不可退
    if (order.orderType === OrderType.ROUTE) {
      const useDate = new Date(order.useDate);
      const now = new Date();
      const diffDays = Math.floor((useDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 3) throw new Error('出发前3天内不可退款');
    }

    if (![OrderStatus.PAID, OrderStatus.COMPLETED].includes(order.orderStatus)) {
      throw new Error('订单状态不允许退款');
    }

    order.orderStatus = OrderStatus.REFUNDING;
    order.refundReason = dto.reason;
    await this.orderModel.save(order);

    // 标记电子票为已退款
    await this.eTicketModel.update(
      { orderNo: dto.orderNo },
      { status: ETicketStatus.REFUNDED }
    );

    return { success: true };
  }

  /** 退款审核（管理后台） */
  async approveRefund(orderNo: string, approved: boolean) {
    const order = await this.orderModel.findOne({ where: { orderNo } });
    if (!order || order.orderStatus !== OrderStatus.REFUNDING) throw new Error('订单状态异常');

    order.orderStatus = approved ? OrderStatus.REFUNDED : OrderStatus.PAID;
    if (approved) order.refundedAt = new Date();
    await this.orderModel.save(order);

    if (!approved) {
      await this.eTicketModel.update({ orderNo }, { status: ETicketStatus.UNUSED });
    }

    return { success: true };
  }

  /** 获取所有订单（管理后台） */
  async adminList(dto: OrderListDTO) {
    const { orderType, orderStatus, page = 1, pageSize = 10 } = dto;
    const where: any = {};
    if (orderType) where.orderType = orderType;
    if (orderStatus) where.orderStatus = orderStatus;

    const [list, total] = await this.orderModel.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    return { list, total, page, pageSize };
  }

  /** 核销电子票 */
  async verifyTicket(qrCode: string, operatorId: number) {
    const eTicket = await this.eTicketModel.findOne({ where: { qrCode } });
    if (!eTicket) throw new Error('电子票不存在');
    if (eTicket.status === ETicketStatus.USED) throw new Error('电子票已使用');
    if (eTicket.status === ETicketStatus.REFUNDED) throw new Error('电子票已退款');
    if (eTicket.status === ETicketStatus.EXPIRED) throw new Error('电子票已过期');

    // 检查是否过期
    if (new Date() > new Date(eTicket.expireDate)) {
      eTicket.status = ETicketStatus.EXPIRED;
      await this.eTicketModel.save(eTicket);
      throw new Error('电子票已过期');
    }

    eTicket.status = ETicketStatus.USED;
    eTicket.verifiedAt = new Date();
    eTicket.verifiedBy = operatorId;
    await this.eTicketModel.save(eTicket);

    return { success: true, visitorName: eTicket.visitorName };
  }
}
