import { Controller, Get, Post, Put, Body, Query, Param, Headers } from '@midwayjs/core';
import { ApiTags, ApiOperation } from '@midwayjs/swagger';
import { Inject } from '@midwayjs/core';
import { TravelOrderService } from '../service/travel-order.service';
import { CreateTicketOrderDTO, CreateRouteOrderDTO, RefundDTO, VerifyTicketDTO } from '../dto/travel-order.dto';

@ApiTags(['订单管理'])
@Controller('/api/order')
export class TravelOrderController {
  @Inject()
  travelOrderService: TravelOrderService;

  @ApiOperation({ summary: '创建门票订单' })
  @Post('/ticket/create')
  async createTicketOrder(@Body() dto: CreateTicketOrderDTO) {
    // userId 从 JWT token 中获取，这里简化处理
    const userId = 1; // TODO: 从 JWT 解析
    return this.travelOrderService.createTicketOrder(userId, dto);
  }

  @ApiOperation({ summary: '创建路线订单' })
  @Post('/route/create')
  async createRouteOrder(@Body() dto: CreateRouteOrderDTO) {
    const userId = 1; // TODO: 从 JWT 解析
    return this.travelOrderService.createRouteOrder(userId, dto);
  }

  @ApiOperation({ summary: '我的订单列表' })
  @Get('/list')
  async list(
    @Query('orderType') orderType?: string,
    @Query('orderStatus') orderStatus?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    const userId = 1; // TODO: 从 JWT 解析
    return this.travelOrderService.list(userId, { orderType, orderStatus, page, pageSize });
  }

  @ApiOperation({ summary: '订单详情' })
  @Get('/detail/:orderNo')
  async detail(@Param('orderNo') orderNo: string) {
    const userId = 1;
    return this.travelOrderService.detail(orderNo, userId);
  }

  @ApiOperation({ summary: '支付成功回调(微信支付通知)' })
  @Post('/pay-callback')
  async payCallback(@Body() body: { orderNo: string; transactionId: string }) {
    return this.travelOrderService.paySuccess(body.orderNo, body.transactionId);
  }

  @ApiOperation({ summary: '取消订单' })
  @Put('/cancel/:orderNo')
  async cancel(@Param('orderNo') orderNo: string) {
    const userId = 1;
    return this.travelOrderService.cancel(orderNo, userId);
  }

  @ApiOperation({ summary: '申请退款' })
  @Post('/refund')
  async refund(@Body() dto: RefundDTO) {
    const userId = 1;
    return this.travelOrderService.refund(userId, dto);
  }

  // ========== 管理后台接口 ==========

  @ApiOperation({ summary: '所有订单列表(管理后台)' })
  @Get('/admin/list')
  async adminList(
    @Query('orderType') orderType?: string,
    @Query('orderStatus') orderStatus?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    return this.travelOrderService.adminList({ orderType, orderStatus, page, pageSize });
  }

  @ApiOperation({ summary: '退款审核(管理后台)' })
  @Put('/admin/refund-audit')
  async approveRefund(@Body() body: { orderNo: string; approved: boolean }) {
    return this.travelOrderService.approveRefund(body.orderNo, body.approved);
  }

  @ApiOperation({ summary: '核销电子票(管理后台/商家)' })
  @Post('/verify')
  async verifyTicket(@Body() dto: VerifyTicketDTO) {
    const operatorId = 1; // TODO: 从 JWT 解析
    return this.travelOrderService.verifyTicket(dto.qrCode, operatorId);
  }
}
