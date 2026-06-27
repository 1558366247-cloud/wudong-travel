import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { RouteItinerary } from './route-itinerary.entity';
import { ETicket } from './e-ticket.entity';
import { Review } from './review.entity';

export enum RouteDuration {
  ONE_DAY = '一日游',
  TWO_DAY = '两日游',
  MULTI_DAY = '多日游'
}

export enum RouteTheme {
  FAMILY = '亲子',
  PHOTOGRAPHY = '摄影',
  STUDY = '研学',
  FESTIVAL = '节庆'
}

@Entity('t_route_package')
export class RoutePackage {
  @PrimaryGeneratedColumn({ type: 'int', name: 'route_id' })
  routeId: number;

  @Column({ type: 'varchar', length: 200, comment: '路线标题' })
  title: string;

  @Column({ type: 'varchar', length: 200, comment: '副标题', nullable: true })
  subtitle: string;

  @Column({ type: 'enum', enum: RouteDuration, comment: '行程天数' })
  duration: RouteDuration;

  @Column({ type: 'varchar', length: 100, comment: '主题标签(逗号分隔)', nullable: true })
  themes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '套餐价格(元/人)' })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '市场价', nullable: true })
  marketPrice: number;

  @Column({ type: 'text', comment: '包含项目(JSON array)', nullable: true })
  includedItems: string;

  @Column({ type: 'varchar', length: 100, comment: '出发地' })
  departure: string;

  @Column({ type: 'varchar', length: 100, comment: '目的地' })
  destination: string;

  @Column({ type: 'varchar', length: 200, comment: '住宿标准', nullable: true })
  accommodationStandard: string;

  @Column({ type: 'varchar', length: 200, comment: '餐饮标准', nullable: true })
  mealStandard: string;

  @Column({ type: 'text', comment: '注意事项', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 500, comment: '主图URL' })
  mainImage: string;

  @Column({ type: 'simple-json', comment: '图片列表', nullable: true })
  images: string[];

  @Column({ type: 'text', comment: '路线详情(富文本)' })
  details: string;

  @Column({ type: 'int', comment: '库存(每团人数上限)', default: 30 })
  stock: number;

  @Column({ type: 'int', comment: '已售数量', default: 0 })
  soldCount: number;

  @Column({ type: 'float', comment: '评分', default: 5.0 })
  rating: number;

  @Column({ type: 'int', comment: '评价数量', default: 0 })
  reviewCount: number;

  @Column({ type: 'tinyint', comment: '状态 0下架 1上架', default: 1 })
  status: number;

  @Column({ type: 'int', comment: '排序', default: 0 })
  sortOrder: number;

  @Column({ type: 'int', comment: '所属商家ID', nullable: true })
  merchantId: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @OneToMany(() => RouteItinerary, itinerary => itinerary.routePackage)
  itineraries: RouteItinerary[];

  @OneToMany(() => ETicket, ticket => ticket.routePackage)
  eTickets: ETicket[];

  @OneToMany(() => Review, review => review.routePackage)
  reviews: Review[];
}
