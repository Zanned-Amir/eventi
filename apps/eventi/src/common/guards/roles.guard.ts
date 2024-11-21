import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_METADATA_KEY } from '../decorators/role.decorator';
import { Role } from '../../database/entities/user/userRole.entity';
import { PERMISSIONS_METADATA_KEY } from '../decorators/permission.decorator';
import { EXCLUDE_ROLES_METADATA_KEY } from '../decorators/exclude-roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
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

    const permissions = this.reflector.getAllAndOverride<
      Permissions[] | undefined
    >(PERMISSIONS_METADATA_KEY, [context.getHandler(), context.getClass()]);

    if (permissions && permissions.length > 0) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    const excludedRoles = this.reflector.getAllAndOverride<Role[]>(
      EXCLUDE_ROLES_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    console.log('user  r :', user);

    if (excludedRoles && excludedRoles.includes(user?.role.role_name)) {
      throw new HttpException(
        'Access restricted for your role',
        HttpStatus.FORBIDDEN,
      );
    }

    if (requiredRoles.includes(user?.role.role_name)) {
      return true;
    } else {
      throw new HttpException(
        'You do not have permission to perform this action',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw new HttpException('Unauthorized  role', HttpStatus.UNAUTHORIZED);
    }
  }
}
