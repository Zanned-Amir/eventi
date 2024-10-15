import { IsNumber, IsString } from 'class-validator';

export class CreateConcertRoleDto {
  @IsString()
  access_code: string;

  @IsNumber()
  concert_id: number;

  @IsNumber()
  role_id: number;

  @IsNumber()
  concert_member_id: number;
}
