import {
  Body,
  Controller,
  Delete,
  Get,
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

  @Get('permissions')
  async getPermissions() {
    return await this.usersService.getPermissions();
  }
  @Post('permissions')
  async createPermissions(@Body() createPermission: CreatePermissionDto) {
    return await this.usersService.createPermission(createPermission);
  }

  @Patch('permissions/:id')
  async updatePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return await this.usersService.updatePermission(id, updatePermissionDto);
  }

  @Delete('permissions/:id')
  async deletePermissions(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.deletePermission(id);
  }

  @Post('permissions/:permission_id/users/:id')
  async assignPermissionToUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('permission_id', ParseIntPipe) permission_id: number,
  ) {
    return await this.usersService.assignPermissionToUser(id, permission_id);
  }

  @Get('roles')
  async getRoles() {
    return await this.usersService.getAppRoles();
  }

  @Post('roles')
  async createRoles(@Body() CreateUserRoleDto: CreateUserRoleDto) {
    return await this.usersService.createAppRole(CreateUserRoleDto);
  }

  @Patch('roles/:id')
  async updateRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return await this.usersService.updateAppRole(id, updateRoleDto);
  }

  @Delete('roles/:id')
  async deleteRoles(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.deleteAppRole(id);
  }
}
