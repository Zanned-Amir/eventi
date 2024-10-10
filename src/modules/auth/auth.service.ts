import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { compare, hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './interface/token-payload.interface';
import { Response } from 'express';
import { CreateUserAccountDto, CreateUserLoginDataDto } from '../users/dto';
import { LoginRequestDto } from './dto/LoginRequestDto';

@Injectable()
export class AuthService {
  constructor(
    private readonly UsersService: UsersService,
    private readonly ConfigService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    createUserAccountDto: CreateUserAccountDto,
    createUserLoginDataDto: CreateUserLoginDataDto,
  ) {
    const user = await this.UsersService.createUser(createUserAccountDto, {
      ...createUserLoginDataDto,
      password: await hash(createUserLoginDataDto.password, 10),
    });
    return user;
  }
  //
  async login(user: LoginRequestDto, res: Response) {
    const expiresAcessToken = new Date();

    expiresAcessToken.setMilliseconds(
      expiresAcessToken.getTime() +
        parseInt(this.ConfigService.getOrThrow<string>('JWT_EXPIRES_IN')),
    );

    const tokenPayload: TokenPayload = {
      user_id: user.user_id,
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.ConfigService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.ConfigService.getOrThrow<string>('JWT_EXPIRES_IN'),
    });

    res.clearCookie('jwt');

    res.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.ConfigService.getOrThrow('NODE_ENV') === 'production',
      expires: expiresAcessToken,
    });
  }
  async logout() {}

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.UsersService.getUserLoginDataByEmail(email);

      const authenticated = await compare(password, user.password);
      if (!authenticated) {
        throw new UnauthorizedException();
      }

      return user;
    } catch (err) {
      throw new UnauthorizedException('Credentials are invalid');
    }
  }

  async refreshToken() {}
  async forgotPassword() {}
  async resetPassword() {}
  async changePassword() {}
}
