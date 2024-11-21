import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {
  handleRequest(err, user) {
    // Customize error handling
    if (err || !user) {
      throw new HttpException(
        'Invalid or expired refresh token',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }
}
