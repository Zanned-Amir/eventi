import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from 'winston';

@Injectable()
export class RouteLoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request; // HTTP method and route path
    const controller = context.getClass().name; // Controller name
    const handler = context.getHandler().name; // Handler name (method)

    this.logger.info({
      message: `Route accessed`,
      method,
      url,
      controller,
      handler,
    });

    return next.handle().pipe(
      tap(() => {
        this.logger.info({
          message: `Route processed successfully`,
          method,
          url,
        });
      }),
    );
  }
}
