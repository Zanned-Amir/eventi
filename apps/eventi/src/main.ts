import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { Transport } from '@nestjs/microservices';
import { PAYMENT_ORDER_QUEUE } from '@app/common/constants/service';
import * as os from 'os';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure RabbitMQ microservice
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://amiroso:amiroso@localhost:5672'],
      queue: PAYMENT_ORDER_QUEUE,
    },
  });

  // Use validation pipes globally
  app.useGlobalPipes(new ValidationPipe());

  // Use cookie parser middleware
  app.use(cookieParser());

  // Get port from environment variables
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  // Retrieve server's IP address
  const networkInterfaces = os.networkInterfaces();
  let ipAddress = 'localhost'; // Default fallback

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

  app.use(morgan('tiny'));

  // Start microservices
  app.startAllMicroservices();

  app.enableCors({
    origin: '*', // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Start HTTP server
  await app.listen(port, '0.0.0.0');

  // Log the full address
  console.log(`Application is running on: http://${ipAddress}:${port}`);
}

bootstrap();
