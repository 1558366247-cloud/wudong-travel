import { Controller, Get, Post, Put, Del, Body, Query, Param } from '@midwayjs/core';
import { ApiTags, ApiOperation } from '@midwayjs/swagger';
import { Inject } from '@midwayjs/core';
import { TicketTypeService } from '../service/ticket-type.service';
import { TicketTypeCreateDTO, TicketTypeUpdateDTO } from '../dto/ticket-type.dto';

@ApiTags(['票种管理'])
@Controller('/api/ticket-type')
export class TicketTypeController {
  @Inject()
  ticketTypeService: TicketTypeService;

  @ApiOperation({ summary: '票种列表' })
  @Get('/list')
  async list(
    @Query('scenicId') scenicId?: number,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    return this.ticketTypeService.list({ scenicId, page, pageSize });
  }

  @ApiOperation({ summary: '票种详情' })
  @Get('/detail/:ticketTypeId')
  async detail(@Param('ticketTypeId') ticketTypeId: number) {
    return this.ticketTypeService.detail(ticketTypeId);
  }

  @ApiOperation({ summary: '创建票种(管理后台)' })
  @Post('/create')
  async create(@Body() dto: TicketTypeCreateDTO) {
    return this.ticketTypeService.create(dto);
  }

  @ApiOperation({ summary: '更新票种(管理后台)' })
  @Put('/update')
  async update(@Body() dto: TicketTypeUpdateDTO) {
    return this.ticketTypeService.update(dto);
  }

  @ApiOperation({ summary: '上下架票种(管理后台)' })
  @Put('/status/:ticketTypeId')
  async toggleStatus(@Param('ticketTypeId') ticketTypeId: number, @Body('status') status: number) {
    return this.ticketTypeService.toggleStatus(ticketTypeId, status);
  }

  @ApiOperation({ summary: '删除票种(管理后台)' })
  @Del('/delete/:ticketTypeId')
  async delete(@Param('ticketTypeId') ticketTypeId: number) {
    return this.ticketTypeService.delete(ticketTypeId);
  }
}
