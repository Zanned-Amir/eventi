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
import { InjectRepository } from '@nestjs/typeorm';
import { ConcertRole } from '../../database/entities/concert';
import { Repository } from 'typeorm';
import { createVerify } from 'crypto';
import { LoginM2FADto } from './dto/LoginM2FADto';
import { authenticator, totp } from 'otplib';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
    @InjectRepository(ConcertRole)
    private readonly concertRoleRepository: Repository<ConcertRole>,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async register(
    createUserAccountDto: CreateUserAccountDto,
    createUserLoginDataDto: CreateUserLoginDataDto,
    trackInfo: any,
  ) {
    const user = await this.usersService.createUser(createUserAccountDto, {
      ...createUserLoginDataDto,
    });

    this.logger.log('user', {
      message: 'New user registered',
      user,
      trackInfo,
    });
    return user;
  }

  async login(user: LoginRequestDto, res: Response, trackInfo: any) {
    const deviceInfo = user.userAgent;
    const tokenPayload: TokenPayload = {
      user_id: user.user_id,
    };

    if (user.is_confirmed === false) {
      throw new UnauthorizedException(
        'User is not confirmed please confirm your email',
      );
    }
    if (user.enabled_m2fa === true) {
      const mfa_token = this.jwtService.sign(tokenPayload, {
        secret: this.configService.getOrThrow<string>('JWT_MFA_SECRET'),
        expiresIn: '10m',
      });
      totp.options = { step: 600, window: 1, digits: 6 };

      const secret = authenticator.generateSecret();
      const otp = totp.generate(secret);

      await this.usersService.updateLoginData(user.user_id, {
        m2fa_token: mfa_token,
        m2fa_secret_otp: secret,
        m2fa_secret_otp_timestamp: new Date(),
        m2fa_attempts: 0,
      });

      this.logger.log('user', {
        message: 'User Triggered M2FA',
        user,
        trackInfo,
      });

      this.notificationClient.emit('mfa_otp_email', {
        email: user.email,
        otp,
      });

      return { message: 'otp sent to your email', mfa_token };
    }

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

    const userRefreshToken: UserToken = {
      user_id: user.user_id,
      token: await hash(refreshToken, 10),
      expires_at: expiresRefreshToken,
      type: 'REFRESH',
      device_info: deviceInfo,
      is_in_blacklist: false,
    };

    // store RefreshToken
    await this.usersService.createUserToken(userRefreshToken);

    // update last_login_timestamp
    await this.usersService.updateLoginData(user.user_id, {
      last_login_timestamp: new Date(),
    });

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

    this.logger.log('user', {
      message: 'User logged in',
      user,
      trackInfo,
    });
  }

  async loginM2fa(user: LoginM2FADto, res: Response, trackInfo: any) {
    const { mfa_token, otp } = user;

    const isValidToken = this.jwtService.verify(mfa_token, {
      secret: this.configService.getOrThrow<string>('JWT_MFA_SECRET'),
    });
    if (!isValidToken) {
      throw new UnauthorizedException('Mfa_Token is invalid or expired');
    }

    const foundedUser =
      await this.usersService.getUserLoginDataByUserM2faToken(mfa_token);

    if (!foundedUser) {
      throw new UnauthorizedException('User not found');
    }

    if (foundedUser.m2fa_attempts > 3) {
      this.usersService.updateLoginData(foundedUser.user_id, {
        m2fa_attempts: 0,
        m2fa_secret_otp: null,
        m2fa_secret_otp_timestamp: null,
        m2fa_token: null,
      });

      throw new UnauthorizedException('OTP attempts exceeded');
    }

    const isValidOtp = totp.check(otp, foundedUser.m2fa_secret_otp);

    if (!isValidOtp) {
      this.usersService.updateLoginData(foundedUser.user_id, {
        m2fa_attempts: foundedUser.m2fa_attempts + 1,
      });

      throw new UnauthorizedException('OTP is invalid or expired');
    }

    const deviceInfo = user.userAgent;
    const tokenPayload: TokenPayload = {
      user_id: foundedUser.user_id,
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

    const userRefreshToken: UserToken = {
      user_id: foundedUser.user_id,
      token: await hash(refreshToken, 10),
      expires_at: expiresRefreshToken,
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

    this.logger.log('user', {
      message: 'User logged in with M2FA',
      foundedUser,
      trackInfo,
    });
  }

  async logout(userId: number, res: Response, trackInfo: any) {
    // Invalidate all user tokens for the specified user
    await this.usersService.invalidateUserTokens(userId);

    // Clear the authentication and refresh cookies
    res.clearCookie('Authentication', {
      httpOnly: true,
      secure: this.configService.getOrThrow('NODE_ENV') === 'production',
    });

    res.clearCookie('Refresh', {
      httpOnly: true,
      secure: this.configService.getOrThrow('NODE_ENV') === 'production',
    });

    await this.usersService.updateLoginData(userId, {
      last_login_timestamp: new Date(),
    });

    await this.usersService.updateLoginData(userId, {
      last_activity_timestamp: new Date(),
    });

    this.logger.log('user', {
      message: 'User logged out',
      userId,
      trackInfo,
    });

    return {
      message: 'Logged out successfully',
    };
  }

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

    await this.usersService.updateLoginData(user.user_id, {
      last_activity_timestamp: new Date(),
    });

    const userRefreshToken: UserToken = {
      user_id: user.user_id,
      token: await hash(refreshToken, 10),
      expires_at: expiresRefreshToken,
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
        throw new UnauthorizedException('Refresh token is not valid');
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

  async checkConcertRole(
    concert_role_id: number,
    concert_id: number,
    access_code: string,
    signature: string,
  ) {
    const concertRole = await this.concertRoleRepository
      .createQueryBuilder('concert_role')
      .leftJoinAndSelect('concert_role.concertMember', 'concertMember')
      .leftJoinAndSelect('concert_role.role', 'role')
      .leftJoinAndSelect('concert_role.concert', 'concert')
      .where('concert_role.concert_role_id = :concert_role_id', {
        concert_role_id,
      })
      .andWhere('concert_role.concert_id = :concert_id', { concert_id })
      .getOne();

    // Validate the signature
    const publicKey = this.configService.getOrThrow<string>(
      'PUBLIC_KEY_SIGNATURE',
    );

    const payload = `${concert_role_id}:${access_code}`;
    const verifier = createVerify('SHA256');
    verifier.update(payload);
    verifier.end();
    const isValidSignature = verifier.verify(publicKey, signature, 'base64');

    if (!isValidSignature) {
      throw new UnauthorizedException('Signature is invalid');
    }

    if (!concertRole) {
      throw new UnauthorizedException('Concert role not found');
    }

    // Validate the access code
    if (concertRole.access_code !== access_code) {
      throw new UnauthorizedException('Access code is invalid');
    }

    // Ensure the concert is still ongoing
    if (concertRole.concert.concert_end_date < new Date()) {
      throw new UnauthorizedException('Concert has ended');
    }

    // Any additional custom checks can go here

    return concertRole;
  }
}
