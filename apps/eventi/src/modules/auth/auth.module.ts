import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.startegy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import {
  AUTH_NOTIFICATION_QUEUE,
  NOTIFICATION_SERVICE,
} from '@app/common/constants/service';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConcertRole } from '../../database/entities/concert';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule,
    TypeOrmModule.forFeature([ConcertRole]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    {
      provide: NOTIFICATION_SERVICE,
      useFactory: (configService: ConfigService) => {
        const RMQ_URL_DEV = configService.get('RMQ_URL_DEV');

        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [RMQ_URL_DEV],
            queue: AUTH_NOTIFICATION_QUEUE,
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
