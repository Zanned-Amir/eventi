import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, OrderTicket } from 'src/database/entities/order';
import { OrdersService } from './orders.service';
import { Ticket, TicketCategory } from 'src/database/entities/ticket';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderTicket, TicketCategory, Ticket]),
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
