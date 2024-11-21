import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Order,
  OrderTicket,
  OrderTicketCategory,
  Register,
  RegistrationRule,
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
import { RegisterController } from './register.controller';
import { Payment } from '../../database/entities/payment/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderTicket,
      TicketCategory,
      Ticket,
      OrderTicketCategory,
      Register,
      RegistrationRule,
      Payment,
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
  controllers: [OrdersController, RegisterController],
  exports: [OrdersService],
})
export class OrdersModule {}
