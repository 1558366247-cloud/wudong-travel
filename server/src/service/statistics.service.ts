import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { TravelOrder, OrderStatus } from '../entity/travel-order.entity';
import { ScenicSpot } from '../entity/scenic-spot.entity';
import { RoutePackage } from '../entity/route-package.entity';

@Provide()
export class StatisticsService {
  @InjectEntityModel(TravelOrder)
  orderModel: Repository<TravelOrder>;

  @InjectEntityModel(ScenicSpot)
  scenicModel: Repository<ScenicSpot>;

  @InjectEntityModel(RoutePackage)
  routeModel: Repository<RoutePackage>;

  /** 行模块数据看板 */
  async dashboard() {
    const today = new Date().toISOString().slice(0, 10);

    // 今日订单统计
    const todayOrders = await this.orderModel
      .createQueryBuilder('o')
      .select('COUNT(o.orderNo)', 'total')
      .addSelect('SUM(CASE WHEN o.orderStatus = :paid THEN o.totalAmount ELSE 0 END)', 'revenue')
      .where('DATE(o.createdAt) = :today', { today })
      .setParameter('paid', OrderStatus.PAID)
      .getRawOne();

    // 待处理退款
    const pendingRefunds = await this.orderModel.count({
      where: { orderStatus: OrderStatus.REFUNDING }
    });

    // 景区数量
    const scenicCount = await this.scenicModel.count({ where: { status: 1 } });

    // 路线数量
    const routeCount = await this.routeModel.count({ where: { status: 1 } });

    // 本月GMV
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthlyGmv = await this.orderModel
      .createQueryBuilder('o')
      .select('SUM(o.totalAmount)', 'total')
      .where('o.orderStatus IN (:...statuses)', { statuses: [OrderStatus.PAID, OrderStatus.COMPLETED] })
      .andWhere('o.createdAt >= :start', { start: monthStart.toISOString().slice(0, 10) })
      .getRawOne();

    // 热销景区 TOP5
    const topScenics = await this.orderModel
      .createQueryBuilder('o')
      .select('o.targetName', 'name')
      .addSelect('COUNT(o.orderNo)', 'count')
      .addSelect('SUM(o.totalAmount)', 'amount')
      .where('o.orderType = :type', { type: 'ticket' })
      .andWhere('o.orderStatus IN (:...statuses)', { statuses: [OrderStatus.PAID, OrderStatus.COMPLETED] })
      .groupBy('o.targetName')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    // 热销路线 TOP5
    const topRoutes = await this.orderModel
      .createQueryBuilder('o')
      .select('o.targetName', 'name')
      .addSelect('COUNT(o.orderNo)', 'count')
      .addSelect('SUM(o.totalAmount)', 'amount')
      .where('o.orderType = :type', { type: 'route' })
      .andWhere('o.orderStatus IN (:...statuses)', { statuses: [OrderStatus.PAID, OrderStatus.COMPLETED] })
      .groupBy('o.targetName')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      todayOrders: parseInt(todayOrders?.total || '0'),
      todayRevenue: parseFloat(todayOrders?.revenue || '0'),
      pendingRefunds,
      scenicCount,
      routeCount,
      monthlyGmv: parseFloat(monthlyGmv?.total || '0'),
      topScenics,
      topRoutes
    };
  }
}
