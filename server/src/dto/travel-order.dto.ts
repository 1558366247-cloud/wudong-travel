import { ApiProperty } from '@midwayjs/swagger';

export class OrderListDTO {
  @ApiProperty({ required: false, description: '订单类型: ticket/route' })
  orderType?: string;

  @ApiProperty({ required: false, description: '订单状态' })
  orderStatus?: string;

  @ApiProperty({ required: false, description: '页码', default: 1 })
  page?: number = 1;

  @ApiProperty({ required: false, description: '每页数量', default: 10 })
  pageSize?: number = 10;
}

export class CreateTicketOrderDTO {
  @ApiProperty({ description: '票种ID' })
  ticketTypeId: number;

  @ApiProperty({ description: '购买数量' })
  quantity: number;

  @ApiProperty({ description: '使用日期 (YYYY-MM-DD)' })
  useDate: string;

  @ApiProperty({ description: '游客信息JSON: [{"name":"","idCard":"","phone":""}]' })
  visitors: string;

  @ApiProperty({ description: '联系人手机' })
  contactPhone: string;
}

export class CreateRouteOrderDTO {
  @ApiProperty({ description: '路线ID' })
  routeId: number;

  @ApiProperty({ description: '出行人数' })
  quantity: number;

  @ApiProperty({ description: '出发日期 (YYYY-MM-DD)' })
  useDate: string;

  @ApiProperty({ description: '游客信息JSON' })
  visitors: string;

  @ApiProperty({ description: '联系人手机' })
  contactPhone: string;
}

export class RefundDTO {
  @ApiProperty({ description: '订单号' })
  orderNo: string;

  @ApiProperty({ description: '退款原因' })
  reason: string;
}

export class VerifyTicketDTO {
  @ApiProperty({ description: '电子票号/二维码内容' })
  qrCode: string;
}
