import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  permission_name: string;

  @IsString()
  @IsOptional()
  permission_description?: string;
}
