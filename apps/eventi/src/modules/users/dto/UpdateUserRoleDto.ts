import { PartialType } from '@nestjs/mapped-types';
import { CreateUserRoleDto } from './CreateUserRoleDto';

export class UpdateUserRoleDto extends PartialType(CreateUserRoleDto) {}
