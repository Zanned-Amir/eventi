import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class CreateTicketDto {
  @IsInt()
  concert_id: number;

  @IsInt()
  ticket_category_id: number;

  @IsOptional()
  @IsBoolean()
  is_used?: boolean;
}
