import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/database/entities/user/userRole.entity';

export const ROLES_METADATA_KEY = 'roles_decorator_key';

export const Roles = (...roles: Role[]) =>
  SetMetadata(ROLES_METADATA_KEY, roles);
