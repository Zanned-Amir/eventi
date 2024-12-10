import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateRegisterDto } from './dto/CreateRegisterDto';
import { CreateOrderDto } from './dto/CreateOrderDto';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../database/entities/user/userRole.entity';
import { Public } from '../../common/decorators/public.decorator';

@Controller('event')
export class RegisterController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(Role.ADMIN, Role.SUPPORT_STAFF)
  @Get('/register')
  async getRegisters() {
    const registers = await this.ordersService.getRegisters();
    return {
      status: 'success',
      count: registers.length,
      data: registers,
    };
  }
  @Public()
  @Post('/register')
  async createRegister(@Body() createRegisterDto: CreateRegisterDto) {
    const register = await this.ordersService.register(createRegisterDto);
    return {
      status: 'success',
      data: register,
    };
  }
  @Public()
  @Get('/register/:id')
  async getRegisterById(@Param('id') id: number) {
    const register = await this.ordersService.getRegisterById(id);
    return {
      status: 'success',
      data: register,
    };
  }
  @Public()
  @Delete('/register/:id')
  async deleteRegister(@Param('id') id: number) {
    await this.ordersService.deleteRegister(id);
    return {
      status: 'success',
    };
  }
  @Public()
  @Post('/register/:register_id/order/:register_code')
  async createOrder(
    @Param('register_id') registerId: number,
    @Param('register_code') RegisterCode: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const order = await this.ordersService.createOrderByRegister(
      registerId,
      RegisterCode,
      createOrderDto,
    );
    return {
      status: 'success',
      data: order,
    };
  }
}
