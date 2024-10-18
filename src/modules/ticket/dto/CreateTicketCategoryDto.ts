import {
  IsDateString,
  IsInt,
  IsString,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateTicketCategoryDto {
  @IsInt()
  concert_id: number;

  @IsString()
  ticket_category_name: string;

  @IsOptional()
  @IsString()
  ticket_category_description?: string;

  @IsNumber({}, { message: 'Price must be a number' })
  price: number;

  @IsOptional()
  @IsDateString()
  start_date?: Date;

  @IsOptional()
  @IsDateString()
  end_date?: Date;

  @IsString()
  area: string;

  @IsOptional()
  @IsInt()
  quantity?: number;
}
