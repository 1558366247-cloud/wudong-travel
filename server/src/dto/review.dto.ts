import { ApiProperty } from '@midwayjs/swagger';

export class ReviewListDTO {
  @ApiProperty({ required: false, description: '景区ID' })
  scenicId?: number;

  @ApiProperty({ required: false, description: '路线ID' })
  routeId?: number;

  @ApiProperty({ required: false, description: '页码', default: 1 })
  page?: number = 1;

  @ApiProperty({ required: false, description: '每页数量', default: 10 })
  pageSize?: number = 10;
}

export class ReviewCreateDTO {
  @ApiProperty({ description: '订单号' })
  orderNo: string;

  @ApiProperty({ required: false, description: '景区ID' })
  scenicId?: number;

  @ApiProperty({ required: false, description: '路线ID' })
  routeId?: number;

  @ApiProperty({ description: '评分 1-5' })
  rating: number;

  @ApiProperty({ description: '评价内容' })
  content: string;

  @ApiProperty({ required: false, description: '图片列表' })
  images?: string[];
}

export class ReviewReplyDTO {
  @ApiProperty({ description: '评价ID' })
  reviewId: number;

  @ApiProperty({ description: '回复内容' })
  reply: string;
}
