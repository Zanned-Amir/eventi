// find-categories.dto.ts
import { BaseFindDto } from 'apps/eventi/src/common/dto/BaseFindDto';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsInt,
  IsDate,
  IsDecimal,
} from 'class-validator';

export class FindTicketsCategoriesDto extends BaseFindDto {
  @IsOptional()
  @IsInt()
  ticket_category_id?: number;

  @IsOptional()
  @IsString()
  ticket_category_name?: string;

  @IsOptional()
  @IsString()
  ticket_category_description?: string;

  @IsOptional()
  @IsDecimal()
  price?: number;

  @IsOptional()
  @IsDecimal()
  price_gte?: number;

  @IsOptional()
  @IsDecimal()
  price_lte?: number;

  @IsOptional()
  @IsInt()
  quantity?: number;

  @IsOptional()
  @IsInt()
  quantity_gte?: number;

  @IsOptional()
  @IsInt()
  quantity_lte?: number;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  start_date?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  start_date_gte?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  start_date_lte?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  end_date?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  end_date_gte?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  end_date_lte?: Date;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsInt()
  default_quantity?: number;

  @IsOptional()
  @IsInt()
  default_quantity_gte?: number;

  @IsOptional()
  @IsInt()
  default_quantity_lte?: number;
}
