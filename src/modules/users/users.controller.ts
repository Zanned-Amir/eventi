import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserAccountDto, CreateUserLoginDataDto } from './dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(@Query() query) {
    const users = await this.usersService.getUsers(query);
    return {
      status: 'success',
      count: users.length,
      data: users,
    };
  }

  @Get('test')
  async test() {
    return 'test';
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
    const { userAccount, userLoginData } = await this.usersService.createUser(
      userAccountDto,
      userLoginDataDto,
    );
    return {
      status: 'success',
      data: {
        ...userAccount,
        ...userLoginData,
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

  // User roles, accounts, and login data

  @Get(':id/roles')
  async getUserRoles() {}

  @Put(':id/profile')
  async updateUserAccount() {}

  @Get(':id/login-data')
  async getUserLoginData() {}

  @Post(':id/login-data')
  async createUserLoginData() {}

  @Put(':id/login-data')
  async updateUserLoginData() {}
}
