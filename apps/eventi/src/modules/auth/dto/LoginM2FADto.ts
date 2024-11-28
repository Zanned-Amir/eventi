import { IsOptional, IsString } from 'class-validator';

export class LoginM2FADto {
  @IsString()
  mfa_token: string;

  otp: string;

  @IsOptional()
  userAgent: string;
}
