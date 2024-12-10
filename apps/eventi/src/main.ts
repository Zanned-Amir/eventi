import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { Transport } from '@nestjs/microservices';
import { PAYMENT_ORDER_QUEUE } from '@app/common/constants/service';
import * as os from 'os';
import {
  WINSTON_MODULE_NEST_PROVIDER,
  WINSTON_MODULE_PROVIDER,
} from 'nest-winston';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  const configService = app.get(ConfigService);
  const rmqUrl =
    configService.get<string>('NODE_ENV') === 'production'
      ? configService.get<string>('RMQ_URL_PROD')
      : configService.get<string>('RMQ_URL_DEV');
  // Configure RabbitMQ microservice
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: PAYMENT_ORDER_QUEUE,
      queueOptions: {
        durable: true,
      },
    },
  });

  const httpAdapterHost = app.get(HttpAdapterHost);
  const logger = app.get(WINSTON_MODULE_PROVIDER);

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, logger));

  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  app.use(cookieParser());

  const port = configService.get<number>('PORT', 3000);

  const networkInterfaces = os.networkInterfaces();
  let ipAddress = 'localhost';

  for (const key in networkInterfaces) {
    const net = networkInterfaces[key];
    if (net) {
      for (const details of net) {
        if (details.family === 'IPv4' && !details.internal) {
          ipAddress = details.address;
          break;
        }
      }
    }
  }

  // Start microservices
  app.startAllMicroservices();

  app.enableCors({
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
  });

  const options = new DocumentBuilder()
    .setTitle('Eventi API')
    .setDescription('Reservations and events management API')
    .setVersion('1.0.0')
    .build();

  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, options));

  // Start HTTP server
  await app.listen(port, '0.0.0.0');

  // Log the full address

  logger.log(
    'info',
    `[main app] Server running at http://${ipAddress}:${port}`,
  );
  logger.log(
    'info',
    `[main app] RabbitMQ connected to queue: ${PAYMENT_ORDER_QUEUE}`,
  );
}

bootstrap();
