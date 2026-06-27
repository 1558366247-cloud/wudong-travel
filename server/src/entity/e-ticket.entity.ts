import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn
} from 'typeorm';
import { TicketType } from './ticket-type.entity';
import { RoutePackage } from './route-package.entity';

export enum ETicketStatus {
  UNUSED = 'unused',
  USED = 'used',
  REFUNDED = 'refunded',
  EXPIRED = 'expired'
}

@Entity('t_e_ticket')
export class ETicket {
  @PrimaryGeneratedColumn({ type: 'int', name: 'e_ticket_id' })
  eTicketId: number;

  @Column({ type: 'varchar', length: 32, comment: '统一订单号' })
  orderNo: string;

  @Column({ type: 'int', name: 'ticket_type_id', comment: '票种ID', nullable: true })
  ticketTypeId: number;

  @Column({ type: 'int', name: 'route_id', comment: '路线ID', nullable: true })
  routeId: number;

  @Column({ type: 'int', comment: '用户ID' })
  userId: number;

  @Column({ type: 'varchar', length: 100, comment: '二维码内容(票号)' })
  qrCode: string;

  @Column({ type: 'date', comment: '使用日期' })
  useDate: string;

  @Column({ type: 'date', comment: '有效期截止' })
  expireDate: string;

  @Column({ type: 'varchar', length: 50, comment: '游客姓名' })
  visitorName: string;

  @Column({ type: 'varchar', length: 20, comment: '游客身份证号', nullable: true })
  visitorIdCard: string;

  @Column({ type: 'varchar', length: 20, comment: '游客手机号', nullable: true })
  visitorPhone: string;

  @Column({
    type: 'enum', enum: ETicketStatus, default: ETicketStatus.UNUSED,
    comment: '状态: unused-未使用 used-已使用 refunded-已退款 expired-已过期'
  })
  status: ETicketStatus;

  @Column({ type: 'datetime', comment: '核销时间', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'int', comment: '核销人ID', nullable: true })
  verifiedBy: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @ManyToOne(() => TicketType, ticket => ticket.eTickets)
  @JoinColumn({ name: 'ticket_type_id' })
  ticketType: TicketType;

  @ManyToOne(() => RoutePackage, route => route.eTickets)
  @JoinColumn({ name: 'route_id' })
  routePackage: RoutePackage;
}
