import { Controller, Get, Post, Put, Del, Body, Query, Param } from '@midwayjs/core';
import { ApiTags, ApiOperation, ApiQuery } from '@midwayjs/swagger';
import { Inject } from '@midwayjs/core';
import { ScenicSpotService } from '../service/scenic-spot.service';
import { ScenicSpotCreateDTO, ScenicSpotUpdateDTO } from '../dto/scenic-spot.dto';

@ApiTags(['景区管理'])
@Controller('/api/scenic')
export class ScenicSpotController {
  @Inject()
  scenicSpotService: ScenicSpotService;

  @ApiOperation({ summary: '景区列表(前台)' })
  @Get('/list')
  async list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('keyword') keyword?: string,
    @Query('sortBy') sortBy?: string
  ) {
    return this.scenicSpotService.list({ page, pageSize, keyword, sortBy });
  }

  @ApiOperation({ summary: '景区详情(前台)' })
  @Get('/detail/:scenicId')
  async detail(@Param('scenicId') scenicId: number) {
    return this.scenicSpotService.detail(scenicId);
  }

  @ApiOperation({ summary: '创建景区(管理后台)' })
  @Post('/create')
  async create(@Body() dto: ScenicSpotCreateDTO) {
    return this.scenicSpotService.create(dto);
  }

  @ApiOperation({ summary: '更新景区(管理后台)' })
  @Put('/update')
  async update(@Body() dto: ScenicSpotUpdateDTO) {
    return this.scenicSpotService.update(dto);
  }

  @ApiOperation({ summary: '上下架景区(管理后台)' })
  @Put('/status/:scenicId')
  async toggleStatus(@Param('scenicId') scenicId: number, @Body('status') status: number) {
    return this.scenicSpotService.toggleStatus(scenicId, status);
  }

  @ApiOperation({ summary: '删除景区(管理后台)' })
  @Del('/delete/:scenicId')
  async delete(@Param('scenicId') scenicId: number) {
    return this.scenicSpotService.delete(scenicId);
  }
}
