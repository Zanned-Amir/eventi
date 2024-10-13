import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserAccountDto,
  CreateUserLoginDataDto,
  UpdateUserAccountDto,
} from './dto';

import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('test')
  async test() {
    return 'test';
  }

  //users

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUsers(@Query() query) {
    const users = await this.usersService.getUsers(query);
    return {
      status: 'success',
      count: users.length,
      data: users,
    };
  }

  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.getUser(id);
    return {
      status: 'success',
      data: user,
    };
  }

  @Post()
  async createUser(
    @Body('userAccount') userAccountDto: CreateUserAccountDto,
    @Body('userLoginData') userLoginDataDto: CreateUserLoginDataDto,
  ) {
    const user = await this.usersService.createUser(
      userAccountDto,
      userLoginDataDto,
    );
    return {
      status: 'success',
      data: {
        ...user,
      },
    };
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.deleteUserAccount(id);
    return {
      status: 'success',
    };
  }

  //user login data

  @Delete(':id/login-data')
  async deleteUserLoginData(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.deleteUserLoginData(id);
    return {
      status: 'success',
    };
  }

  @Get(':id/login-data')
  async getUserLoginData() {}

  @Post(':id/login-data')
  async createUserLoginData(
    @Body() createUserLoginDataDto: CreateUserLoginDataDto,
  ) {
    const userLoginData = await this.usersService.createUserLoginData(
      createUserLoginDataDto,
    );
    return {
      status: 'success',
      data: userLoginData,
    };
  }

  @Put(':id/login-data')
  async updateUserLoginData(
    @Param('id', ParseIntPipe) id: number,
    @Body() createUserLoginDataDto: CreateUserLoginDataDto,
  ) {
    const userLoginData = await this.usersService.updateUserLoginData(
      id,
      createUserLoginDataDto,
    );
    return {
      status: 'success',
      data: userLoginData,
    };
  }

  // user account

  @Patch(':id/profile')
  async updateUserAccount(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserAccountDto: UpdateUserAccountDto,
  ) {
    const user = await this.usersService.updateUserAccount(
      id,
      updateUserAccountDto,
    );
    return {
      status: 'success',
      data: user,
    };
  }

  @Delete(':id/profile')
  async deleteUserAccount(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.deleteUserAccount(id);
    return {
      status: 'success',
    };
  }

  @Get(':id/profile')
  async getUserAccount(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.getUserAccount(id);
    return {
      status: 'success',
      data: user,
    };
  }
}
