import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class EmailConfirmationDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
