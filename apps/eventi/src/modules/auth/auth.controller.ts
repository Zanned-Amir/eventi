import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Response } from 'express';
import {
  CreatePermissionDto,
  CreateUserAccountDto,
  CreateUserLoginDataDto,
  CreateUserRoleDto,
  UpdatePermissionDto,
} from '../users/dto';
import { LoginRequestDto } from './dto/LoginRequestDto';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { JwtRefreshAuthGuard } from '../../common/guards/jwt-refresh-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { UsersService } from '../users/users.service';
import { UpdateRoleDto } from '../concert/dto';
import { EmailConfirmationDto } from './dto/EmailConfirmationDto';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../database/entities/user/userRole.entity';
import { LoginM2FADto } from './dto/LoginM2FADto';
import { UserAgent } from '../../common/decorators/User-agent.decoratos';
import { TrackInfo } from '../../common/decorators/track-info.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}
  @Public()
  @Post('register')
  async register(
    @Body('userAccount') userAccountDto: CreateUserAccountDto,
    @Body('userLoginData') userLoginDataDto: CreateUserLoginDataDto,
    @TrackInfo() trackInfo: any,
  ) {
    return await this.authService.register(
      userAccountDto,
      userLoginDataDto,
      trackInfo,
    );
  }
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: LoginRequestDto,
    @TrackInfo() trackInfo: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.login(user, res, trackInfo);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login-m2fa')
  async loginM2FA(
    @Body() user: LoginM2FADto,
    @UserAgent() userAgent: string,
    @TrackInfo() trackInfo: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    user.userAgent = userAgent;
    return await this.authService.loginM2fa(user, res, trackInfo);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser() user,
    @Res({ passthrough: true }) res: Response,
    @TrackInfo() trackInfo: any,
  ) {
    const user_id = user.user_id;
    return await this.authService.logout(user_id, res, trackInfo);
  }

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
    return this.usersService.getUser(user.user_id);
  }

  @Roles(Role.ADMIN, Role.SUPPORT_STAFF)
  @Get('permissions')
  async getPermissions() {
    const data = await this.usersService.getPermissions();

    return {
      status: 'success',
      data,
    };
  }

  @Roles(Role.ADMIN)
  @Post('permissions')
  async createPermissions(@Body() createPermission: CreatePermissionDto) {
    const data = await this.usersService.createPermission(createPermission);
    return {
      status: 'success',
      data,
    };
  }

  @Roles(Role.ADMIN)
  @Patch('permissions/:id')
  async updatePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    const data = await this.usersService.updatePermission(
      id,
      updatePermissionDto,
    );
    return {
      status: 'success',
      data,
    };
  }

  @Roles(Role.ADMIN)
  @Delete('permissions/:id')
  async deletePermissions(@Param('id', ParseIntPipe) id: number) {
    const result = await this.usersService.deletePermission(id);

    if (result) {
      return {
        status: 'success',
        data: 'Permission deleted successfully',
      };
    }
  }

  @Roles(Role.ADMIN)
  @Post('permissions/:permission_id/users/:id')
  async assignPermissionToUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('permission_id', ParseIntPipe) permission_id: number,
  ) {
    const data = this.usersService.assignPermissionToUser(id, permission_id);
    return {
      status: 'success',
      data,
    };
  }

  @Roles(Role.ADMIN, Role.SUPPORT_STAFF)
  @Get('roles')
  async getRoles() {
    const data = await this.usersService.getAppRoles();
    return {
      status: 'success',
      data,
    };
  }

  // assign role to user

  @Roles(Role.ADMIN, Role.SUPPORT_STAFF)
  @Post('roles/:role_id/users/:id')
  async assignRoleToUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('role_id', ParseIntPipe) role_id: number,
  ) {
    const data = this.usersService.assignRoleToUser(id, role_id);
    return {
      status: 'success',
      data,
    };
  }

  @Roles(Role.ADMIN)
  @Post('roles')
  async createRoles(@Body() CreateUserRoleDto: CreateUserRoleDto) {
    const data = await this.usersService.createAppRole(CreateUserRoleDto);
    return {
      status: 'success',
      data,
    };
  }

  @Roles(Role.ADMIN)
  @Patch('roles/:id')
  async updateRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const data = await this.usersService.updateAppRole(id, updateRoleDto);

    return {
      status: 'success',
      data,
    };
  }

  @Roles(Role.ADMIN)
  @Delete('roles/:id')
  async deleteRoles(@Param('id', ParseIntPipe) id: number) {
    const result = await this.usersService.deleteAppRole(id);

    if (result) {
      return {
        status: 'success',
        data: 'Role deleted successfully',
      };
    }
  }

  // send it to the user's email
  @Public()
  @Post('email-confirmation-send')
  async emailConfirmation(@Body() EmailConfirmationDto: EmailConfirmationDto) {
    const email = EmailConfirmationDto.email;
    return await this.authService.confirmEmail(email);
  }

  // send it to the user's email and the user will click on the link this url
  @Public()
  @Post('confirm-email')
  async confirmEmail(
    @Body() EmailConfirmationDto: EmailConfirmationDto,
    @Body('confirmation_token') confirmation_token: string,
  ) {
    const email = EmailConfirmationDto.email;
    return await this.authService.confirmEmailWithToken(
      confirmation_token,
      email,
    );
  }

  // send it to the user's email
  @Public()
  @Post('password-reset')
  async passwordReset(@Body() EmailConfirmationDto: EmailConfirmationDto) {
    const email = EmailConfirmationDto.email;
    return await this.authService.resetPassword(email);
  }

  // send it to the user's email and the user will click on the link this url
  @Public()
  @Post('password-change')
  async passwordChange(
    @Body('new_password') newPassword: string,
    @Body() EmailConfirmationDto: EmailConfirmationDto,
    @Body('recovery_token') recovery_token: string,
  ) {
    const email = EmailConfirmationDto.email;
    return await this.authService.changePasswordWithToken({
      newPassword,
      recovery_token,
      email,
    });
  }
  @Public()
  @Roles(Role.ADMIN, Role.SUPPORT_STAFF, Role.TICKET_VERIFIER)
  @Get('check/concert/:concert_id/concert-role/:concert_role_id')
  async checkConcertMember(
    @Param('concert_id', ParseIntPipe) concert_id: number,
    @Param('concert_role_id', ParseIntPipe) concert_role_id: number,
    @Body('access_code') access_code: string,
    @Body('signature') signature: string,
  ) {
    const data = await this.authService.checkConcertRole(
      concert_role_id,
      concert_id,
      access_code,
      signature,
    );

    return {
      status: 'success',
      data,
    };
  }
}
