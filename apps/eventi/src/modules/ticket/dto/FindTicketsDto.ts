import { BaseFindDto } from 'apps/eventi/src/common/dto/BaseFindDto';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  IsDate,
  IsDecimal,
} from 'class-validator';

export class FindTicketsDto extends BaseFindDto {
  // Optional filters for ticket code (case insensitive)
  @IsOptional()
  @IsString()
  ticket_code?: string;

  // Optional filter for whether the ticket is used or not
  @IsOptional()
  @IsBoolean()
  is_used?: boolean;

  // Optional filter for concert ID
  @IsOptional()
  @IsInt()
  concert_id?: number;

  // Optional filter for ticket ID
  @IsOptional()
  @IsInt()
  ticket_id?: number;

  // Optional filter for ticket category ID
  @IsOptional()
  @IsInt()
  ticket_category_id?: number;

  // Optional date filter for tickets created after a certain date

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  start_date?: string;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  start_date_gte?: string;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  start_date_lte?: string;

  // Optional date filter for tickets created before a certain date
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  end_date?: string;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  end_date_gte?: string;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  end_date_lte?: string;

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
  @IsString()
  area?: string;
}
