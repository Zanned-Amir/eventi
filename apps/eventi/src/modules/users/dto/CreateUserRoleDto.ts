import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserRoleDto {
  @IsString()
  @IsNotEmpty()
  role_name: string;

  @IsString()
  @IsOptional()
  role_description?: string;
}
