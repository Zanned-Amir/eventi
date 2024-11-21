import { BaseFindDto } from 'apps/eventi/src/common/dto/BaseFindDto';
import { IsBoolean, IsDateString, IsOptional, IsInt } from 'class-validator';

export class FindRegistrationRuleDto extends BaseFindDto {
  @IsOptional()
  @IsInt()
  register_rule_id?: number;

  @IsOptional()
  @IsInt()
  concert_id?: number;

  @IsOptional()
  @IsDateString()
  available_from_gte?: Date;

  @IsOptional()
  @IsDateString()
  valid_until_lte?: Date;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
