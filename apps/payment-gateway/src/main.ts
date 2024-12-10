import { NestFactory } from '@nestjs/core';
import { PaymentGatewayModule } from './payment-gateway.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ORDER_PAYMENT_QUEUE } from '../../../libs/common/src/constants/service';

async function bootstrap() {
  const app = await NestFactory.create(PaymentGatewayModule, {
    rawBody: true,
  });
  const configService = app.get(ConfigService);

  // Enable CORS for non-production environments
  if (configService.get<string>('NODE_ENV') !== 'production') {
    app.enableCors({
      origin: (origin, callback) => {
        const allowedOrigins = [
          /\.stripe\.com$/, // Allow any subdomain of stripe.com
          'https://api.stripe.com',
        ];

        if (
          !origin ||
          allowedOrigins.some((pattern) =>
            pattern instanceof RegExp
              ? pattern.test(origin)
              : pattern === origin,
          )
        ) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: 'GET,HEAD,POST',
      credentials: true, // Enable cookies if required
    });
  }

  // Configure RabbitMQ URL based on the environment
  const rmqUrl =
    configService.get<string>('NODE_ENV') === 'production'
      ? configService.get<string>('RMQ_URL_PROD')
      : configService.get<string>('RMQ_URL_DEV');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: ORDER_PAYMENT_QUEUE,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  console.log(
    `Payment Gateway is running on port ${port} in ${configService.get<string>(
      'NODE_ENV',
    )} mode`,
  );
}

bootstrap();
