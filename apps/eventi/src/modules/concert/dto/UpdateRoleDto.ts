import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './CreateRoleDto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
