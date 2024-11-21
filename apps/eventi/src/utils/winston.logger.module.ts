import { Module } from '@nestjs/common';
import { WinstonLoggerService } from './winston.logger';

@Module({
  providers: [WinstonLoggerService],
  exports: [WinstonLoggerService], // Export the service
})
export class WinstonLoggerModule {}
