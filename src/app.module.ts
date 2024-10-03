import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/db.config';
import { DatabaseModule } from './database/database.module';
import { AuthService } from './modules/auth/auth.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersController } from './modules/users/users.controller';
import { UsersModule } from './modules/users/users.module';
import { OrdersService } from './modules/orders/orders.service';
import { OrdersModule } from './modules/orders/orders.module';
import { TicketController } from './modules/ticket/ticket.controller';
import { TicketModule } from './modules/ticket/ticket.module';
import { ConcertService } from './modules/concert/concert.service';
import { ConcertController } from './modules/concert/concert.controller';
import { ConcertModule } from './modules/concert/concert.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    OrdersModule,
    TicketModule,
    ConcertModule,
    NotificationModule,
  ],
  controllers: [
    AppController,
    UsersController,
    TicketController,
    ConcertController,
  ],
  providers: [AppService, AuthService, OrdersService, ConcertService],
})
export class AppModule {}
