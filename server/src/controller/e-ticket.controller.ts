import { Controller, Get, Query, Param } from '@midwayjs/core';
import { ApiTags, ApiOperation } from '@midwayjs/swagger';
import { Inject } from '@midwayjs/core';
import { ETicketService } from '../service/e-ticket.service';

@ApiTags(['电子票'])
@Controller('/api/e-ticket')
export class ETicketController {
  @Inject()
  eTicketService: ETicketService;

  @ApiOperation({ summary: '我的电子票列表' })
  @Get('/list')
  async list(@Query('status') status?: string) {
    const userId = 1; // TODO: 从 JWT 解析
    return this.eTicketService.listByUser(userId, status);
  }

  @ApiOperation({ summary: '电子票详情(含二维码)' })
  @Get('/detail/:eTicketId')
  async detail(@Param('eTicketId') eTicketId: number) {
    const userId = 1;
    return this.eTicketService.detail(eTicketId, userId);
  }
}
