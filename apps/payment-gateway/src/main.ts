import { NestFactory } from '@nestjs/core';
import { PaymentGatewayModule } from './payment-gateway.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ORDER_QUEUE } from '@app/common/constants/service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(PaymentGatewayModule, {
    rawBody: true,
  });
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://amiroso:amiroso@localhost:5672'],
      queue: ORDER_QUEUE,
    },
  });
  await app.startAllMicroservices();
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  await app.listen(port);
}
bootstrap();
