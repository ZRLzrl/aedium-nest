import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from 'src/auth/enums/role.enum';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create({
      username: new Date().toISOString(),
      ...createUserDto,
      roles: [Role.User],
    });
    await this.em.flush();
    return user;
  }

  // admin 获取所有用户
  async findAll() {
    const users = await this.userRepository.findAll({
      exclude: ['password', 'refreshToken', 'roles'],
      where: {
        roles: {
          $nin: [Role.Admin],
        },
      },
    });

    return users;
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // 获取当前用户信息
  async findMe(userId: number) {
    const user = await this.userRepository.findOne(
      { id: userId },
      {
        exclude: ['password', 'refreshToken'],
      },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findUserByEmail(email: string) {
    const user = await this.userRepository.findOne({ email });
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }
    this.userRepository.assign(user, updateUserDto);
    await this.em.flush();
    return user;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
