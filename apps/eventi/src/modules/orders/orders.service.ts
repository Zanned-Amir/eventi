import { Inject, Injectable, Logger } from '@nestjs/common';
import { Order, OrderTicket } from '../../database/entities/order';
import { Repository, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket, TicketCategory } from '../../database/entities/ticket';
import { CreateOrderDto } from './dto/CreateOrderDto';
import { ClientProxy } from '@nestjs/microservices';
import { ORDERS_SERVICE } from '@app/common/constants/service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(ORDERS_SERVICE)
    private readonly clientOrderService: ClientProxy,

    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(OrderTicket)
    private orderTicketRepository: Repository<OrderTicket>,

    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,

    @InjectRepository(TicketCategory)
    private ticketCategoryRepository: Repository<TicketCategory>,

    private readonly entityManger: EntityManager,
  ) {}

  private readonly logger = new Logger(OrdersService.name);

  async getOrderByUserId(user_id: number) {
    return await this.orderRepository.find({ where: { user_id } });
  }

  async getOrders() {
    return await this.orderRepository.find();
  }
  MAX_RETRIES = 5;

  async createOrder(createOrderDto: CreateOrderDto, user_id: number) {
    const { tickets } = createOrderDto;
    let retryCount = 0;
    let totalAmount = 0;
    let order: Order;
    const ticketDetails = [];

    while (retryCount < this.MAX_RETRIES) {
      try {
        await this.entityManger.transaction(
          async (transactionalEntityManager) => {
            for (const ticket of tickets) {
              const ticketCategory = await transactionalEntityManager.findOne(
                TicketCategory,
                {
                  where: { ticket_category_id: ticket.ticket_category_id },
                  relations: ['concert'],
                },
              );

              if (!ticketCategory) {
                throw new Error(
                  `Ticket category not found: ${ticket.ticket_category_id}`,
                );
              }

              // Use optimistic locking
              await transactionalEntityManager.findOne(TicketCategory, {
                where: { ticket_category_id: ticket.ticket_category_id },
                lock: { mode: 'optimistic', version: ticketCategory.version },
              });

              if (ticketCategory.quantity < ticket.quantity) {
                throw new Error(
                  `Not enough tickets available for category ${ticket.ticket_category_id}`,
                );
              }

              ticketCategory.quantity -= ticket.quantity;
              await transactionalEntityManager.save(ticketCategory);

              totalAmount += ticketCategory.price * ticket.quantity;

              ticketDetails.push({
                ticket_name:
                  ticketCategory.ticket_category_name +
                  '_' +
                  ticketCategory.concert.concert_name,
                product_id: ticket.ticket_category_id,
                concert_id: ticketCategory.concert.concert_id,
                quantity: ticket.quantity,
                price: ticketCategory.price,
              });
            }

            // Collect ticket details for emitting

            order = this.orderRepository.create({
              user_id: user_id,
              total_price: totalAmount,
              delivery_address: createOrderDto.delivery_address,
              delivery_email_address: createOrderDto.delivery_email_address,
            });

            order = await transactionalEntityManager.save(order); // Save the order and update the variable
          },
        );

        this.clientOrderService.emit('test', {});

        const result = this.clientOrderService
          .send(
            { cmd: 'order_created' },
            {
              order_id: order.order_id,
              user_id: user_id,
              currency: 'usd',
              products: ticketDetails.map((ticket) => ({
                product_name: ticket.ticket_name,
                product_id: ticket.product_id,
                concert_id: ticket.concert_id,
                quantity: ticket.quantity,
                price: ticket.price,
              })),
              cancel_url: process.env.PAYMENT_STRIP_CANCEL_URL,
              success_url: process.env.PAYMENT_STRIP_SUCCESS_URL,
            },
          )
          .toPromise();
        // Emit an event to the billing service
        // If transaction is successful, exit the retry loop
        return result; // Return the created order
      } catch (error) {
        // Handle specific error types
        if (
          error.message.includes('Not enough tickets available') ||
          error.message.includes('Ticket category not found')
        ) {
          throw error; // Propagate critical errors
        }

        retryCount++;
        if (retryCount === this.MAX_RETRIES) {
          throw new Error('Max retries reached. Please try again later.');
        }
      }
    }
  }

  async handleOrderBilled(data: any) {
    const tickets = JSON.parse(data.session_object.metadata.products);

    const order_id = Number(data.order_id);

    try {
      const order = await this.orderRepository.findOne({ where: { order_id } });
      if (!order) {
        throw new Error('Order not found');
      }

      this.entityManger.transaction(async (transactionalEntityManager) => {
        for (const ticket of tickets) {
          const ticketCategory = await transactionalEntityManager.findOne(
            TicketCategory,
            {
              where: { ticket_category_id: ticket.product_id },
            },
          );

          if (!ticketCategory) {
            throw new Error(`Ticket category not found: ${ticket.product_id}`);
          }

          for (let i = 0; i < ticket.quantity; i++) {
            const ticket_code = uuidv4();
            const serial_code = uuidv4();

            const ticketEntity = this.ticketRepository.create({
              ticket_category_id: ticket.product_id,
              concert_id: ticket.concert_id,
              ticket_code,
              serial_code,
            });

            await transactionalEntityManager.save(ticketEntity);
          }
        }
        await transactionalEntityManager.update(Order, order_id, {
          status: 'completed',
        });
      });
    } catch (error) {
      this.logger.error('Failed to handle order billing', error.stack);
      throw new Error('Failed to handle order billing');
    }
  }
}
