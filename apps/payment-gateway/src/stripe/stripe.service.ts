// stripe.service.ts
import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  RawBodyRequest,
} from '@nestjs/common';
import Stripe from 'stripe';
import { CreateCheckoutSessionDto } from '../dto/CreateCheckoutSessionDto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../database/entities/payment.entity';
import { Repository } from 'typeorm';
import { PAYMENT_GATEWAY_SERVICE } from '@app/common/constants/service';
import { ClientProxy } from '@nestjs/microservices';
import { PaymentWebhookStat } from '@app/common/constants/state';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    @Inject('STRIPE_API_KEY') private readonly apiKey: string,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject(PAYMENT_GATEWAY_SERVICE)
    private readonly paymentClient: ClientProxy,
  ) {
    this.stripe = new Stripe(this.apiKey, {
      apiVersion: '2024-09-30.acacia',
    });
    this.logger.log('StripeService initialized with API version 2024-09-30');
  }

  async createCheckoutSession(
    createCheckoutSessionDto: CreateCheckoutSessionDto,
  ): Promise<{ url: string }> {
    try {
      const line_items = createCheckoutSessionDto.products.map((product) => ({
        price_data: {
          currency: createCheckoutSessionDto.currency,
          product_data: {
            name: product.product_name,
          },
          unit_amount: product.price * 100,
        },
        quantity: product.quantity,
      }));

      const productsMetaData = createCheckoutSessionDto.products.map(
        (product) => ({
          product_id: product.product_id,
          concert_id: product.concert_id,
          quantity: product.quantity,
        }),
      );

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: createCheckoutSessionDto.success_url,
        cancel_url: createCheckoutSessionDto.cancel_url,
        metadata: {
          user_id: createCheckoutSessionDto.user_id,
          order_id: createCheckoutSessionDto.order_id,
          products: JSON.stringify(productsMetaData),
        },
        expires_at: Math.floor(Date.now() / 1000) + 60 * 30,
      });

      this.logger.log('Checkout session created successfully');
      return { url: session.url };
    } catch (error) {
      this.logger.error('Failed to create checkout session', error.stack);
      throw new InternalServerErrorException(
        'Unable to create checkout session',
      );
    }
  }

  async webhookStripe(req: RawBodyRequest<Request>): Promise<void> {
    const stripe_webhook_secret =
      process.env.NODE_ENV === 'production'
        ? process.env.STRIPE_WEBHOOK_SECRET
        : process.env.STRIPE_WEBHOOK_SECRET_TEST;
    try {
      const sig = req.headers['stripe-signature'];
      const event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        stripe_webhook_secret,
      );

      this.logger.log('Webhook received', event.type);

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          this.logger.log('Checkout session completed', session);

          // Process successful payment
          const newPayment: Partial<Payment> = {
            order_id: Number(session.metadata.order_id),
            user_id: Number(session.metadata.user_id),
            payment_intent: session.payment_intent.toString(),
            amount: session.amount_total / 100,
            payment_date: new Date(),
            session_object: session,
            payment_method: 'credit_card',
            status: 'paid',
          };

          const payment = this.paymentRepository.create(newPayment);
          await this.paymentRepository.save(payment);

          this.paymentClient.emit('payment-billed', {
            order_id: newPayment.order_id,
            user_id: newPayment.user_id,
            payment_id: payment.payment_id,
            session_object: newPayment.session_object,
            state: PaymentWebhookStat.SUCCEEDED,
          });

          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentFailed = event.data.object;
          this.logger.log('Payment failed', paymentFailed);

          // Emit an event indicating the payment failed
          this.paymentClient.emit('payment-failed', {
            order_id: Number(paymentFailed.metadata.order_id),
            user_id: Number(paymentFailed.metadata.user_id),
            session_object: paymentFailed,
            reason: 'Payment failed due to insufficient funds or other issues',
            state: PaymentWebhookStat.FAILED,
          });
          break;
        }

        case 'payment_intent.canceled': {
          const paymentCanceled = event.data.object;
          this.logger.log('Payment canceled', paymentCanceled);

          // Emit an event indicating the payment was canceled
          this.paymentClient.emit('payment-failed', {
            order_id: Number(paymentCanceled.metadata.order_id),
            user_id: Number(paymentCanceled.metadata.user_id),
            session_object: paymentCanceled,
            reason: 'Payment was canceled by the user',
            state: PaymentWebhookStat.CANCELED,
          });
          break;
        }

        default:
          this.logger.log('Unhandled event', event.type);
      }
    } catch (error) {
      this.logger.error('Failed to process webhook', error.stack);
      throw new HttpException('Failed to process webhook', 500);
    }
  }
}
