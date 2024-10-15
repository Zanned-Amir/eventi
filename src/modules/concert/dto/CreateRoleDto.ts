import { IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  role_name: string;

  @IsString()
  @IsOptional()
  role_description?: string;
}
