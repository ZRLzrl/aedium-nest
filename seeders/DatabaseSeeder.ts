import { faker } from '@faker-js/faker';
import { Seeder } from '@mikro-orm/seeder';
import bcrypt from 'bcrypt';
import { Role } from 'src/auth/enums/role.enum';

import { ArticleFactory } from './ArticleFactory';
import { UserFactory } from './UserFactory';

import type { EntityManager } from '@mikro-orm/core';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    new UserFactory(em)
      .each((user) => {
        const articleCount = faker.number.int({ min: 0, max: 3 });
        if (!articleCount) {
          return;
        }
        user.articles.set(new ArticleFactory(em).make(articleCount));
      })
      .make(10);

    // 添加管理员
    const USERNAME = 'admin';
    const ADMIN_PASSWORD = '123456';
    const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
    new UserFactory(em).makeOne({
      username: USERNAME,
      password,
      email: USERNAME + '@example.com',
      roles: [Role.Admin],
    });
  }
}
