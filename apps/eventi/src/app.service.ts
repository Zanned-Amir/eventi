import { Inject, Injectable, Logger } from '@nestjs/common';
import { Logger as Loggerwinston } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly loggerw: Loggerwinston,
  ) {}

  async onModuleInit() {
    // np: mongodb connection was commented out with mongodb loger because i don't wanna  overcomplicate the code
    /*
    this.logger.log('Initializing the application...');
    await testMongoDBConnection(this.loggerw);
    */
  }
}
