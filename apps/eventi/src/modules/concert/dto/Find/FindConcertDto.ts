import { BaseFindDto } from 'apps/eventi/src/common/dto/BaseFindDto';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsInt,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class FindConcertsDto extends BaseFindDto {
  @IsOptional()
  @IsString()
  concert_name?: string;

  @IsOptional()
  @IsString()
  artist_name?: string;

  @IsOptional()
  @IsString()
  genre_name?: string;

  @IsOptional()
  @IsString()
  venue_name?: string;

  @IsOptional()
  @IsString()
  venue_location?: string;

  @IsOptional()
  @IsInt()
  venue_capacity?: number;

  @IsOptional()
  @IsInt()
  venue_capacity_gte?: number;

  @IsOptional()
  @IsInt()
  venue_capacity_lte?: number;
  @IsOptional()
  @IsString()
  venue_type?: string;

  @IsOptional()
  @IsString()
  venue_email?: string;

  @IsOptional()
  @IsString()
  venue_phone_number?: string;

  @IsOptional()
  @IsString()
  concert_group_name?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDateString()
  concert_available_from?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDateString()
  concert_available_from_gte?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDateString()
  concert_available_from_lte?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDateString()
  concert_start_date?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDateString()
  concert_start_date_gte?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDateString()
  concert_start_date_lte?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDateString()
  concert_end_date?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDateString()
  concert_end_date_gte?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDateString()
  concert_end_date_lte?: Date;
}
