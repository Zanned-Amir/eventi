import { BaseFindDto } from 'apps/eventi/src/common/dto/BaseFindDto';
import { IsOptional, IsInt, IsString, MaxLength } from 'class-validator';

export class FindRoleDto extends BaseFindDto {
  @IsOptional()
  @IsInt()
  role_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  role_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  role_description?: string;
}
