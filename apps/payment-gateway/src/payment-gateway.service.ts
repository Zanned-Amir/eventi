import { PAYMENT_GATEWAY_SERVICE } from '@app/common/constants/service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { StripeService } from './stripe/stripe.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './database/entities/payment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentGatewayService {
  constructor(
    @Inject(PAYMENT_GATEWAY_SERVICE)
    private readonly client: ClientProxy,
    private readonly stripeService: StripeService,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}
  private readonly logger = new Logger(PaymentGatewayService.name);

  async getPaymentById(payment_id: number) {
    return await this.paymentRepository.findOne({
      where: { payment_id },
    });
  }
}
