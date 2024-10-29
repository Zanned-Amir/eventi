import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/CreateOrderDto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getOrders() {
    const orders = await this.ordersService.getOrders();
    return {
      status: 'success',
      count: orders.length,
      data: orders,
    };
  }

  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: any,
  ) {
    const order = await this.ordersService.createOrder(
      createOrderDto,
      user?.user_id,
    );
    return {
      status: 'success',
      data: order,
    };
  }

  @Get('userOrder')
  async getOrder(@CurrentUser() user: any) {
    const order = await this.ordersService.getOrderByUserId(user?.user_id);
    return {
      status: 'success',
      data: order,
    };
  }

  @EventPattern('payment-billed')
  async handleOrderBilled(@Payload() data: any) {
    return this.ordersService.handleOrderBilled(data);
  }

  @EventPattern('payment-failed')
  async handleOrderFailed(@Payload() data: any) {
    return this.ordersService.handleOrderFailed(data);
  }
}
