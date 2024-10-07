import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  Min,
  IsInt,
} from 'class-validator';

export class FindUsersDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsEnum(['M', 'F'], { message: 'Gender must be M or F' })
  gender?: 'M' | 'F';

  @IsOptional()
  @IsString()
  role_name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsBoolean()
  is_confirmed?: boolean;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'BLOCKED', 'DELETED'])
  account_status?: string;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  birth_date?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  birth_date_gte?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  birth_date_lte?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  birth_date_gt?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  birth_date_lt?: Date;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  @Min(0)
  offset: number = 0; // Default to 0

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  @Min(1)
  limit: number = 10; // Default to 10

  @IsOptional()
  @IsEnum(['ASC', 'DESC'], {
    each: true,
    message: 'Order must be either ASC or DESC',
  })
  orderBy?: { [key: string]: 'ASC' | 'DESC' };

  rawQuery: boolean = false;
}
