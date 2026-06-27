import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn
} from 'typeorm';
import { ScenicSpot } from './scenic-spot.entity';
import { RoutePackage } from './route-package.entity';

@Entity('t_review')
export class Review {
  @PrimaryGeneratedColumn({ type: 'int', name: 'review_id' })
  reviewId: number;

  @Column({ type: 'varchar', length: 32, comment: '订单号' })
  orderNo: string;

  @Column({ type: 'int', comment: '用户ID' })
  userId: number;

  @Column({ type: 'varchar', length: 50, comment: '用户昵称' })
  userName: string;

  @Column({ type: 'varchar', length: 200, comment: '用户头像', nullable: true })
  userAvatar: string;

  @Column({ type: 'int', name: 'scenic_id', comment: '景区ID', nullable: true })
  scenicId: number;

  @Column({ type: 'int', name: 'route_id', comment: '路线ID', nullable: true })
  routeId: number;

  @Column({ type: 'tinyint', comment: '评分 1-5' })
  rating: number;

  @Column({ type: 'text', comment: '评价内容' })
  content: string;

  @Column({ type: 'simple-json', comment: '图片列表', nullable: true })
  images: string[];

  @Column({ type: 'text', comment: '商家回复', nullable: true })
  reply: string;

  @Column({ type: 'datetime', comment: '回复时间', nullable: true })
  replyAt: Date;

  @Column({ type: 'tinyint', comment: '状态 0隐藏 1显示', default: 1 })
  status: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @ManyToOne(() => ScenicSpot, scenic => scenic.reviews)
  @JoinColumn({ name: 'scenic_id' })
  scenicSpot: ScenicSpot;

  @ManyToOne(() => RoutePackage, route => route.reviews)
  @JoinColumn({ name: 'route_id' })
  routePackage: RoutePackage;
}
