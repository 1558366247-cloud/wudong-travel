import { ApiProperty } from '@midwayjs/swagger';

export class RouteListDTO {
  @ApiProperty({ required: false, description: '行程天数: 一日游/两日游/多日游' })
  duration?: string;

  @ApiProperty({ required: false, description: '主题: 亲子/摄影/研学/节庆' })
  theme?: string;

  @ApiProperty({ required: false, description: '页码', default: 1 })
  page?: number = 1;

  @ApiProperty({ required: false, description: '每页数量', default: 10 })
  pageSize?: number = 10;

  @ApiProperty({ required: false, description: '关键词' })
  keyword?: string;

  @ApiProperty({ required: false, description: '排序: default/price_asc/price_desc/rating' })
  sortBy?: string = 'default';
}

export class RouteCreateDTO {
  @ApiProperty({ description: '路线标题' })
  title: string;

  @ApiProperty({ required: false, description: '副标题' })
  subtitle?: string;

  @ApiProperty({ description: '行程天数' })
  duration: string;

  @ApiProperty({ required: false, description: '主题标签(逗号分隔)' })
  themes?: string;

  @ApiProperty({ description: '套餐价格(元/人)' })
  price: number;

  @ApiProperty({ required: false, description: '市场价' })
  marketPrice?: number;

  @ApiProperty({ required: false, description: '包含项目(JSON)' })
  includedItems?: string;

  @ApiProperty({ description: '出发地' })
  departure: string;

  @ApiProperty({ description: '目的地' })
  destination: string;

  @ApiProperty({ required: false, description: '住宿标准' })
  accommodationStandard?: string;

  @ApiProperty({ required: false, description: '餐饮标准' })
  mealStandard?: string;

  @ApiProperty({ required: false, description: '注意事项' })
  notes?: string;

  @ApiProperty({ description: '主图URL' })
  mainImage: string;

  @ApiProperty({ required: false, description: '图片列表' })
  images?: string[];

  @ApiProperty({ description: '路线详情(富文本)' })
  details: string;

  @ApiProperty({ required: false, description: '库存(每团人数上限)' })
  stock?: number;

  @ApiProperty({ required: false, description: '排序' })
  sortOrder?: number;
}

export class RouteUpdateDTO extends RouteCreateDTO {
  @ApiProperty({ description: '路线ID' })
  routeId: number;

  @ApiProperty({ required: false, description: '状态' })
  status?: number;
}

export class RouteItineraryDTO {
  @ApiProperty({ description: '第几天' })
  day: number;

  @ApiProperty({ description: '当日行程描述' })
  description: string;

  @ApiProperty({ required: false, description: '景点列表' })
  spots?: string;

  @ApiProperty({ required: false, description: '用餐安排' })
  meals?: string;

  @ApiProperty({ required: false, description: '住宿安排' })
  accommodation?: string;

  @ApiProperty({ required: false, description: '交通方式' })
  transportation?: string;

  @ApiProperty({ required: false, description: '行程图片' })
  image?: string;
}
