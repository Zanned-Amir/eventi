import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateTicketDto {
  @IsInt()
  concert_id: number;

  @IsInt()
  ticket_category_id: number;

  @IsString()
  ticket_code: string;

  @IsOptional()
  @IsBoolean()
  is_used: boolean;
}
