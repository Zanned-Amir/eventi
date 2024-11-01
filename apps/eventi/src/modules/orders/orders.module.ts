import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Order,
  OrderTicket,
  OrderTicketCategory,
} from '../../database/entities/order';
import { OrdersService } from './orders.service';
import { Ticket, TicketCategory } from '../../database/entities/ticket';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import {
  NOTIFICATION_SERVICE,
  ORDER_NOTIFICATION_QUEUE,
  ORDER_PAYMENT_QUEUE,
  ORDERS_SERVICE,
} from '@app/common/constants/service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderTicket,
      TicketCategory,
      Ticket,
      OrderTicketCategory,
    ]),
  ],

  providers: [
    OrdersService,

    {
      provide: NOTIFICATION_SERVICE,
      useFactory: (configService: ConfigService) => {
        const RMQ_URL_DEV = configService.get('RMQ_URL_DEV');

        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [RMQ_URL_DEV],
            queue: ORDER_NOTIFICATION_QUEUE,
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: ORDERS_SERVICE,
      useFactory: (configService: ConfigService) => {
        const RMQ_URL_DEV = configService.get('RMQ_URL_DEV');

        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [RMQ_URL_DEV],
            queue: ORDER_PAYMENT_QUEUE,
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  controllers: [OrdersController],
})
export class OrdersModule {}
