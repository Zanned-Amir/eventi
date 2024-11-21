import { BaseFindDto } from 'apps/eventi/src/common/dto/BaseFindDto';
import { IsOptional, IsInt, IsString, IsUUID } from 'class-validator';

export class FindConcertRoleDto extends BaseFindDto {
  @IsOptional()
  @IsInt()
  concert_member_id?: number;

  @IsOptional()
  @IsInt()
  concert_id?: number;

  @IsOptional()
  @IsInt()
  role_id?: number;

  @IsOptional()
  @IsString()
  @IsUUID()
  access_code?: string;
}
