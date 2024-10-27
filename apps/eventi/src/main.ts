import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { Transport } from '@nestjs/microservices';
import { PAYMENT_GATEWAY_QUEUE } from '@app/common/constants/service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://amiroso:amiroso@localhost:5672'],
      queue: PAYMENT_GATEWAY_QUEUE,
    },
  });
  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  app.use(cookieParser());
  console.log(`Listening on port ${port}`);
  app.startAllMicroservices();
  await app.listen(port);
}
bootstrap();
