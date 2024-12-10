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
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserAccountDto,
  CreateUserLoginDataDto,
  UpdateUserAccountDto,
} from './dto';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OrdersService } from '../orders/orders.service';
import { TicketService } from '../ticket/ticket.service';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../database/entities/user/userRole.entity';
import { FindUsersDto } from './dto/FindUsersDto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
    private readonly ticketService: TicketService,
  ) {}

  @Get('test')
  async test() {
    return 'test';
  }

  // user account

  @Patch('profile')
  async updateUserAccount(
    @CurrentUser() user,
    @Body() updateUserAccountDto: UpdateUserAccountDto,
  ) {
    const user_id = user.user_id;
    const userUpdate = await this.usersService.updateUserAccount(
      user_id,
      updateUserAccountDto,
    );
    return {
      status: 'success',
      data: userUpdate,
    };
  }

  @Delete('profile')
  async deactivateCurrentUserAccount(
    @CurrentUser() user,
    @Body('password') password: string,
  ) {
    const user_id = user.user_id;
    await this.usersService.currentUserDeactivate(user_id, password);
    return {
      status: 'success',
      data: 'account deleted successfully',
    };
  }

  @Get('profile')
  async getUserAccount(@CurrentUser() user) {
    const user_id = user.user_id;
    const userAccount = await this.usersService.getUserAccount(user_id);
    return {
      status: 'success',
      data: userAccount,
    };
  }

  @Get('profile/orders')
  @Roles(Role.USER)
  async getUserOrders(@CurrentUser() user, @Query() query) {
    const user_id = user.user_id;
    const orders = await this.ordersService.getOrderForCurrentUserWithAggregate(
      query,
      user_id,
    );
    return {
      status: 'success',
      count: orders.length,
      data: orders,
    };
  }

  @Get('profile/orders/:order_id/tickets')
  @Roles(Role.USER)
  async getUserOrderTickets(
    @CurrentUser() user,
    @Param('order_id', ParseIntPipe) order_id: number,
  ) {
    const user_id = user.user_id;
    const tickets = await this.ordersService.getTicketsByUserIdAndOrderId(
      user_id,
      order_id,
    );
    return {
      status: 'success',
      count: tickets.length,
      data: tickets,
    };
  }

  @Get('profile/orders/:order_id/tickets/:ticket_id')
  @Roles(Role.USER)
  async getUserOrderTicket(
    @CurrentUser() user,
    @Param('order_id', ParseIntPipe) order_id: number,
    @Param('ticket_id', ParseIntPipe) ticket_id: number,
  ) {
    const user_id = user.user_id;
    const ticket =
      await this.ordersService.getTicketByUserIdAndOrderIdAndTicketId(
        user_id,
        order_id,
        ticket_id,
      );
    return {
      status: 'success',
      data: ticket,
    };
  }

  @Get('profile/tickets')
  @Roles(Role.USER)
  async getUserTickets(@CurrentUser() user, @Query() query) {
    const user_id = user.user_id;
    const tickets =
      await this.ticketService.getTicketForCurrentUserWithAggregate(
        query,
        user_id,
      );
    return {
      status: 'success',
      data: tickets,
    };
  }

  //users

  @Get()
  @Roles(Role.ADMIN, Role.SUPPORT_STAFF)
  async getUsers(@Query() query: FindUsersDto) {
    const users = await this.usersService.getUsers(query);
    return {
      status: 'success',
      count: users.length,
      data: users,
    };
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPPORT_STAFF)
  async getUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.getUser(id);
    return {
      status: 'success',
      data: user,
    };
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPPORT_STAFF)
  async createUser(
    @Body() userAccountDto: CreateUserAccountDto,
    @Body() userLoginDataDto: CreateUserLoginDataDto,
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

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPPORT_STAFF)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() userAccountDto: UpdateUserAccountDto,
    @Body() userLoginDataDto: CreateUserLoginDataDto,
  ) {
    const user = await this.usersService.updateUser(
      id,
      userAccountDto,
      userLoginDataDto,
    );

    return {
      status: 'success',
      data: user,
    };
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPPORT_STAFF)
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.deleteUserAccount(id);
    return {
      status: 'success',
      data: 'User deleted successfully',
    };
  }

  //user login data

  @Delete(':id/login-data')
  @Roles(Role.ADMIN, Role.SUPPORT_STAFF)
  async deleteUserLoginData(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.deleteUserLoginData(id);
    return {
      status: 'success',
    };
  }

  @Get(':id/login-data')
  @Roles(Role.ADMIN, Role.SUPPORT_STAFF)
  async getUserLoginData() {}

  @Post(':id/login-data')
  @Roles(Role.ADMIN, Role.SUPPORT_STAFF)
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
  @Roles(Role.ADMIN, Role.SUPPORT_STAFF)
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
}
