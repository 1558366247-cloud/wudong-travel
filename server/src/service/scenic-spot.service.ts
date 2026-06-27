import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, Like, MoreThan } from 'typeorm';
import { ScenicSpot } from '../entity/scenic-spot.entity';
import { TicketType } from '../entity/ticket-type.entity';
import { ScenicSpotListDTO, ScenicSpotCreateDTO, ScenicSpotUpdateDTO } from '../dto/scenic-spot.dto';

@Provide()
export class ScenicSpotService {
  @InjectEntityModel(ScenicSpot)
  scenicSpotModel: Repository<ScenicSpot>;

  @InjectEntityModel(TicketType)
  ticketTypeModel: Repository<TicketType>;

  /** 景区列表（含门票最低价） */
  async list(dto: ScenicSpotListDTO) {
    const { page = 1, pageSize = 10, keyword, sortBy = 'default' } = dto;
    const qb = this.scenicSpotModel.createQueryBuilder('s')
      .where('s.status = 1');

    if (keyword) {
      qb.andWhere('(s.name LIKE :kw OR s.address LIKE :kw)', { kw: `%${keyword}%` });
    }

    switch (sortBy) {
      case 'rating': qb.orderBy('s.sortOrder', 'ASC'); break;
      default: qb.orderBy('s.sortOrder', 'ASC').addOrderBy('s.createdAt', 'DESC');
    }

    const [list, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    // 获取每个景区的最低票价
    const scenicIds = list.map(s => s.scenicId);
    const minPrices = scenicIds.length ? await this.ticketTypeModel
      .createQueryBuilder('t')
      .select('t.scenicId', 'scenicId')
      .addSelect('MIN(t.price)', 'minPrice')
      .where('t.scenicId IN (:...ids)', { ids: scenicIds })
      .andWhere('t.status = 1')
      .groupBy('t.scenicId')
      .getRawMany() : [];

    const priceMap = new Map(minPrices.map((p: any) => [p.scenicId, parseFloat(p.minPrice)]));

    return {
      list: list.map(s => ({
        ...s,
        minPrice: priceMap.get(s.scenicId) || 0
      })),
      total,
      page,
      pageSize
    };
  }

  /** 景区详情 */
  async detail(scenicId: number) {
    const scenic = await this.scenicSpotModel.findOne({
      where: { scenicId, status: 1 }
    });
    if (!scenic) throw new Error('景区不存在或已下架');

    const tickets = await this.ticketTypeModel.find({
      where: { scenicId, status: 1 },
      order: { sortOrder: 'ASC' }
    });

    return { ...scenic, tickets };
  }

  /** 创建景区（管理后台） */
  async create(dto: ScenicSpotCreateDTO) {
    const scenic = this.scenicSpotModel.create(dto);
    return this.scenicSpotModel.save(scenic);
  }

  /** 更新景区 */
  async update(dto: ScenicSpotUpdateDTO) {
    const { scenicId, ...data } = dto;
    await this.scenicSpotModel.update(scenicId, data);
    return this.scenicSpotModel.findOne({ where: { scenicId } });
  }

  /** 上下架 */
  async toggleStatus(scenicId: number, status: number) {
    await this.scenicSpotModel.update(scenicId, { status });
    return { success: true };
  }

  /** 删除 */
  async delete(scenicId: number) {
    await this.scenicSpotModel.delete(scenicId);
    return { success: true };
  }
}
