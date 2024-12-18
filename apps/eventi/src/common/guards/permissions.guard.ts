import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Permissions } from '../../database/entities/user/permission.entity';
import { PERMISSIONS_METADATA_KEY } from '../decorators/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isLocked = this.reflector.getAllAndOverride<boolean>('isLocked', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isLocked) {
      throw new HttpException('ressource is unavailable', HttpStatus.FORBIDDEN);
    }

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

    const userPermissions = user.permissions.map((permission) =>
      permission.permission_name.toUpperCase(),
    );
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );
    if (!hasPermission) {
      throw new HttpException(
        'You do not have permission to perform this action',
        HttpStatus.FORBIDDEN,
      );
    }
    return true;
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw new HttpException(
        'Unauthorized permission',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
