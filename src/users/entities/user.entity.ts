import { Collection } from '@mikro-orm/core';
import {
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
  Enum,
} from '@mikro-orm/decorators/legacy';
import { Article } from 'src/articles/entities/article.entity';
import { Role } from 'src/auth/enums/role.enum';

@Entity()
export class User {
  @PrimaryKey()
  id: number;

  @Property({ unique: true })
  username!: string;

  @Property({ unique: true })
  email!: string;

  @Property({ type: 'text' })
  password!: string;

  // 关联文章 一个用户可以写多篇文章
  @OneToMany(() => Article, (article) => article.author, { nullable: true })
  articles = new Collection<Article>(this);

  // 刷新令牌
  @Property({ type: 'text', nullable: true })
  refreshToken?: string | null;

  // @Enum({ default: [Role.User], array: true })
  // roles: Role[] = [Role.User];
  @Enum({ items: () => Role, array: true, default: [Role.User] })
  roles: Role[] = [Role.User];
}
