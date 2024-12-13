import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/db.config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrdersModule } from './modules/orders/orders.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { ConcertModule } from './modules/concert/concert.module';
import { NotificationModule } from './modules/notification/notification.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';
import { AdminModule, ApiModule } from '../router/api-routing.module';
import { WinstonLoggerModule } from './utils/winston.logger.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/logger.config';
import { TrackingMiddleware } from './common/middleware/tracking.middleware';
import { ScheduleModule } from '@nestjs/schedule';
import { JobModule } from './modules/jobs/job.module';
import { FileModule } from './modules/file/file.module';
import { StatsModule } from './modules/stats/stats.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: 'apps/eventi/.env',
    }),
    ScheduleModule.forRoot(),
    FileModule,
    /*
    MulterModule.register({
      dest: File_UPLOAD_PATH,
      limits: {
        fileSize: 1024 * 1024 * 5, // 5MB
      },
    }),
    */
    JobModule,
    WinstonLoggerModule,
    WinstonModule.forRoot({
      ...winstonConfig,
      handleExceptions: true, // Additional exception handling
    }),
    StatsModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    OrdersModule,
    TicketModule,
    ConcertModule,
    NotificationModule,
    ApiModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TrackingMiddleware).forRoutes('*');
  }
}
