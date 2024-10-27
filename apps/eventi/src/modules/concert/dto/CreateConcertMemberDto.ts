import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateConcertMemberDto {
  @IsString()
  full_name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone_number?: string;
}
