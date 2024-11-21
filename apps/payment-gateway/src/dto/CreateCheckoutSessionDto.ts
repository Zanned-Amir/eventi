// dto/CreateCheckoutSessionDto.ts
import { UniqueProducts } from '@app/common/validator/UniqueProductsValidator';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsNumber()
  user_id: number;

  @IsOptional()
  @IsNumber()
  order_id: number;

  @IsOptional()
  @IsNumber()
  register_id: number;

  @IsString()
  @Length(3, 3, { message: 'Currency must be a valid 3-letter ISO code.' })
  currency: string = 'usd';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Product)
  @UniqueProducts({
    message: 'Duplicate products are not allowed in the array.',
  })
  products: Product[];

  @IsInt()
  tax: number = 7.25;

  @IsString()
  cancel_url: string;

  @IsString()
  success_url: string;
}

class Product {
  @IsOptional()
  @IsString()
  product_name: string;

  @IsNumber()
  product_id: number;

  @IsNumber()
  concert_id: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}
