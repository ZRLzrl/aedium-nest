import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { createHash, randomUUID } from 'node:crypto';
import { UsersService } from 'src/users/users.service';

import { Role } from './enums/role.enum';

const SALTORROUNDS = 10;

type JwtTokenPayload = {
  sub: number | string;
  email: string;
  iat?: number;
  exp?: number;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
  REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

  // 登录
  async signIn(
    email: string,
    pass: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.usersService.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 验证密码
    const isCompare = await bcrypt.compare(pass, user.password);
    if (!isCompare) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 生成 JWT 令牌 并返回令牌
    return await this.issueTokens(user.id, email, user.roles);
  }

  // 注册
  async signUp(
    email: string,
    pass: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.usersService.findUserByEmail(email);

    if (user) {
      throw new ConflictException('Email already exists');
    }

    // 密码加密
    const passHash = await bcrypt.hash(pass, SALTORROUNDS);

    // 创建用户
    const createUser = await this.usersService.create({
      email,
      password: passHash,
    });

    // 生成 JWT 令牌 并返回令牌
    return await this.issueTokens(createUser.id, email, createUser.roles);
  }

  // 刷新令牌
  async refreshToken(req: Request) {
    const refreshToken = this.extractTokenFromHeader(req);
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 验证刷新令牌是否有效
    const payload = await this.jwtService.verifyAsync<JwtTokenPayload>(
      refreshToken,
      {
        secret: this.REFRESH_SECRET,
      },
    );
    const userId =
      typeof payload.sub === 'string' ? Number(payload.sub) : payload.sub;
    if (!Number.isFinite(userId)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // 验证用户是否存在
    const user = await this.usersService.findOne(userId);
    if (!user.refreshToken) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 验证刷新令牌是否匹配用户刷新令牌
    const isCompare = this.hashRefreshToken(refreshToken) === user.refreshToken;
    if (!isCompare) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 生成 JWT 令牌 并返回令牌
    return await this.issueTokens(user.id, user.email, user.roles);
  }

  // 退出登录
  async logout(payload: any) {
    // 更新用户刷新令牌为空
    await this.usersService.update(payload.sub, {
      refreshToken: null,
    });
    return { statusCode: HttpStatus.OK, message: 'Logout success' };
  }

  // 生成 JWT 令牌 并返回令牌
  private async issueTokens(id: number, email: string, roles: Role[]) {
    const tokens = await this.generateTokenByUser(id, email, roles);

    // 刷新令牌加密
    const hashRefreshToken = this.hashRefreshToken(tokens.refresh_token);

    // 更新用户刷新令牌
    await this.usersService.update(id, {
      refreshToken: hashRefreshToken,
    });
    return tokens;
  }

  // 刷新令牌加密 作用：将刷新令牌转换为哈希值
  private hashRefreshToken(refreshToken: string) {
    return createHash('sha256').update(refreshToken).digest('hex');
  }

  // 生成 JWT
  private async generateTokenByUser(id: number, email: string, roles: Role[]) {
    if (!this.ACCESS_SECRET || !this.REFRESH_SECRET) {
      throw new Error('JWT_SECRET not found');
    }

    const payload = { sub: id, email: email, jti: randomUUID(), roles };
    const tokens = {
      // jwtService.signAsync 的作用：生成 JWT 令牌
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
        secret: this.ACCESS_SECRET,
      }),
      refresh_token: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: this.REFRESH_SECRET,
      }),
    };
    return tokens;
  }

  // 从请求头中提取访问令牌
  extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
