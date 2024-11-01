import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { compare, hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './interface/token-payload.interface';
import { Response } from 'express';
import { CreateUserAccountDto, CreateUserLoginDataDto } from '../users/dto';
import { LoginRequestDto } from './dto/LoginRequestDto';
import { UserToken } from './types';
import { v4 as uuid } from 'uuid';
import { NOTIFICATION_SERVICE } from '@app/common/constants/service';
import { ClientProxy } from '@nestjs/microservices';
import { ChangePasswordWithTokenDto } from './dto/ChangePasswordWithTokenDto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
  ) {}

  async register(
    createUserAccountDto: CreateUserAccountDto,
    createUserLoginDataDto: CreateUserLoginDataDto,
  ) {
    const user = await this.usersService.createUser(createUserAccountDto, {
      ...createUserLoginDataDto,
    });
    return user;
  }
  //
  async login(user: LoginRequestDto, res: Response) {
    const deviceInfo = user.userAgent;
    const tokenPayload: TokenPayload = {
      user_id: user.user_id,
    };

    const accessTokenExpiry = parseInt(
      this.configService.getOrThrow<string>(
        'JWT_ACCESS_TOKEN_SECRET_EXPIRES_IN_MS',
      ),
      10,
    );
    const refreshTokenExpiry = parseInt(
      this.configService.getOrThrow<string>(
        'JWT_REFRESH_TOKEN_SECRET_EXPIRES_IN_MS',
      ),
      10,
    );
    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: accessTokenExpiry / 1000,
    });

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: refreshTokenExpiry / 1000,
    });

    const expiresAccessToken = new Date(Date.now() + accessTokenExpiry);
    const expiresRefreshToken = new Date(Date.now() + refreshTokenExpiry);

    const refreshTokenExpiresAt =
      Math.floor(Date.now() / 1000) + refreshTokenExpiry / 1000;

    const userRefreshToken: UserToken = {
      user_id: user.user_id,
      token: await hash(refreshToken, 10),
      expires_at: refreshTokenExpiresAt,
      type: 'REFRESH',
      device_info: deviceInfo,
      is_in_blacklist: false,
    };

    await this.usersService.createUserToken(userRefreshToken);

    res.clearCookie('jwt');

    res.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.getOrThrow('NODE_ENV') === 'production',
      expires: expiresAccessToken,
    });

    res.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: this.configService.getOrThrow('NODE_ENV') === 'production',
      expires: expiresRefreshToken,
    });
  }
  async logout() {}

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.usersService.getUserLoginDataByEmail(email);

      if (user.is_confirmed === false) {
        throw new HttpException(
          'User is not confirmed',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const authenticated = await compare(password, user.password);

      if (!authenticated) {
        throw new HttpException(
          'Credentials are invalid',
          HttpStatus.UNAUTHORIZED,
        );
      }

      user.password = undefined;
      return user;
    } catch (err) {
      console.error('Error during user verification:', err);

      if (err instanceof HttpException) {
        throw err;
      }
      throw new UnauthorizedException('Credentials are invalid');
    }
  }

  async refreshToken(user: LoginRequestDto, res: Response) {
    const deviceInfo = user.userAgent;
    const tokenPayload: TokenPayload = {
      user_id: user.user_id,
    };

    const accessTokenExpiry = parseInt(
      this.configService.getOrThrow<string>(
        'JWT_ACCESS_TOKEN_SECRET_EXPIRES_IN_MS',
      ),
      10,
    );
    const refreshTokenExpiry = parseInt(
      this.configService.getOrThrow<string>(
        'JWT_REFRESH_TOKEN_SECRET_EXPIRES_IN_MS',
      ),
      10,
    );

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: accessTokenExpiry / 1000, //
    });

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: refreshTokenExpiry / 1000,
    });

    const expiresAccessToken = new Date(Date.now() + accessTokenExpiry);
    const expiresRefreshToken = new Date(Date.now() + refreshTokenExpiry);

    const userRefreshToken: UserToken = {
      user_id: user.user_id,
      token: await hash(refreshToken, 10),
      expires_at: refreshTokenExpiry,
      type: 'REFRESH',
      device_info: deviceInfo,
      is_in_blacklist: false,
    };
    await this.usersService.createUserToken(userRefreshToken);

    // Clear previous cookies
    res.clearCookie('jwt');

    // Set cookies for access token and refresh token
    res.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.getOrThrow('NODE_ENV') === 'production',
      expires: expiresAccessToken, // Set access token expiration
    });

    res.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: this.configService.getOrThrow('NODE_ENV') === 'production',
      expires: expiresRefreshToken, // Set refresh token expiration
    });
  }
  async forgotPassword() {}
  async changePassword() {}

  async verifyUserRefreshToken(
    user_id: number,
    refreshToken: string,
    deviceInfo: string,
  ) {
    try {
      const user = await this.usersService.getUserToken(user_id, deviceInfo);

      if (!user) {
        throw new UnauthorizedException("User's token not found");
      }

      const authenticated = await compare(refreshToken, user.token);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      console.error('Error during user verification:', err);
      throw new UnauthorizedException('Refresh token is not valid');
    }
  }
  // Reset password with email

  async resetPassword(email: string) {
    const user = await this.usersService._getUserLoginDataByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const recovery_token = uuid();
    const hashed_recovery_token = await hash(recovery_token, 10);

    const token_generation_date = new Date();
    const result = await this.usersService.updateRecoveryCred(
      user.user_id,
      hashed_recovery_token,
      token_generation_date,
    );

    if (!result) {
      throw new UnauthorizedException('Error updating recovery cred');
    }

    this.notificationClient.emit('reset_password_email', {
      recovery_token,
      email: user.email,
      resetLink: `${this.configService.getOrThrow<string>('FRONTEND_URL')}/reset-password/${email}/${recovery_token}`,
    });
    return { message: 'reset password email sent check your email' };
  }

  async changePasswordWithToken(
    changePasswordWithTokenDto: ChangePasswordWithTokenDto,
  ) {
    const { email, message } =
      await this.usersService.changePasswordByRecoveryToken(
        changePasswordWithTokenDto.newPassword,
        changePasswordWithTokenDto.recovery_token,
        changePasswordWithTokenDto.email,
      );

    if (email) {
      this.notificationClient.emit('reset_password_email_changed', {
        email,
      });

      return { message };
    }

    throw new HttpException('Error changing password', HttpStatus.BAD_REQUEST);
  }

  // Account confirmation
  async confirmEmail(email: string) {
    const user = await this.usersService._getUserLoginDataByEmail(email);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.is_confirmed === true) {
      throw new HttpException('User already confirmed', HttpStatus.BAD_REQUEST);
    }

    const confirmation_token = uuid();
    const hashed_confirmation_token = await hash(confirmation_token, 10);

    const token_generation_date = new Date();
    const result = await this.usersService.updateConfirmationCred(
      user.user_id,
      hashed_confirmation_token,
      token_generation_date,
    );

    if (!result) {
      throw new HttpException(
        'Error updating confirmation cred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.notificationClient.emit('confirm_email', {
      confirmation_token,
      confirmationLink: `${this.configService.getOrThrow<string>('FRONTEND_URL')}/confirm-email/${email}/${confirmation_token}`,
      email: user.email,
    });

    return { message: 'Confirmation email sent check  your email' };
  }

  async confirmEmailWithToken(confirmation_token: string, emailUser: string) {
    const { email, message } = await this.usersService.confirmEmailByToken(
      emailUser,
      confirmation_token,
    );

    if (email) {
      this.notificationClient.emit('email_confirmed', {
        email,
      });
    }

    return { message };
  }

  async test() {
    this.notificationClient.emit('order_test', {
      message: 'Test email',
    });
  }
}
