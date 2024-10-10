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
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
