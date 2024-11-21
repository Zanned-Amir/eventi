import { BaseFindDto } from 'apps/eventi/src/common/dto/BaseFindDto';
import {
  IsOptional,
  IsInt,
  IsString,
  IsPhoneNumber,
  IsEmail,
  MaxLength,
} from 'class-validator';

export class FindConcertMemberDto extends BaseFindDto {
  @IsOptional()
  @IsInt()
  concert_member_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  full_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone_number?: string;
}
