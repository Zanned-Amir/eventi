import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserLoginDataDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  confirmation_token?: string;

  @IsOptional()
  @IsDate()
  token_generation_date?: Date;

  @IsOptional()
  @IsString()
  recovery_token?: string;

  @IsOptional()
  @IsDate()
  recovery_token_generation_date?: Date;

  @IsOptional()
  @IsBoolean()
  is_confirmed?: boolean;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'BLOCKED', 'DELETED'])
  account_status?: string;
}
