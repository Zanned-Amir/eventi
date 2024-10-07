import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller'; // Ensure this controller is correctly imported
import { AuthModule } from '../auth/auth.module'; // Correct import for AuthModule
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
  providers: [UsersService],
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
    AuthModule,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
