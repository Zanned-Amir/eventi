import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from '../Create/CreateRoleDto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
