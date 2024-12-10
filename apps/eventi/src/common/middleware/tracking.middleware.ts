import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UAParser } from 'ua-parser-js';
import * as requestIp from 'request-ip';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class TrackingMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  use(req: Request, res: Response, next: NextFunction) {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const clientIp = requestIp.getClientIp(req) || 'Unknown';

    // Parse User-Agent details
    const parser = new UAParser(userAgent);
    const uaResult = parser.getResult();

    const logDetails = {
      ip: clientIp,
      userAgent: JSON.stringify(uaResult),
    };

    // Log cookie details
    if (req.cookies) {
      logDetails['cookies'] = JSON.stringify(req.cookies);
    }

    next();
  }
}
