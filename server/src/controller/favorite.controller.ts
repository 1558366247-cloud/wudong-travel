import { Controller, Get, Post, Query, Param, Body } from '@midwayjs/core';
import { ApiTags, ApiOperation } from '@midwayjs/swagger';
import { Inject } from '@midwayjs/core';
import { FavoriteService } from '../service/favorite.service';
import { FavoriteTargetType } from '../entity/favorite.entity';

@ApiTags(['收藏'])
@Controller('/api/favorite')
export class FavoriteController {
  @Inject()
  favoriteService: FavoriteService;

  @ApiOperation({ summary: '收藏/取消收藏' })
  @Post('/toggle')
  async toggle(@Body() body: { targetType: FavoriteTargetType; targetId: number }) {
    const userId = 1; // TODO: JWT
    return this.favoriteService.toggle(userId, body.targetType, body.targetId);
  }

  @ApiOperation({ summary: '我的收藏列表' })
  @Get('/list')
  async list(
    @Query('targetType') targetType?: FavoriteTargetType,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    const userId = 1;
    return this.favoriteService.list(userId, targetType, page, pageSize);
  }

  @ApiOperation({ summary: '检查是否已收藏' })
  @Get('/check')
  async isFavorited(
    @Query('targetType') targetType: FavoriteTargetType,
    @Query('targetId') targetId: number
  ) {
    const userId = 1;
    return this.favoriteService.isFavorited(userId, targetType, targetId);
  }
}
