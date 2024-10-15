import { IsString, IsDateString, IsNumber, IsOptional } from 'class-validator';

export class CreateConcertDto {
  @IsString()
  concert_name: string;

  @IsDateString()
  concert_date: Date;

  @IsNumber()
  venue_id: number;

  @IsOptional()
  concert_group_id?: number;
}
