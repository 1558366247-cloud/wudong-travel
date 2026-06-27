import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { TicketType } from '../entity/ticket-type.entity';
import { TicketTypeListDTO, TicketTypeCreateDTO, TicketTypeUpdateDTO } from '../dto/ticket-type.dto';

@Provide()
export class TicketTypeService {
  @InjectEntityModel(TicketType)
  ticketTypeModel: Repository<TicketType>;

  async list(dto: TicketTypeListDTO) {
    const { scenicId, page = 1, pageSize = 20 } = dto;
    const where: any = { status: 1 };
    if (scenicId) where.scenicId = scenicId;

    const [list, total] = await this.ticketTypeModel.findAndCount({
      where,
      order: { sortOrder: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    return { list, total, page, pageSize };
  }

  async detail(ticketTypeId: number) {
    return this.ticketTypeModel.findOne({
      where: { ticketTypeId },
      relations: ['scenicSpot']
    });
  }

  async create(dto: TicketTypeCreateDTO) {
    const ticket = this.ticketTypeModel.create(dto);
    return this.ticketTypeModel.save(ticket);
  }

  async update(dto: TicketTypeUpdateDTO) {
    const { ticketTypeId, ...data } = dto;
    await this.ticketTypeModel.update(ticketTypeId, data);
    return this.ticketTypeModel.findOne({ where: { ticketTypeId } });
  }

  async toggleStatus(ticketTypeId: number, status: number) {
    await this.ticketTypeModel.update(ticketTypeId, { status });
    return { success: true };
  }

  async delete(ticketTypeId: number) {
    await this.ticketTypeModel.delete(ticketTypeId);
    return { success: true };
  }

  /** 减少库存 */
  async decrStock(ticketTypeId: number, quantity: number) {
    const result = await this.ticketTypeModel
      .createQueryBuilder()
      .update(TicketType)
      .set({ stock: () => `stock - ${quantity}` })
      .where('ticket_type_id = :id AND stock >= :qty', { id: ticketTypeId, qty: quantity })
      .execute();
    if (result.affected === 0) throw new Error('库存不足');
    return true;
  }
}
