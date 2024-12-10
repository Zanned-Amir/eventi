import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as requestIp from 'request-ip';
import { UAParser } from 'ua-parser-js';

export const TrackInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    // Retrieve the IP address
    const clientIp = requestIp.getClientIp(request) || 'Unknown';

    // Parse the User-Agent
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const parser = new UAParser(userAgent);
    const uaResult = parser.getResult();

    // Return tracking info as an object
    return {
      ip: clientIp,
      userAgent,
      ...uaResult,
    };
  },
);
