import { IsString, IsDateString, IsNumber, IsOptional } from 'class-validator';

export class CreateConcertDto {
  @IsString()
  concert_name: string;

  @IsNumber()
  venue_id: number;

  @IsOptional()
  concert_group_id?: number;

  @IsOptional()
  @IsDateString()
  concert_start_date?: string;

  @IsOptional()
  @IsDateString()
  concert_end_date?: string;
}
