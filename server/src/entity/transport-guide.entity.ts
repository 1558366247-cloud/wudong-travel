import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn
} from 'typeorm';

@Entity('t_transport_guide')
export class TransportGuide {
  @PrimaryGeneratedColumn({ type: 'int', name: 'guide_id' })
  guideId: number;

  @Column({ type: 'varchar', length: 200, comment: '攻略标题' })
  title: string;

  @Column({ type: 'varchar', length: 100, comment: '出发地' })
  departure: string;

  @Column({ type: 'varchar', length: 100, comment: '目的地' })
  destination: string;

  @Column({ type: 'varchar', length: 50, comment: '交通方式(高铁/自驾/大巴/飞机)' })
  transportType: string;

  @Column({ type: 'varchar', length: 50, comment: '预估时长' })
  duration: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '预估费用(元)', nullable: true })
  estimatedCost: number;

  @Column({ type: 'text', comment: '详细说明' })
  description: string;

  @Column({ type: 'varchar', length: 500, comment: '攻略封面图' })
  coverImage: string;

  @Column({ type: 'simple-json', comment: '图片列表', nullable: true })
  images: string[];

  @Column({ type: 'int', comment: '浏览数', default: 0 })
  viewCount: number;

  @Column({ type: 'int', comment: '收藏数', default: 0 })
  favCount: number;

  @Column({ type: 'tinyint', comment: '状态 0下架 1上架', default: 1 })
  status: number;

  @Column({ type: 'int', comment: '排序', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
