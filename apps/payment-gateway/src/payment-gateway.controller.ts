import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { PaymentGatewayService } from './payment-gateway.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { StripeService } from './stripe/stripe.service';
import { CreateCheckoutSessionDto } from './dto/CreateCheckoutSessionDto';

@Controller('payment-gateway')
export class PaymentGatewayController {
  constructor(
    private readonly paymentGatewayService: PaymentGatewayService,
    private readonly stripeService: StripeService,
  ) {}

  @MessagePattern({ cmd: 'order_created' })
  async handleOrderCreated(@Payload() data: CreateCheckoutSessionDto) {
    console.log('Order Created', data);
    return this.stripeService.createCheckoutSession(data);
  }

  @EventPattern('test')
  async test() {
    console.log('Test Event');
  }

  @Get('payment-success')
  async success() {
    return 'Payment Successful';
  }

  @Get('payment-failure')
  async failure() {
    return 'Payment Failed';
  }

  // Stripe

  @Get('checkout-session')
  async createCheckoutSession() {
    return 'Checkout Session Created';
  }

  @Get('checkout-session-success')
  async checkoutSessionSuccess() {
    return 'Checkout Session Success';
  }

  @Get('checkout-session-cancel')
  async checkoutSessionCancel() {
    return 'Checkout Session Cancel';
  }

  @Post('stripe/webhook')
  async stripeWebhook(@Req() req: RawBodyRequest<Request>) {
    return this.stripeService.webhookStripe(req);
  }

  @Get('payment/:id')
  async getPaymentById(@Param('id', ParseIntPipe) id: number) {
    return this.paymentGatewayService.getPaymentById(id);
  }
}
