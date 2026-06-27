import { Controller, Get, Post, Put, Del, Body, Query, Param } from '@midwayjs/core';
import { ApiTags, ApiOperation } from '@midwayjs/swagger';
import { Inject } from '@midwayjs/core';
import { RoutePackageService } from '../service/route-package.service';
import { RouteCreateDTO, RouteUpdateDTO, RouteItineraryDTO } from '../dto/route-package.dto';

@ApiTags(['路线套餐'])
@Controller('/api/route')
export class RoutePackageController {
  @Inject()
  routePackageService: RoutePackageService;

  @ApiOperation({ summary: '路线列表(前台)' })
  @Get('/list')
  async list(
    @Query('duration') duration?: string,
    @Query('theme') theme?: string,
    @Query('keyword') keyword?: string,
    @Query('sortBy') sortBy?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    return this.routePackageService.list({ duration, theme, keyword, sortBy, page, pageSize });
  }

  @ApiOperation({ summary: '路线详情(前台)' })
  @Get('/detail/:routeId')
  async detail(@Param('routeId') routeId: number) {
    return this.routePackageService.detail(routeId);
  }

  @ApiOperation({ summary: '创建路线(管理后台)' })
  @Post('/create')
  async create(@Body() dto: RouteCreateDTO) {
    return this.routePackageService.create(dto);
  }

  @ApiOperation({ summary: '更新路线(管理后台)' })
  @Put('/update')
  async update(@Body() dto: RouteUpdateDTO) {
    return this.routePackageService.update(dto);
  }

  @ApiOperation({ summary: '上下架路线(管理后台)' })
  @Put('/status/:routeId')
  async toggleStatus(@Param('routeId') routeId: number, @Body('status') status: number) {
    return this.routePackageService.toggleStatus(routeId, status);
  }

  @ApiOperation({ summary: '删除路线(管理后台)' })
  @Del('/delete/:routeId')
  async delete(@Param('routeId') routeId: number) {
    return this.routePackageService.delete(routeId);
  }

  @ApiOperation({ summary: '保存行程安排(管理后台)' })
  @Post('/itineraries/:routeId')
  async saveItineraries(@Param('routeId') routeId: number, @Body() itineraries: RouteItineraryDTO[]) {
    return this.routePackageService.saveItineraries(routeId, itineraries);
  }

  @ApiOperation({ summary: '获取行程安排' })
  @Get('/itineraries/:routeId')
  async getItineraries(@Param('routeId') routeId: number) {
    return this.routePackageService.getItineraries(routeId);
  }
}
