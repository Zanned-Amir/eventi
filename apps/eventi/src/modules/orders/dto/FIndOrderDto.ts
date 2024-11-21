import { BaseFindDto } from 'apps/eventi/src/common/dto/BaseFindDto';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  IsDate,
  IsNumber,
} from 'class-validator';

export class FindOrdersDto extends BaseFindDto {
  @IsOptional()
  @IsInt()
  user_id?: number;

  // User ID to filter orders by a specific user

  @IsOptional()
  @IsInt()
  concert_id?: number; // Concert ID to filter orders by a specific concert

  @IsOptional()
  @IsString()
  register_id?: string; // Register ID to filter orders by a specific register

  @IsOptional()
  @IsString()
  email?: string; // Email to filter orders by a specific email

  @IsOptional()
  @IsString()
  full_name?: string; // Full name to filter orders by a specific full name

  @IsOptional()
  @IsString()
  @IsOptional()
  @IsEnum(['pending', 'completed', 'cancelled', 'failed', 'free'], {
    message: 'Status must be pending, completed, cancelled, failed, or free',
  })
  status?: 'pending' | 'completed' | 'cancelled' | 'failed' | 'free'; // Order status filter

  @IsOptional()
  @IsEnum(['credit_card', 'debit_card', 'paypal', 'cash'], {
    message: 'Payment method must be credit_card, debit_card, paypal, or cash',
  })
  payment_method?: string; // Filter by payment method (e.g., 'credit_card', 'paypal', etc.)

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  start_date?: Date; // Start date to filter orders from a specific date onwards

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  end_date?: Date; // End date to filter orders until a specific date

  @IsOptional()
  @IsNumber()
  total_price_gte?: number; // Filter orders with a total price greater than or equal to a value

  @IsOptional()
  @IsNumber()
  total_price_lte?: number; // Filter orders with a total price less than or equal to a value
}
