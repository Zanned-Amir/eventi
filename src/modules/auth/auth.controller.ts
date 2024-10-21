import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Response } from 'express';
import { CreateUserAccountDto, CreateUserLoginDataDto } from '../users/dto';
import { LoginRequestDto } from './dto/LoginRequestDto';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';
import { JwtRefreshAuthGuard } from 'src/common/guards/jwt-refresh-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('register')
  async register(
    @Body('userAccount') userAccountDto: CreateUserAccountDto,
    @Body('userLoginData') userLoginDataDto: CreateUserLoginDataDto,
  ) {
    return await this.authService.register(userAccountDto, userLoginDataDto);
  }
  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.login(user, res);
  }

  @Post('logout')
  async logout() {}

  @Public()
  @Post('refresh-token')
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(
    @CurrentUser() user: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.refreshToken(user, res);
  }

  @Post('forgot-password')
  async forgotPassword() {}

  @Post('reset-password/:token')
  async resetPassword() {}

  @Post('confirm-account/:token')
  async confirmAccount() {}

  @Get('profile')
  async getProfile(@CurrentUser() user) {
    return user;
  }
}
