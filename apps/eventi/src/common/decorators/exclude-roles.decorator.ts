import { SetMetadata } from '@nestjs/common';
import { Role } from '../../database/entities/user/userRole.entity';

export const EXCLUDE_ROLES_METADATA_KEY = 'exclude_roles';

export const ExcludeRoles = (...roles: Role[]) =>
  SetMetadata(EXCLUDE_ROLES_METADATA_KEY, roles);
