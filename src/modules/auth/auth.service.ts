import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { compare, hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './interface/token-payload.interface';
import { Response } from 'express';
import { CreateUserAccountDto, CreateUserLoginDataDto } from '../users/dto';
import { LoginRequestDto } from './dto/LoginRequestDto';
import { UserToken } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
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

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const authenticated = await compare(password, user.password);

      if (!authenticated) {
        throw new UnauthorizedException('Invalid password');
      }

      user.password = undefined;
      return user;
    } catch (err) {
      console.error('Error during user verification:', err);
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
  async resetPassword() {}
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
}
