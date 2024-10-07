import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class UserAccount {
  @IsString()
  username: string;
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;
}
