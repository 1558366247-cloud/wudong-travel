import { Controller, Get, Post, Put, Body, Query, Param } from '@midwayjs/core';
import { ApiTags, ApiOperation } from '@midwayjs/swagger';
import { Inject } from '@midwayjs/core';
import { ReviewService } from '../service/review.service';
import { ReviewCreateDTO, ReviewReplyDTO } from '../dto/review.dto';

@ApiTags(['评价管理'])
@Controller('/api/review')
export class ReviewController {
  @Inject()
  reviewService: ReviewService;

  @ApiOperation({ summary: '评价列表' })
  @Get('/list')
  async list(
    @Query('scenicId') scenicId?: number,
    @Query('routeId') routeId?: number,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    return this.reviewService.list({ scenicId, routeId, page, pageSize });
  }

  @ApiOperation({ summary: '发表评价' })
  @Post('/create')
  async create(@Body() dto: ReviewCreateDTO) {
    // userId, userName, userAvatar 从 JWT 获取
    return this.reviewService.create(1, '游客用户', '', dto);
  }

  @ApiOperation({ summary: '商家回复评价(管理后台)' })
  @Put('/reply')
  async reply(@Body() dto: ReviewReplyDTO) {
    return this.reviewService.reply(dto);
  }

  @ApiOperation({ summary: '隐藏/显示评价(管理后台)' })
  @Put('/status/:reviewId')
  async toggleStatus(@Param('reviewId') reviewId: number, @Body('status') status: number) {
    return this.reviewService.toggleStatus(reviewId, status);
  }
}
