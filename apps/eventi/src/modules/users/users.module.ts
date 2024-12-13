import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller'; // Ensure this controller is correctly imported

import { TypeOrmModule } from '@nestjs/typeorm';
import {
  UserAccount,
  UserLoginData,
  UserLoginDataExternal,
  UserTokens,
  UserRole,
  externalProvider,
  Permission,
} from '../../database/entities/user/index';
import { OrdersModule } from '../orders/orders.module';
import { TicketModule } from '../ticket/ticket.module';
import { FileModule } from '../file/file.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserAccount,
      UserLoginData,
      UserLoginDataExternal,
      UserTokens,
      UserRole,
      externalProvider,
      Permission,
    ]),
    OrdersModule,
    TicketModule,
    FileModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
