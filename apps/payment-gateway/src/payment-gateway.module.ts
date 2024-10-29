import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PaymentGatewayController } from './payment-gateway.controller';
import { PaymentGatewayService } from './payment-gateway.service';
import { ConfigModule } from '@nestjs/config';
import {
  PAYMENT_GATEWAY_QUEUE,
  PAYMENT_GATEWAY_SERVICE,
} from '@app/common/constants/service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DatabaseModule } from './database/database.module';
import { Payment } from './database/entities/payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeModule } from './stripe/stripe.module';
import { RawBodyMiddleware } from '@app/common/middleware/raw-body.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/payment-gateway/.env'],
    }),
    TypeOrmModule.forFeature([Payment]),
    ClientsModule.register([
      {
        name: PAYMENT_GATEWAY_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://amiroso:amiroso@localhost:5672'],
          queue: PAYMENT_GATEWAY_QUEUE,
        },
      },
    ]),
    DatabaseModule,
    StripeModule.forRootAsync(),
  ],
  controllers: [PaymentGatewayController],

  providers: [PaymentGatewayService],
  exports: [PaymentGatewayService],
})
export class PaymentGatewayModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RawBodyMiddleware).forRoutes({
      path: '/stripe/webhook',
      method: RequestMethod.POST,
    });
  }
}
