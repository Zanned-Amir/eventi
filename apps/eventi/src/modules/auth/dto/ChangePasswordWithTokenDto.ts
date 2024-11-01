import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class ChangePasswordWithTokenDto {
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  recovery_token: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
