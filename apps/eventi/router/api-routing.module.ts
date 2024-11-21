import { Module } from '@nestjs/common';
import { AuthModule } from '../src/modules/auth/auth.module';
import { ConcertModule } from '../src/modules/concert/concert.module';
import { TicketModule } from '../src/modules/ticket/ticket.module';
import { OrdersModule } from '../src/modules/orders/orders.module';
import { UsersModule } from '../src/modules/users/users.module';

@Module({
  imports: [UsersModule, OrdersModule, TicketModule, ConcertModule, AuthModule],
})
export class ApiModule {}

@Module({
  imports: [UsersModule, OrdersModule, TicketModule, ConcertModule, AuthModule],
})
export class AdminModule {}
