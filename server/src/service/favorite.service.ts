import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite, FavoriteTargetType } from '../entity/favorite.entity';

@Provide()
export class FavoriteService {
  @InjectEntityModel(Favorite)
  favModel: Repository<Favorite>;

  /** 收藏/取消收藏 */
  async toggle(userId: number, targetType: FavoriteTargetType, targetId: number) {
    const existing = await this.favModel.findOne({
      where: { userId, targetType, targetId }
    });
    if (existing) {
      await this.favModel.remove(existing);
      return { favorited: false };
    }
    await this.favModel.save({ userId, targetType, targetId });
    return { favorited: true };
  }

  /** 我的收藏列表 */
  async list(userId: number, targetType?: FavoriteTargetType, page = 1, pageSize = 10) {
    const where: any = { userId };
    if (targetType) where.targetType = targetType;

    const [list, total] = await this.favModel.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    return { list, total, page, pageSize };
  }

  /** 检查是否已收藏 */
  async isFavorited(userId: number, targetType: FavoriteTargetType, targetId: number) {
    const existing = await this.favModel.findOne({ where: { userId, targetType, targetId } });
    return { favorited: !!existing };
  }
}
