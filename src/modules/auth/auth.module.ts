import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
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
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
