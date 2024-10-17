import { IsString, IsNumber, IsOptional, IsEmail } from 'class-validator';

export class CreateVenueDto {
  @IsString()
  venue_name: string;

  @IsString()
  location: string;

  @IsNumber()
  capacity: number;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone_number?: string;
}
