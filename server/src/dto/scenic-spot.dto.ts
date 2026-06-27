import { ApiProperty } from '@midwayjs/swagger';

export class ScenicSpotListDTO {
  @ApiProperty({ required: false, description: '页码', default: 1 })
  page?: number = 1;

  @ApiProperty({ required: false, description: '每页数量', default: 10 })
  pageSize?: number = 10;

  @ApiProperty({ required: false, description: '关键词搜索' })
  keyword?: string;

  @ApiProperty({ required: false, description: '排序: default/price_asc/price_desc/rating' })
  sortBy?: string = 'default';
}

export class ScenicSpotCreateDTO {
  @ApiProperty({ description: '景区名称' })
  name: string;

  @ApiProperty({ description: '景区地址' })
  address: string;

  @ApiProperty({ required: false, description: '经度' })
  longitude?: string;

  @ApiProperty({ required: false, description: '纬度' })
  latitude?: string;

  @ApiProperty({ required: false, description: '开放时间' })
  openTime?: string;

  @ApiProperty({ required: false, description: '景区介绍' })
  description?: string;

  @ApiProperty({ description: '主图URL' })
  mainImage: string;

  @ApiProperty({ required: false, description: '图片列表' })
  images?: string[];

  @ApiProperty({ required: false, description: '排序' })
  sortOrder?: number;
}

export class ScenicSpotUpdateDTO extends ScenicSpotCreateDTO {
  @ApiProperty({ description: '景区ID' })
  scenicId: number;

  @ApiProperty({ required: false, description: '状态 0下架 1上架' })
  status?: number;
}
