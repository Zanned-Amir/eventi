import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Response,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(@Query() query, @Response() res) {
    const users = await this.usersService.getUsers(query);
    return res.status(200).json({
      status: 'success',
      count: users.length,
      data: users,
    });
  }

  @Get('test')
  async test() {
    return 'test';
  }

  @Get(':id')
  async getUser() {}

  @Post()
  async createUser() {}

  @Delete(':id')
  async deleteUser() {}

  @Put(':id')
  async updateUser() {}

  // User roles, accounts, and login data

  @Get(':id/roles')
  async getUserRoles() {}

  @Get(':id/accounts')
  async getUserAccounts() {}

  @Put(':id/profile')
  async updateUserAccount() {}

  @Get(':id/login-data')
  async getUserLoginData() {}

  @Post(':id/login-data')
  async createUserLoginData() {}

  @Put(':id/login-data')
  async updateUserLoginData() {}
}
