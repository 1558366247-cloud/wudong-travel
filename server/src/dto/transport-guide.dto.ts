import { ApiProperty } from '@midwayjs/swagger';

export class GuideListDTO {
  @ApiProperty({ required: false, description: '出发地' })
  departure?: string;

  @ApiProperty({ required: false, description: '页码', default: 1 })
  page?: number = 1;

  @ApiProperty({ required: false, description: '每页数量', default: 10 })
  pageSize?: number = 10;
}

export class GuideCreateDTO {
  @ApiProperty({ description: '标题' })
  title: string;

  @ApiProperty({ description: '出发地' })
  departure: string;

  @ApiProperty({ description: '目的地' })
  destination: string;

  @ApiProperty({ description: '交通方式' })
  transportType: string;

  @ApiProperty({ description: '预估时长' })
  duration: string;

  @ApiProperty({ required: false, description: '预估费用' })
  estimatedCost?: number;

  @ApiProperty({ description: '详细说明' })
  description: string;

  @ApiProperty({ description: '封面图' })
  coverImage: string;

  @ApiProperty({ required: false, description: '图片列表' })
  images?: string[];

  @ApiProperty({ required: false, description: '排序' })
  sortOrder?: number;
}

export class GuideUpdateDTO extends GuideCreateDTO {
  @ApiProperty({ description: '攻略ID' })
  guideId: number;

  @ApiProperty({ required: false, description: '状态' })
  status?: number;
}
