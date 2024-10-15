import { IsString, IsNumber, IsOptional } from 'class-validator';

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
  @IsOptional()
  contact?: string;
}
