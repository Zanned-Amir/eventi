import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserTokenDto {
  user_id: number;

  @IsString()
  token: string;

  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(['ACCESS', 'REFRESH'])
  type: string;

  @IsBoolean()
  @IsOptional()
  is_in_blacklist: boolean = false;

  @IsDate()
  expires_at: Date;

  @IsString()
  device_info: string;
}
