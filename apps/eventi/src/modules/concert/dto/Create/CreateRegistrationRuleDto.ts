import { IsBoolean, IsDateString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateRegistrationRuleDto {
  @IsInt()
  @IsNotEmpty()
  concert_id: number;

  @IsDateString()
  available_from: string;

  @IsDateString()
  valid_until: string;

  @IsBoolean()
  is_active: boolean;
}
