import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class LoginRequestDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  @IsString()
  password: string;

  @IsOptional()
  user_id?: number;

  @IsOptional()
  userAgent: string;

  @IsOptional()
  @IsBoolean()
  enabled_m2fa: boolean;

  is_confirmed: boolean = false;
}
