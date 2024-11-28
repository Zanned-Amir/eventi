import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let responseBody: any = {
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request),
      message: 'Internal Server Error', // Default message
    };

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      responseBody = exception.getResponse();
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST; // You can change this to another status based on the error type

      // Custom message based on specific query failure (PostgreSQL)
      if (
        exception.message.includes(
          'duplicate key value violates unique constraint',
        )
      ) {
        if (exception.message.includes('UQ_CONCERT_ROLE')) {
          responseBody = {
            timestamp: new Date().toISOString(),
            message:
              'The concert role already exists for this concert member and role.',
            errorCode: 'CONCERT_ROLE_DUPLICATE',
            details: exception.message,
          };
        } else if (
          exception.message.includes('UQ_REGISTER_BY_EMAIL_CONCERT_ID')
        ) {
          responseBody = {
            timestamp: new Date().toISOString(),
            message:
              'This registration already exists for the specified email and concert.',
            errorCode: 'REGISTER_DUPLICATE',
            details: exception.message,
          };
        } else {
          // Default response for other unique constraint violations
          responseBody = {
            timestamp: new Date().toISOString(),
            message: 'The provided data conflicts with existing records.',
            errorCode: 'DUPLICATE_KEY_ERROR',
            details: exception.message,
          };
        }
      } else if (
        exception.message.includes('violates foreign key constraint')
      ) {
        responseBody = {
          timestamp: new Date().toISOString(),
          message: 'The referenced record does not exist.',
          errorCode: 'FOREIGN_KEY_VIOLATION',
          details: exception.message,
        };
      } else if (exception.message.includes('null value in column')) {
        responseBody = {
          timestamp: new Date().toISOString(),
          message: 'Missing required field in your request.',
          errorCode: 'NULL_VALUE_ERROR',
          details: exception.message,
        };
      } else {
        responseBody = {
          timestamp: new Date().toISOString(),
          message: 'Database query failed',
          errorCode: 'DATABASE_QUERY_ERROR',
          details: exception.message,
        };
      }
    } else if (exception instanceof Error) {
      responseBody.message = exception.message;
    }

    // Log the error with additional context
    this.logger.error('Unhandled Exception', {
      status,
      request: {
        method: request.method,
        url: request.url,
        body: request.body,
        query: request.query,
      },
      error: responseBody.message,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    if (responseBody.timestamp) {
      delete responseBody.timestamp;
    }

    // Send response with proper status and message
    httpAdapter.reply(ctx.getResponse(), responseBody, status);
  }
}
