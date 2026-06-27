import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { TransportGuide } from '../entity/transport-guide.entity';
import { GuideListDTO, GuideCreateDTO, GuideUpdateDTO } from '../dto/transport-guide.dto';

@Provide()
export class TransportGuideService {
  @InjectEntityModel(TransportGuide)
  guideModel: Repository<TransportGuide>;

  async list(dto: GuideListDTO) {
    const { departure, page = 1, pageSize = 10 } = dto;
    const where: any = { status: 1 };
    if (departure) where.departure = departure;

    const [list, total] = await this.guideModel.findAndCount({
      where,
      order: { sortOrder: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    return { list, total, page, pageSize };
  }

  async detail(guideId: number) {
    const guide = await this.guideModel.findOne({ where: { guideId, status: 1 } });
    if (!guide) throw new Error('攻略不存在');
    // 增加浏览量
    await this.guideModel.increment({ guideId }, 'viewCount', 1);
    return guide;
  }

  async create(dto: GuideCreateDTO) {
    const guide = this.guideModel.create(dto);
    return this.guideModel.save(guide);
  }

  async update(dto: GuideUpdateDTO) {
    const { guideId, ...data } = dto;
    await this.guideModel.update(guideId, data);
    return this.guideModel.findOne({ where: { guideId } });
  }

  async toggleStatus(guideId: number, status: number) {
    await this.guideModel.update(guideId, { status });
    return { success: true };
  }

  async delete(guideId: number) {
    await this.guideModel.delete(guideId);
    return { success: true };
  }

  /** 获取出发地列表（用于筛选） */
  async getDepartures() {
    const result = await this.guideModel
      .createQueryBuilder('g')
      .select('DISTINCT g.departure', 'departure')
      .where('g.status = 1')
      .getRawMany();
    return result.map((r: any) => r.departure);
  }
}
