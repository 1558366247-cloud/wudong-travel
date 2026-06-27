import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn
} from 'typeorm';
import { RoutePackage } from './route-package.entity';

@Entity('t_route_itinerary')
export class RouteItinerary {
  @PrimaryGeneratedColumn({ type: 'int', name: 'itinerary_id' })
  itineraryId: number;

  @Column({ type: 'int', name: 'route_id' })
  routeId: number;

  @Column({ type: 'int', comment: '第几天' })
  day: number;

  @Column({ type: 'varchar', length: 500, comment: '当日行程描述' })
  description: string;

  @Column({ type: 'varchar', length: 500, comment: '景点列表(逗号分隔)', nullable: true })
  spots: string;

  @Column({ type: 'varchar', length: 200, comment: '用餐安排', nullable: true })
  meals: string;

  @Column({ type: 'varchar', length: 200, comment: '住宿安排', nullable: true })
  accommodation: string;

  @Column({ type: 'varchar', length: 300, comment: '交通方式', nullable: true })
  transportation: string;

  @Column({ type: 'varchar', length: 500, comment: '行程图片', nullable: true })
  image: string;

  @Column({ type: 'int', comment: '排序', default: 0 })
  sortOrder: number;

  @ManyToOne(() => RoutePackage, route => route.itineraries)
  @JoinColumn({ name: 'route_id' })
  routePackage: RoutePackage;
}
