import { OptionalProps } from '@mikro-orm/core';
import {
  Entity,
  PrimaryKey,
  Property,
  Enum,
  ManyToOne,
} from '@mikro-orm/decorators/legacy';

import { User } from '../../users/entities/user.entity';

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity()
export class Article {
  // 可选属性
  [OptionalProps]?: 'createdAt' | 'updatedAt';

  @PrimaryKey()
  id: number;

  @Property()
  title!: string;

  @Property({ type: 'text' })
  content!: string;

  @Enum(() => ArticleStatus)
  status!: ArticleStatus;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  // 关联用户 多篇文章可以属于一个用户
  @ManyToOne(() => User)
  author: User;
}
