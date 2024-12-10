import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

// Utility function to mask sensitive fields
function maskSensitiveInfo(data: any, fieldsToMask = ['password']): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const maskedData = Array.isArray(data) ? [...data] : { ...data };

  for (const key in maskedData) {
    if (fieldsToMask.includes(key)) {
      maskedData[key] = '[REDACTED]'; // Replace sensitive fields with placeholder
    } else if (typeof maskedData[key] === 'object') {
      maskedData[key] = maskSensitiveInfo(maskedData[key], fieldsToMask); // Recursively mask nested objects
    }
  }

  return maskedData;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const now = Date.now();

    // Mask sensitive information in the request data
    const maskedBody = maskSensitiveInfo(request.body);
    const maskedQuery = maskSensitiveInfo(request.query);

    return next.handle().pipe(
      tap({
        next: (data) => {
          // Mask sensitive information in the response data
          const maskedResponseData = maskSensitiveInfo(data);

          this.logger.info('Request processed successfully', {
            method: request.method,
            path: request.path,
            body: maskedBody, // Log masked body
            query: maskedQuery, // Log masked query
            processingTime: Date.now() - now,
            responseData: maskedResponseData, // Log masked response data
          });
        },
      }),
    );
  }
}
