import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../database/entities/payment.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  PAYMENT_GATEWAY_SERVICE,
  PAYMENT_GATEWAY_QUEUE,
} from '@app/common/constants/service';

@Module({
  imports: [
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
  ],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {
  static forRootAsync(): DynamicModule {
    return {
      module: StripeModule,
      providers: [
        {
          provide: 'STRIPE_API_KEY',
          useFactory: async (configService: ConfigService) =>
            configService.get('NODE_ENV') === 'production'
              ? configService.get('STRIPE_API_KEY')
              : configService.get('STRIPE_API_KEY_TEST'),
          inject: [ConfigService],
        },
      ],
      exports: ['STRIPE_API_KEY'], // Export the STRIPE_API_KEY so it can be used in other modules
    };
  }
}
