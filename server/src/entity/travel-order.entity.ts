import {
  Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index
} from 'typeorm';

export enum OrderType {
  TICKET = 'ticket',
  ROUTE = 'route'
}

export enum OrderStatus {
  PENDING_PAY = 'pending_pay',
  PAID = 'paid',
  REFUNDING = 'refunding',
  REFUNDED = 'refunded',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Entity('t_travel_order')
export class TravelOrder {
  @PrimaryColumn({ type: 'varchar', length: 32, comment: '订单号' })
  orderNo: string;

  @Column({ type: 'int', comment: '用户ID' })
  @Index()
  userId: number;

  @Column({ type: 'enum', enum: OrderType, comment: '订单类型: ticket-门票 route-路线' })
  orderType: OrderType;

  @Column({ type: 'int', comment: '景区/路线ID' })
  targetId: number;

  @Column({ type: 'varchar', length: 200, comment: '商品名称' })
  targetName: string;

  @Column({ type: 'varchar', length: 500, comment: '商品图片' })
  targetImage: string;

  @Column({ type: 'int', comment: '票种ID', nullable: true })
  ticketTypeId: number;

  @Column({ type: 'varchar', length: 50, comment: '票种名称', nullable: true })
  ticketTypeName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '单价(元)' })
  unitPrice: number;

  @Column({ type: 'int', comment: '数量(人数)' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '总金额(元)' })
  totalAmount: number;

  @Column({ type: 'date', comment: '使用/出发日期' })
  useDate: string;

  @Column({ type: 'varchar', length: 500, comment: '游客信息(JSON)' })
  visitors: string;

  @Column({ type: 'varchar', length: 20, comment: '联系人手机' })
  contactPhone: string;

  @Column({
    type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING_PAY,
    comment: '订单状态'
  })
  orderStatus: OrderStatus;

  @Column({ type: 'datetime', comment: '支付时间', nullable: true })
  paidAt: Date;

  @Column({ type: 'varchar', length: 64, comment: '微信支付交易号', nullable: true })
  transactionId: string;

  @Column({ type: 'varchar', length: 500, comment: '退款原因', nullable: true })
  refundReason: string;

  @Column({ type: 'datetime', comment: '退款时间', nullable: true })
  refundedAt: Date;

  @Column({ type: 'tinyint', comment: '核销状态 0未核销 1已核销', default: 0 })
  verified: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
