import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToMany, Index
} from 'typeorm';
import { TicketType } from './ticket-type.entity';
import { Review } from './review.entity';

@Entity('t_scenic_spot')
export class ScenicSpot {
  @PrimaryGeneratedColumn({ type: 'int', name: 'scenic_id' })
  scenicId: number;

  @Column({ type: 'varchar', length: 100, comment: '景区名称' })
  @Index()
  name: string;

  @Column({ type: 'varchar', length: 255, comment: '景区地址' })
  address: string;

  @Column({ type: 'varchar', length: 100, comment: '经度', nullable: true })
  longitude: string;

  @Column({ type: 'varchar', length: 100, comment: '纬度', nullable: true })
  latitude: string;

  @Column({ type: 'varchar', length: 100, comment: '开放时间', default: '08:00-18:00' })
  openTime: string;

  @Column({ type: 'text', comment: '景区介绍', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, comment: '主图URL' })
  mainImage: string;

  @Column({ type: 'simple-json', comment: '图片列表', nullable: true })
  images: string[];

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

  @OneToMany(() => TicketType, ticket => ticket.scenicSpot)
  ticketTypes: TicketType[];

  @OneToMany(() => Review, review => review.scenicSpot)
  reviews: Review[];
}
