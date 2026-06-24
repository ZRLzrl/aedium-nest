import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(18)
  password: string;

  // 刷新令牌
  @IsNotEmpty()
  @IsString()
  @IsNotEmpty()
  refreshToken?: string | null;
}
