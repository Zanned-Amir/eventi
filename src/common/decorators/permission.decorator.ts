import { SetMetadata } from '@nestjs/common';
import { Permissions } from 'src/database/entities/user/permission.entity';

export const PERMISSIONS_METADATA_KEY = 'permissions_decorator_key';

export const Permission = (...permissions: Permissions[]) =>
  SetMetadata(PERMISSIONS_METADATA_KEY, permissions);
