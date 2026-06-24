import { faker } from '@faker-js/faker';
import { Factory } from '@mikro-orm/seeder';
import { Role } from 'src/auth/enums/role.enum';

import { User } from '../src/users/entities/user.entity';

export class UserFactory extends Factory<User> {
  model = User;

  definition(): Partial<User> {
    return {
      username: faker.person.fullName(),
      password: faker.internet.password(),
      email: faker.internet.email(),
      roles: [Role.User],
    };
  }
}
