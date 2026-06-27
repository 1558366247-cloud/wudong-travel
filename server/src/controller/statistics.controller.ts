import { Controller, Get } from '@midwayjs/core';
import { ApiTags, ApiOperation } from '@midwayjs/swagger';
import { Inject } from '@midwayjs/core';
import { StatisticsService } from '../service/statistics.service';

@ApiTags(['数据统计'])
@Controller('/api/statistics')
export class StatisticsController {
  @Inject()
  statisticsService: StatisticsService;

  @ApiOperation({ summary: '行模块数据看板(管理后台)' })
  @Get('/dashboard')
  async dashboard() {
    return this.statisticsService.dashboard();
  }
}
