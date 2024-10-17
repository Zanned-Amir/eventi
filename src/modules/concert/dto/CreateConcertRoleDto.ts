import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateConcertRoleDto {
  @IsOptional()
  @IsString()
  access_code: string;

  @IsNumber()
  concert_id: number;

  @IsNumber()
  role_id: number;

  @IsNumber()
  concert_member_id: number;
}
