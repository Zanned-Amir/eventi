import { Optional } from '@nestjs/common';
import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class LoginRequestDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  @IsString()
  password: string;

  @Optional()
  user_id?: number;
}
