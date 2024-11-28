import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: 'apps/eventi/.env',
    }),
    WinstonLoggerModule,
    WinstonModule.forRoot({
      ...winstonConfig,
      handleExceptions: true, // Additional exception handling
    }),
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
export class AppModule {}
