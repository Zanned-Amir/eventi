import { BaseFindDto } from 'apps/eventi/src/common/dto/BaseFindDto';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsDate,
} from 'class-validator';

export class FindUsersDto extends BaseFindDto {
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
  @IsEnum(['ACTIVE', 'INACTIVE', 'BLOCKED', 'DELETED'], {
    message:
      'Account status must be either ACTIVE, INACTIVE, BLOCKED or DELETED',
  })
  account_status?: string;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  birth_date?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  birth_date_gte?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  birth_date_lte?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  birth_date_gt?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  birth_date_lt?: Date;
}
