import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { RoutePackage } from '../entity/route-package.entity';
import { RouteItinerary } from '../entity/route-itinerary.entity';
import { RouteListDTO, RouteCreateDTO, RouteUpdateDTO, RouteItineraryDTO } from '../dto/route-package.dto';

@Provide()
export class RoutePackageService {
  @InjectEntityModel(RoutePackage)
  routeModel: Repository<RoutePackage>;

  @InjectEntityModel(RouteItinerary)
  itineraryModel: Repository<RouteItinerary>;

  /** 路线列表 */
  async list(dto: RouteListDTO) {
    const { duration, theme, keyword, page = 1, pageSize = 10, sortBy = 'default' } = dto;
    const qb = this.routeModel.createQueryBuilder('r')
      .where('r.status = 1');

    if (duration) qb.andWhere('r.duration = :duration', { duration });
    if (theme) qb.andWhere('r.themes LIKE :theme', { theme: `%${theme}%` });
    if (keyword) qb.andWhere('(r.title LIKE :kw OR r.destination LIKE :kw)', { kw: `%${keyword}%` });

    switch (sortBy) {
      case 'price_asc': qb.orderBy('r.price', 'ASC'); break;
      case 'price_desc': qb.orderBy('r.price', 'DESC'); break;
      case 'rating': qb.orderBy('r.rating', 'DESC'); break;
      default: qb.orderBy('r.sortOrder', 'ASC').addOrderBy('r.soldCount', 'DESC');
    }

    const [list, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  /** 路线详情 */
  async detail(routeId: number) {
    const route = await this.routeModel.findOne({ where: { routeId, status: 1 } });
    if (!route) throw new Error('路线不存在或已下架');

    const itineraries = await this.itineraryModel.find({
      where: { routeId },
      order: { day: 'ASC', sortOrder: 'ASC' }
    });

    return { ...route, itineraries };
  }

  /** 创建路线 */
  async create(dto: RouteCreateDTO) {
    const route = this.routeModel.create(dto);
    return this.routeModel.save(route);
  }

  /** 更新路线 */
  async update(dto: RouteUpdateDTO) {
    const { routeId, ...data } = dto;
    await this.routeModel.update(routeId, data);
    return this.routeModel.findOne({ where: { routeId } });
  }

  /** 上下架 */
  async toggleStatus(routeId: number, status: number) {
    await this.routeModel.update(routeId, { status });
    return { success: true };
  }

  /** 删除 */
  async delete(routeId: number) {
    await this.itineraryModel.delete({ routeId });
    await this.routeModel.delete(routeId);
    return { success: true };
  }

  /** 保存行程安排 */
  async saveItineraries(routeId: number, itineraries: RouteItineraryDTO[]) {
    await this.itineraryModel.delete({ routeId });
    const entities = itineraries.map((item, index) =>
      this.itineraryModel.create({ ...item, routeId, sortOrder: index })
    );
    await this.itineraryModel.save(entities);
    return { success: true };
  }

  /** 获取行程 */
  async getItineraries(routeId: number) {
    return this.itineraryModel.find({
      where: { routeId },
      order: { day: 'ASC', sortOrder: 'ASC' }
    });
  }

  /** 减少库存 */
  async decrStock(routeId: number, quantity: number) {
    const result = await this.routeModel
      .createQueryBuilder()
      .update(RoutePackage)
      .set({ stock: () => `stock - ${quantity}`, soldCount: () => `sold_count + ${quantity}` })
      .where('route_id = :id AND stock >= :qty', { id: routeId, qty: quantity })
      .execute();
    if (result.affected === 0) throw new Error('库存不足');
    return true;
  }
}
