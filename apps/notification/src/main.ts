import { NestFactory } from '@nestjs/core';
import { NotificationModule } from './notification.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import {
  AUTH_NOTIFICATION_QUEUE,
  AUTH_STAFF_NOTIFICATION_QUEUE,
  ORDER_NOTIFICATION_QUEUE,
} from '@app/common/constants/service';

async function bootstrap() {
  const app = await NestFactory.create(NotificationModule);
  app.get(ConfigService);
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://amiroso:amiroso@localhost:5672'],
      queue: AUTH_NOTIFICATION_QUEUE,
    },
  });

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://amiroso:amiroso@localhost:5672'],
      queue: ORDER_NOTIFICATION_QUEUE,
    },
  });

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://amiroso:amiroso@localhost:5672'],
      queue: AUTH_STAFF_NOTIFICATION_QUEUE,
    },
  });

  app.startAllMicroservices();
  await app.listen(3002);
}
bootstrap();
