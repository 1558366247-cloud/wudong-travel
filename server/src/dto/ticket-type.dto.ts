import { ApiProperty } from '@midwayjs/swagger';

export class TicketTypeListDTO {
  @ApiProperty({ required: false, description: '景区ID' })
  scenicId?: number;

  @ApiProperty({ required: false, description: '页码', default: 1 })
  page?: number = 1;

  @ApiProperty({ required: false, description: '每页数量', default: 20 })
  pageSize?: number = 20;
}

export class TicketTypeCreateDTO {
  @ApiProperty({ description: '所属景区ID' })
  scenicId: number;

  @ApiProperty({ description: '票种名称' })
  name: string;

  @ApiProperty({ description: '价格(元)' })
  price: number;

  @ApiProperty({ required: false, description: '市场价' })
  marketPrice?: number;

  @ApiProperty({ required: false, description: '库存' })
  stock?: number;

  @ApiProperty({ required: false, description: '日库存上限' })
  dailyStock?: number;

  @ApiProperty({ required: false, description: '有效期天数' })
  validityDays?: number;

  @ApiProperty({ required: false, description: '使用须知' })
  usageNote?: string;

  @ApiProperty({ required: false, description: '图片' })
  image?: string;

  @ApiProperty({ required: false, description: '排序' })
  sortOrder?: number;
}

export class TicketTypeUpdateDTO extends TicketTypeCreateDTO {
  @ApiProperty({ description: '票种ID' })
  ticketTypeId: number;

  @ApiProperty({ required: false, description: '状态' })
  status?: number;
}
