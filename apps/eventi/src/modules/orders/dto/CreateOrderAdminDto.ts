import { IsDecimal, IsEnum, IsString, Max, Min } from 'class-validator';
import { CreateOrderDto } from './CreateOrderDto';

export class CreateOrderAdminDto extends CreateOrderDto {
  @IsEnum(['pending', 'paid', 'failed', 'refunded'])
  payment_status: string = 'pending';
  @IsEnum(['credit_card', 'debit_card', 'paypal', 'cash'])
  payment_method: string = 'cash';

  @IsEnum(['pending', 'completed', 'cancelled', 'failed', 'free'])
  order_status: string = 'pending';

  @IsDecimal()
  @Min(1)
  @Max(100)
  tax: number = 0;

  @IsString()
  customerName = '';
}
