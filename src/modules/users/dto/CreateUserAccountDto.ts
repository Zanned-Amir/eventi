import { IsDate, IsEnum, IsNotEmpty, IsString } from 'class-validator';

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
  birth_date: Date;

  @IsString()
  role_id: number; // Reference to role
}
