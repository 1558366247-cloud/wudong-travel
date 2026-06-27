import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, OneToMany
} from 'typeorm';
import { ScenicSpot } from './scenic-spot.entity';
import { ETicket } from './e-ticket.entity';

@Entity('t_ticket_type')
export class TicketType {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ticket_type_id' })
  ticketTypeId: number;

  @Column({ type: 'int', name: 'scenic_id', comment: '所属景区ID' })
  scenicId: number;

  @Column({ type: 'varchar', length: 50, comment: '票种名称(成人票/儿童票/学生票/家庭套票)' })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '价格(元)' })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '市场价(元)', nullable: true })
  marketPrice: number;

  @Column({ type: 'int', comment: '库存', default: 999 })
  stock: number;

  @Column({ type: 'int', comment: '日库存上限', default: 500 })
  dailyStock: number;

  @Column({ type: 'int', comment: '有效期天数(购买日起)', default: 30 })
  validityDays: number;

  @Column({ type: 'varchar', length: 500, comment: '使用须知', nullable: true })
  usageNote: string;

  @Column({ type: 'varchar', length: 500, comment: '票种图片', nullable: true })
  image: string;

  @Column({ type: 'tinyint', comment: '状态 0下架 1上架', default: 1 })
  status: number;

  @Column({ type: 'int', comment: '排序', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @ManyToOne(() => ScenicSpot, scenic => scenic.ticketTypes)
  @JoinColumn({ name: 'scenic_id' })
  scenicSpot: ScenicSpot;

  @OneToMany(() => ETicket, ticket => ticket.ticketType)
  eTickets: ETicket[];
}
