import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entity/review.entity';
import { ReviewListDTO, ReviewCreateDTO, ReviewReplyDTO } from '../dto/review.dto';

@Provide()
export class ReviewService {
  @InjectEntityModel(Review)
  reviewModel: Repository<Review>;

  /** 评价列表 */
  async list(dto: ReviewListDTO) {
    const { scenicId, routeId, page = 1, pageSize = 10 } = dto;
    const where: any = { status: 1 };
    if (scenicId) where.scenicId = scenicId;
    if (routeId) where.routeId = routeId;

    const [list, total] = await this.reviewModel.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    return { list, total, page, pageSize };
  }

  /** 创建评价 */
  async create(userId: number, userName: string, userAvatar: string, dto: ReviewCreateDTO) {
    const review = this.reviewModel.create({ ...dto, userId, userName, userAvatar });
    return this.reviewModel.save(review);
  }

  /** 商家回复 */
  async reply(dto: ReviewReplyDTO) {
    await this.reviewModel.update(dto.reviewId, {
      reply: dto.reply,
      replyAt: new Date()
    });
    return { success: true };
  }

  /** 隐藏/显示评价 */
  async toggleStatus(reviewId: number, status: number) {
    await this.reviewModel.update(reviewId, { status });
    return { success: true };
  }
}
