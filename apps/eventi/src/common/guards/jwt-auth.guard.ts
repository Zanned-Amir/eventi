import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

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
      console.log('Public route');
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw (
        err ||
        new HttpException(
          'Invalid or expired access token',
          HttpStatus.UNAUTHORIZED,
        )
      );
    }
    return user;
  }
}
