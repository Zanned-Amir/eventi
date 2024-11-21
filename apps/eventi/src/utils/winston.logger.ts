import { Logger, LoggerService } from '@nestjs/common';
import { createLogger, transports, format } from 'winston';

// Define the WinstonLoggerService
export class WinstonLoggerService extends Logger implements LoggerService {
  private logger = createLogger({
    level: 'info',
    format: format.combine(
      format.colorize(),
      format.timestamp(),
      format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}] ${message}`;
      }),
    ),
    transports: [new transports.Console()],
  });

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace: string) {
    this.logger.error(`${message} - ${trace}`);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  verbose(message: string) {
    this.logger.verbose(message);
  }
}
