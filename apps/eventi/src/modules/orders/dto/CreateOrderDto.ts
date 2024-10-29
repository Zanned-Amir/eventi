import { IsArray, ValidateNested, Min, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Ticket)
  tickets: Ticket[];
  @IsString()
  delivery_address: string;
  @IsString()
  delivery_email_address: string;
}

class Ticket {
  @IsInt()
  @Min(1)
  ticket_category_id: number;

  @IsInt()
  @Min(1)
  concert_id: number;

  @IsInt()
  @Min(1)
  quantity: number;
}
