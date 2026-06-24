import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Req,
} from '@nestjs/common';
import { type Request } from 'express';

import { AuthService } from './auth.service';
import { Public } from './decorator/public.decorator';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 登录
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Public()
  login(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  // 注册
  @HttpCode(HttpStatus.OK)
  @Post('register')
  @Public()
  register(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto.email, signUpDto.password);
  }

  // 刷新令牌
  @Get('refresh')
  @Public()
  refreshToken(@Req() req: Request) {
    return this.authService.refreshToken(req);
  }

  // 注销
  @Get('logout')
  @ApiBearerAuth() // 添加Bearer认证
  logout(@Req() req: any) {
    return this.authService.logout(req.user);
  }
}
