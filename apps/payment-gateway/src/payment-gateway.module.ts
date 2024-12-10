import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PaymentGatewayController } from './payment-gateway.controller';
import { PaymentGatewayService } from './payment-gateway.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  PAYMENT_GATEWAY_SERVICE,
  PAYMENT_ORDER_QUEUE,
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
    ClientsModule.registerAsync([
      {
        name: PAYMENT_GATEWAY_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get<string>('NODE_ENV') === 'production'
                ? configService.get<string>('RMQ_URL_PROD')
                : configService.get<string>('RMQ_URL_DEV'),
            ],
            queue: PAYMENT_ORDER_QUEUE,
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
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
