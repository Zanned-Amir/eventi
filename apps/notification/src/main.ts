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

  const configService = app.get(ConfigService);

  const rmqUrl =
    configService.get<string>('NODE_ENV') === 'production'
      ? configService.get<string>('RMQ_URL_PROD')
      : configService.get<string>('RMQ_URL_DEV');
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: AUTH_NOTIFICATION_QUEUE,
    },
    queueOptions: {
      durable: true,
    },
  });

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: ORDER_NOTIFICATION_QUEUE,
    },
    queueOptions: {
      durable: true,
    },
  });

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: AUTH_STAFF_NOTIFICATION_QUEUE,
    },
    queueOptions: {
      durable: true,
    },
  });

  app.startAllMicroservices();
  await app.listen(3002);
}
bootstrap();
