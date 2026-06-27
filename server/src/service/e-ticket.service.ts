import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { ETicket, ETicketStatus } from '../entity/e-ticket.entity';

@Provide()
export class ETicketService {
  @InjectEntityModel(ETicket)
  eTicketModel: Repository<ETicket>;

  /** 用户电子票列表 */
  async listByUser(userId: number, status?: string) {
    const where: any = { userId };
    if (status) where.status = status;
    return this.eTicketModel.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['ticketType', 'routePackage']
    });
  }

  /** 电子票详情（二维码展示） */
  async detail(eTicketId: number, userId: number) {
    const ticket = await this.eTicketModel.findOne({
      where: { eTicketId, userId },
      relations: ['ticketType', 'routePackage']
    });
    if (!ticket) throw new Error('电子票不存在');
    return ticket;
  }

  /** 检查票是否可退 */
  async checkRefundable(eTicketId: number): Promise<boolean> {
    const ticket = await this.eTicketModel.findOne({ where: { eTicketId } });
    if (!ticket) return false;
    if (ticket.status !== ETicketStatus.UNUSED) return false;
    if (new Date() > new Date(ticket.expireDate)) {
      ticket.status = ETicketStatus.EXPIRED;
      await this.eTicketModel.save(ticket);
      return false;
    }
    return true;
  }
}
