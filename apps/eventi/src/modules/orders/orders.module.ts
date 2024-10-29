import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, OrderTicket } from '../../database/entities/order';
import { OrdersService } from './orders.service';
import { Ticket, TicketCategory } from '../../database/entities/ticket';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ORDER_QUEUE, ORDERS_SERVICE } from '@app/common/constants/service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderTicket, TicketCategory, Ticket]),
    ClientsModule.register([
      {
        name: ORDERS_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://amiroso:amiroso@localhost:5672'],
          queue: ORDER_QUEUE,
        },
      },
    ]),
  ],

  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
