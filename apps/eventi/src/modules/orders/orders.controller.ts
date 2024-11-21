import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/CreateOrderDto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { EventPattern, Payload } from '@nestjs/microservices';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../database/entities/user/userRole.entity';
import { CreateOrderAdminDto } from './dto/CreateOrderAdminDto';

@Controller('orders')
@Roles(Role.ADMIN, Role.SUPPORT_STAFF)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getOrders(@Query() query) {
    const orders = await this.ordersService.getOrders(query);
    return {
      status: 'success',
      count: orders.orders.length,
      data: orders,
    };
  }

  @Get(':id')
  async getOrderById(@Param('id') id: number) {
    const order = await this.ordersService.getOrderById(id);
    return {
      status: 'success',
      data: order,
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

  @Post('o')
  async createOrderForAdmin(
    @CurrentUser() user: any,
    @Body() createOrderAdminDto: CreateOrderAdminDto,
  ) {
    const user_id = user?.user_id;
    const order = await this.ordersService.createOrderByAdmin(
      createOrderAdminDto,
      user_id,
    );
    return {
      status: 'success',
      data: order,
    };
  }

  @Get(':order_id/tickets')
  async getOrderTickets(@Param('order_id') order_id: number) {
    const tickets = await this.ordersService.getOrderTickets(order_id);
    return {
      status: 'success',
      count: tickets.length,
      data: tickets,
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

  @Post(':order_id/tickets/email')
  async sendOrderTicketsEmail(@Param('order_id') order_id: number) {
    return this.ordersService.sendTicketOrderToMailer(order_id);
  }
}
