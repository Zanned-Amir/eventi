import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateUserAccountDto {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsEnum(['M', 'F'])
  gender: string;

  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  birth_date: Date;

  @IsNumber()
  @IsNotEmpty()
  role_id: number;
}
