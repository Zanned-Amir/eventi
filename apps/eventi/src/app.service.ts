import { Injectable, Logger } from '@nestjs/common';
import { testMongoDBConnection } from './config/mongodb.connection';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  async onModuleInit() {
    this.logger.log('Initializing the application...');
    await testMongoDBConnection();
  }
}
