import { PartialType } from '@nestjs/mapped-types';
import { CreatePermissionDto } from './CreatePermissionDto';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}
