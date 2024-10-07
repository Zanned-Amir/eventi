import { PartialType } from '@nestjs/swagger';
import { CreateUserRoleDto } from './CreateUserRoleDto';

export class UpdateUserRoleDto extends PartialType(CreateUserRoleDto) {}
