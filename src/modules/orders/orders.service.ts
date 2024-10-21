import { Injectable } from '@nestjs/common';
import { Order, OrderTicket } from 'src/database/entities/order';
import { Repository, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket, TicketCategory } from 'src/database/entities/ticket';
import { CreateOrderDto } from './dto/CreateOrderDto';
@Injectable()
export class OrdersService {
  constructor(
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

    while (retryCount < this.MAX_RETRIES) {
      try {
        await this.entityManger.transaction(
          async (transactionalEntityManager) => {
            for (const ticket of tickets) {
              const ticketCategory = await transactionalEntityManager.findOne(
                TicketCategory,
                { where: { ticket_category_id: ticket.ticket_category_id } },
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
            }

            order = this.orderRepository.create({
              user_id: user_id,
              total_price: totalAmount,
              delivery_address: createOrderDto.delivery_address,
              delivery_email_address: createOrderDto.delivery_email_address,
            });

            order = await transactionalEntityManager.save(order); // Save the order and update the variable
          },
        );

        // If transaction is successful, exit the retry loop
        return order; // Return the created order
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
}
