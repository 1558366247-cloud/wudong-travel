import { Controller, Get, Post, Put, Del, Body, Query, Param } from '@midwayjs/core';
import { ApiTags, ApiOperation } from '@midwayjs/swagger';
import { Inject } from '@midwayjs/core';
import { TransportGuideService } from '../service/transport-guide.service';
import { GuideCreateDTO, GuideUpdateDTO } from '../dto/transport-guide.dto';

@ApiTags(['交通攻略'])
@Controller('/api/guide')
export class TransportGuideController {
  @Inject()
  transportGuideService: TransportGuideService;

  @ApiOperation({ summary: '攻略列表' })
  @Get('/list')
  async list(
    @Query('departure') departure?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    return this.transportGuideService.list({ departure, page, pageSize });
  }

  @ApiOperation({ summary: '攻略详情' })
  @Get('/detail/:guideId')
  async detail(@Param('guideId') guideId: number) {
    return this.transportGuideService.detail(guideId);
  }

  @ApiOperation({ summary: '出发地列表' })
  @Get('/departures')
  async getDepartures() {
    return this.transportGuideService.getDepartures();
  }

  @ApiOperation({ summary: '创建攻略(管理后台)' })
  @Post('/create')
  async create(@Body() dto: GuideCreateDTO) {
    return this.transportGuideService.create(dto);
  }

  @ApiOperation({ summary: '更新攻略(管理后台)' })
  @Put('/update')
  async update(@Body() dto: GuideUpdateDTO) {
    return this.transportGuideService.update(dto);
  }

  @ApiOperation({ summary: '上下架攻略(管理后台)' })
  @Put('/status/:guideId')
  async toggleStatus(@Param('guideId') guideId: number, @Body('status') status: number) {
    return this.transportGuideService.toggleStatus(guideId, status);
  }

  @ApiOperation({ summary: '删除攻略(管理后台)' })
  @Del('/delete/:guideId')
  async delete(@Param('guideId') guideId: number) {
    return this.transportGuideService.delete(guideId);
  }
}
