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
  ) {
    return await this.authService.register(userAccountDto, userLoginDataDto);
  }
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.login(user, res);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUser() user, @Res({ passthrough: true }) res: Response) {
    const user_id = user.user_id;
    return await this.authService.logout(user_id, res);
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
    return user;
  }

  @Roles(Role.ADMIN, Role.SUPPORT_STAFF)
  @Get('permissions')
  async getPermissions() {
    return await this.usersService.getPermissions();
  }

  @Roles(Role.ADMIN)
  @Post('permissions')
  async createPermissions(@Body() createPermission: CreatePermissionDto) {
    return await this.usersService.createPermission(createPermission);
  }

  @Roles(Role.ADMIN)
  @Patch('permissions/:id')
  async updatePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return await this.usersService.updatePermission(id, updatePermissionDto);
  }

  @Roles(Role.ADMIN)
  @Delete('permissions/:id')
  async deletePermissions(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.deletePermission(id);
  }

  @Roles(Role.ADMIN)
  @Post('permissions/:permission_id/users/:id')
  async assignPermissionToUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('permission_id', ParseIntPipe) permission_id: number,
  ) {
    return await this.usersService.assignPermissionToUser(id, permission_id);
  }

  @Roles(Role.ADMIN, Role.SUPPORT_STAFF)
  @Get('roles')
  async getRoles() {
    return await this.usersService.getAppRoles();
  }

  @Roles(Role.ADMIN)
  @Post('roles')
  async createRoles(@Body() CreateUserRoleDto: CreateUserRoleDto) {
    return await this.usersService.createAppRole(CreateUserRoleDto);
  }

  @Roles(Role.ADMIN)
  @Patch('roles/:id')
  async updateRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return await this.usersService.updateAppRole(id, updateRoleDto);
  }

  @Roles(Role.ADMIN)
  @Delete('roles/:id')
  async deleteRoles(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.deleteAppRole(id);
  }

  // send it to the user's email
  @Public()
  @Post('email-confirmation-send/:email')
  async emailConfirmation(@Param('email') email: string) {
    return await this.authService.confirmEmail(email);
  }

  // send it to the user's email and the user will click on the link this url
  @Public()
  @Post('confirm-email/:email/:confirmation_token')
  async confirmEmail(
    @Param('email') email: string,
    @Param('confirmation_token') confirmation_token: string,
  ) {
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
  @Post('password-change/:email/:recovery_token')
  async passwordChange(
    @Body('newPassword') newPassword: string,
    @Param('email') email: string,
    @Param('recovery_token') recovery_token: string,
  ) {
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
  ) {
    return await this.authService.checkConcertRole(
      concert_role_id,
      concert_id,
      access_code,
    );
  }
}
