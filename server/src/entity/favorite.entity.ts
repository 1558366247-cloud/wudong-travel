import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum FavoriteTargetType {
  SCENIC = 'scenic',
  ROUTE = 'route',
  GUIDE = 'guide'
}

@Entity('t_favorite')
@Index(['userId', 'targetType', 'targetId'], { unique: true })
export class Favorite {
  @PrimaryGeneratedColumn({ type: 'int', name: 'fav_id' })
  favId: number;

  @Column({ type: 'int', comment: '用户ID' })
  userId: number;

  @Column({ type: 'enum', enum: FavoriteTargetType, comment: '收藏目标类型' })
  targetType: FavoriteTargetType;

  @Column({ type: 'int', comment: '收藏目标ID' })
  targetId: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
