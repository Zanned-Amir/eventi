import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Permissions } from 'src/database/entities/user/permission.entity';
import { PERMISSIONS_METADATA_KEY } from '../decorators/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const requiredPermissions = this.reflector.getAllAndOverride<
      Permissions[] | undefined
    >(PERMISSIONS_METADATA_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    const userPermissions = user.permissions.map(
      (permission) => permission.permission_name,
    );
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );
    if (!hasPermission) {
      return false;
    }

    return true;
  }
}
