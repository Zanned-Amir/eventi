import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  Order,
  OrderTicketCategory,
  Register,
} from '../../database/entities/order';
import { Repository, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket, TicketCategory } from '../../database/entities/ticket';
import { CreateOrderDto } from './dto/CreateOrderDto';
import { ClientProxy } from '@nestjs/microservices';
import {
  NOTIFICATION_SERVICE,
  ORDERS_SERVICE,
} from '@app/common/constants/service';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';
import { PaymentWebhookStat } from '@app/common/constants/state';
import { compare, hash } from 'bcrypt';
import { OrderTicket } from '../../database/entities/order/orderTicket.entity';
import { CreateRegisterDto } from './dto/CreateRegisterDto';
import { FindOrdersDto } from './dto/FIndOrderDto';
import { Payment } from '../../database/entities/payment/payment.entity';
import { CreateOrderAdminDto } from './dto/CreateOrderAdminDto';
import { createSign, createVerify } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(NOTIFICATION_SERVICE)
    private readonly clientNotificationService: ClientProxy,
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

    @InjectRepository(OrderTicketCategory)
    private orderTicketCategoryRepository: Repository<OrderTicketCategory>,

    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,

    @InjectRepository(Register)
    private registerRepository: Repository<Register>,

    private readonly entityManger: EntityManager,

    private readonly configService: ConfigService,
  ) {}

  MAX_RETRIES = 5;
  TAX = 7.25;

  private readonly logger = new Logger(OrdersService.name);

  async getOrderByUserId(user_id: number) {
    return await this.orderRepository.find({ where: { user_id } });
  }

  async getOrders(query: FindOrdersDto) {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.register', 'register');

    // Apply other filters if provided

    if (query.email) {
      queryBuilder.andWhere(
        'LOWER(order.delivery_email_address) = LOWER(:email) OR LOWER(userLoginData.email) = LOWER(:email)',
        {
          email: query.email,
        },
      );
    }
    if (query.register_id) {
      queryBuilder.andWhere('order.register_id = :register_id', {
        register_id: query.register_id,
      });
    }

    if (query.user_id) {
      queryBuilder.andWhere('order.user_id = :user_id', {
        user_id: query.user_id,
      });
    }

    if (query.status) {
      queryBuilder.andWhere('order.status = :status', {
        status: query.status,
      });
    }

    if (query.payment_method) {
      queryBuilder.andWhere('order.payment_method = :payment_method', {
        payment_method: query.payment_method,
      });
    }

    if (query.start_date) {
      queryBuilder.andWhere('order.created_at >= :start_date', {
        start_date: query.start_date,
      });
    }

    if (query.end_date) {
      queryBuilder.andWhere('order.created_at <= :end_date', {
        end_date: query.end_date,
      });
    }

    if (query.total_price_gte) {
      queryBuilder.andWhere('order.total_price >= :total_price_gte', {
        total_price_gte: query.total_price_gte,
      });
    }

    if (query.total_price_lte) {
      queryBuilder.andWhere('order.total_price <= :total_price_lte', {
        total_price_lte: query.total_price_lte,
      });
    }

    // Apply aggregation

    const totalSalesQuery = await queryBuilder
      .clone()
      .select('SUM(order.total_price)', 'totalSales')
      .getRawOne();
    const totalSales = parseFloat(totalSalesQuery.totalSales) || 0;

    // Apply ordering if provided
    if (query.orderBy) {
      for (const [key, order] of Object.entries(query.orderBy)) {
        queryBuilder.addOrderBy(
          `order.${key}`,
          order.toUpperCase() as 'ASC' | 'DESC',
        );
      }
    }

    // Default pagination values
    const limit = query.limit ?? 10; // Default to 10 if not provided
    const offset = query.offset ?? 0; // Default to 0 if not provided

    // Apply pagination with default values
    queryBuilder.limit(limit);
    queryBuilder.offset(offset);

    // Execute query and return results
    const orders = query.rawQuery
      ? await queryBuilder.getRawMany()
      : await queryBuilder.getMany();

    return {
      totalSales,
      orders,
    };
  }

  async getOrderByQrCode(
    order_id: number,
    payment_id: number,
    signature: string,
  ) {
    const publicKey =
      this.configService.getOrThrow<string>('INVOICE_PUBLIC_KEY');

    const qrData = `${order_id}:${payment_id}`;
    const verify = createVerify('SHA256');
    verify.update(qrData);
    verify.end();
    const isValid = verify.verify(publicKey, signature, 'base64');

    if (!isValid) {
      throw new HttpException(
        'Invalid QR code signature',
        HttpStatus.BAD_REQUEST,
      );
    }

    const order = this.orderRepository
      .createQueryBuilder('order')
      .where('order.order_id= :order_id', { order_id })
      .getOne();

    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    return order;
  }

  async getOrderById(order_id: number) {
    return await this.orderRepository.findOne({ where: { order_id } });
  }

  async createOrder(
    createOrderDto: CreateOrderDto,
    user_id: number = null,
    register_id: number = null,
  ) {
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
                  where: {
                    ticket_category_id: ticket.ticket_category_id,
                    hide: false,
                  },
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
                  ticketCategory.concert.concert_name +
                  '_' +
                  ticketCategory.ticket_category_name,

                product_id: ticket.ticket_category_id,
                concert_id: ticketCategory.concert.concert_id,
                quantity: ticket.quantity,
                price: ticketCategory.price,
              });
            }

            // Collect ticket details for emitting
            const totalAmountWithTax = totalAmount * (1 + this.TAX / 100);

            order = this.orderRepository.create({
              user_id: user_id,
              total_price: totalAmountWithTax,
              register_id: register_id,
              tax: this.TAX,
              delivery_address: createOrderDto.delivery_address,
              delivery_email_address: createOrderDto.delivery_email_address,
            });

            order = await transactionalEntityManager.save(order);

            await transactionalEntityManager
              .createQueryBuilder()
              .insert()
              .into(OrderTicketCategory)
              .values(
                ticketDetails.map((ticket) => ({
                  order_id: order.order_id,
                  ticket_category_id: ticket.product_id,
                  quantity: ticket.quantity,
                })),
              )
              .execute();
          },
        );

        this.clientOrderService.emit('test', {});

        let result;
        if (!register_id) {
          result = await this.clientOrderService
            .send(
              { cmd: 'order_created' },
              {
                order_id: order.order_id,
                user_id: user_id,
                tax: this.TAX,
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
        } else {
          result = await this.clientOrderService
            .send(
              { cmd: 'order_created' },
              {
                order_id: order.order_id,
                user_id: user_id,
                currency: 'usd',
                tax: this.TAX,
                products: ticketDetails.map((ticket) => ({
                  product_name: ticket.ticket_name,
                  product_id: ticket.product_id,
                  concert_id: ticket.concert_id,
                  quantity: ticket.quantity,
                  price: ticket.price,
                })),
                cancel_url: process.env.PAYMENT_STRIP_CANCEL_URL,
                success_url: process.env.PAYMENT_STRIP_SUCCESS_URL,
                register_id: register_id,
              },
            )
            .toPromise();
        }
        // Emit an event to the billing service
        // If transaction is successful, exit the retry loop

        return {
          url: result.url,
          order,
        };
      } catch (error) {
        if (
          error.message.includes('Not enough tickets available') ||
          error.message.includes('Ticket category not found')
        ) {
          throw error;
        }

        retryCount++;
        if (retryCount === this.MAX_RETRIES) {
          Logger.error('Max retries reached. Please try again later.', error);

          throw new Error('Max retries reached. Please try again later.');
        }
      }
    }
  }

  async createOrderByAdmin(
    createOrderDto: CreateOrderAdminDto,
    user_id: number,
  ) {
    let retryCount = 0;
    let totalAmount = 0;
    let order: Order;
    const ticketDetails = [];
    const tickets = createOrderDto.tickets;

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
                  ticketCategory.concert.concert_name +
                  '_' +
                  ticketCategory.ticket_category_name,

                product_id: ticket.ticket_category_id,
                concert_id: ticketCategory.concert.concert_id,
                quantity: ticket.quantity,
                price: ticketCategory.price,
              });
            }

            // Collect ticket details for emitting
            const totalAmountWithTax =
              totalAmount * (1 + createOrderDto.tax / 100);

            order = this.orderRepository.create({
              user_id: user_id,
              total_price: totalAmountWithTax,
              tax: createOrderDto.tax,
              delivery_address: createOrderDto.delivery_address,
              delivery_email_address: createOrderDto.delivery_email_address,
              status: createOrderDto.payment_status,
              payment_method: createOrderDto.payment_method,
            });

            order = await transactionalEntityManager.save(order);

            await transactionalEntityManager
              .createQueryBuilder()
              .insert()
              .into(OrderTicketCategory)
              .values(
                ticketDetails.map((ticket) => ({
                  order_id: order.order_id,
                  ticket_category_id: ticket.product_id,
                  quantity: ticket.quantity,
                })),
              )
              .execute();

            if (createOrderDto.payment_status === 'completed') {
              const payment = await transactionalEntityManager.save(Payment, {
                user_id: user_id,
                order_id: order.order_id,
                amount: totalAmountWithTax,
                tax: createOrderDto.tax,
                payment_method: createOrderDto.payment_method,
                status: createOrderDto.payment_status,
              });

              this.clientOrderService.emit('order_invoice_email', {
                email: order.delivery_email_address,
                customerName: createOrderDto.customerName,
                orderNumber: order.order_id,
                orderDate: new Date()
                  .toISOString()
                  .replace('T', ' ')
                  .replace(/\..+/, ''),
                items: ticketDetails.map((ticket) => ({
                  name: ticket.ticket_name,
                  quantity: ticket.quantity,
                  subtotal: (ticket.price * ticket.quantity)
                    .toFixed(2)
                    .toString(),
                })),
                subtotal: totalAmount,
                tax: createOrderDto.tax,
                grandTotal: totalAmountWithTax,
                paymentMethod: {
                  type: createOrderDto.payment_method,
                  transactionId: payment.order_id,
                },
              });
            }

            const ticketsReserved: Ticket[] = [];
            const orderTickets: OrderTicket[] = [];
            for (const ticket of tickets) {
              const ticket_code = uuidv4();
              const serial_code = uuidv4();

              const ticketEntity = this.ticketRepository.create({
                ticket_category_id: ticket.ticket_category_id,
                concert_id: ticket.concert_id,
                ticket_code,
                serial_code,
              });

              ticketsReserved.push(ticketEntity);

              const orderTicket = this.orderTicketRepository.create({
                order_id: order.order_id,
                ticket_id: ticketEntity.ticket_id,
                is_free:
                  createOrderDto.payment_status === 'free' ? true : false,
              });

              orderTickets.push(orderTicket);
            }
            await transactionalEntityManager.save(ticketsReserved);

            order.orderTickets = orderTickets;

            await transactionalEntityManager.save(order);
          },
        );

        return order;
      } catch (error) {
        if (
          error.message.includes('Not enough tickets available') ||
          error.message.includes('Ticket category not found')
        ) {
          throw error;
        }

        retryCount++;
        if (retryCount === this.MAX_RETRIES) {
          Logger.error('Max retries reached. Please try again later.', error);

          throw new Error('Max retries reached. Please try again later.');
        }
      }
    }
  }

  async handleOrderBilled(data: any) {
    const tickets = JSON.parse(data.session_object.metadata.products);
    const taxPercent = Number(data.session_object.metadata.tax_percentage);
    const order_id = Number(data.order_id);
    const customerName = data.session_object.customer_name;
    const payment_id = Number(data.payment_id);

    const items = tickets.map((ticket) => ({
      name: ticket.product_name,
      quantity: ticket.quantity,
      subtotal: (ticket.price * ticket.quantity).toFixed(2).toString(),
    }));

    try {
      const order = await this.orderRepository.findOne({ where: { order_id } });
      if (!order) {
        throw new Error('Order not found');
      }

      await this.entityManger.transaction(
        async (transactionalEntityManager) => {
          const newTickets: Ticket[] = [];
          const orderTickets: OrderTicket[] = [];

          for (const ticket of tickets) {
            const ticketCategory = await transactionalEntityManager.findOne(
              TicketCategory,
              { where: { ticket_category_id: ticket.product_id } },
            );

            if (!ticketCategory) {
              throw new Error(
                `Ticket category not found: ${ticket.product_id}`,
              );
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

              newTickets.push(ticketEntity);
            }
          }

          // Bulk insert tickets
          const savedTickets =
            await transactionalEntityManager.save(newTickets);

          // Prepare OrderTicket entries based on saved tickets
          savedTickets.forEach((savedTicket) => {
            orderTickets.push(
              this.orderTicketRepository.create({
                order_id: order.order_id,
                ticket_id: savedTicket.ticket_id,
              }),
            );
          });

          // Bulk insert OrderTicket entries
          await transactionalEntityManager.save(orderTickets);

          // Update order status and emit notification
          await transactionalEntityManager.update(Order, order_id, {
            status: 'completed',
          });

          const privateKey = this.configService.getOrThrow<string>(
            'INVOICE_PRIVATE_KEY',
          );

          const payload = `${order_id}:${payment_id}`;
          const sign = createSign('SHA256');
          sign.update(payload);
          sign.end();
          const signature = sign.sign(privateKey, 'base64');

          const qrCode = await QRCode.toDataURL(`${payload}:${signature}`);

          this.clientNotificationService.emit('order_invoice_email', {
            QRCode: qrCode,
            email: order.delivery_email_address,
            customerName,
            orderNumber: order.order_id,
            orderDate: new Date()
              .toISOString()
              .replace('T', ' ')
              .replace(/\..+/, ''),
            items,
            subtotal: order.total_price,
            tax: taxPercent,
            grandTotal: order.total_price * (1 + taxPercent / 100),
            paymentMethod: {
              type: data.session_object.payment_method_types[0],
              transactionId: data.session_object.id,
            },
          });

          if (order.register_id) {
            this.entityManger.update(Register, order.register_id, {
              is_used: true,
            });
          }

          this.sendTicketOrderToMailer(order_id);
        },
      );
    } catch (error) {
      this.logger.error('Failed to handle order billing', error.stack);
      throw new Error('Failed to handle order billing');
    }
  }

  async handleOrderFailed(data: any) {
    const order_id = Number(data.order_id);
    const tickets = JSON.parse(data.session_object.metadata.products);

    try {
      await this.entityManger.transaction(
        async (transactionalEntityManager) => {
          const ticketCategories: TicketCategory[] = [];
          const order = await transactionalEntityManager.findOne(
            this.orderRepository.target,
            {
              where: { order_id },
            },
          );
          if (!order) {
            throw new Error('Order not found');
          }

          if (order.status !== 'pending') {
            this.logger.log(`Order ${order_id} has already been processed`);
            throw new Error('Order has already been processed');
          }

          const newStatus =
            data.state === PaymentWebhookStat.CANCELED ? 'canceled' : 'failed';

          // Update the order status within the transaction
          await transactionalEntityManager.update(
            this.orderRepository.target,
            order_id,
            {
              status: newStatus,
              cancel_reason: data.reason,
            },
          );

          // Iterate through the tickets and update quantities within the transaction
          for (const ticket of tickets) {
            const ticketCategory = await transactionalEntityManager.findOne(
              this.ticketCategoryRepository.target,
              {
                where: { ticket_category_id: ticket.product_id },
              },
            );

            if (!ticketCategory) {
              throw new Error(
                `Ticket category not found: ${ticket.product_id}`,
              );
            }

            ticketCategory.quantity += ticket.quantity;
            ticketCategories.push(ticketCategory);
          }

          // Bulk update ticket quantities
          await transactionalEntityManager.save(ticketCategories);
        },
      );

      this.logger.log(
        `Order ${order_id} has been ${data.state === PaymentWebhookStat.CANCELED ? 'canceled' : 'failed'}. Reason: ${data.reason}`,
      );
    } catch (error) {
      this.logger.error('Failed to handle order failure', error.stack);
      throw new Error('Failed to handle order failure');
    }
  }

  async getOrderTickets(order_id: number) {
    return await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderTickets', 'orderTickets')
      .leftJoinAndSelect('orderTickets.ticket', 'ticket')
      .leftJoinAndSelect('ticket.concert', 'concert')
      .leftJoinAndSelect('concert.venue', 'venue')
      .leftJoinAndSelect('ticket.ticketCategory', 'ticketCategory')
      .where('order.order_id = :order_id', { order_id })
      .select([
        'order.order_id as order_id',
        'order.total_price as total_price',
        'order.delivery_address as delivery_address',
        'order.delivery_email_address  as delivery_email_address',
        'order.status as status',

        'ticket.ticket_id as ticket_id',
        'ticket.ticket_code as ticket_code',
        'ticket.serial_code as serial_code',

        'ticketCategory.ticket_category_id as ticket_category_id',
        'ticketCategory.ticket_category_name as ticket_category_name',
        'ticketCategory.price as price',
        'ticketCategory.start_date as start_date',
        'ticketCategory.end_date as end_date',
        'ticketCategory.area as area',

        'concert.concert_id as concert_id',
        'concert.concert_name as concert_name',
        'venue.venue_id as venue_id',
        'venue.venue_name as venue_name',
        'venue.location as location',
      ])
      .getRawMany();
  }

  async getTicketsByUserIdAndOrderId(user_id: number, order_id: number) {
    const order = await this.orderRepository.findOne({
      where: { user_id, order_id },
    });

    if (!order) {
      throw new HttpException('Order not found', HttpStatus.BAD_REQUEST);
    }

    return await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderTickets', 'orderTickets')
      .leftJoinAndSelect('orderTickets.ticket', 'ticket')
      .leftJoinAndSelect('ticket.concert', 'concert')
      .leftJoinAndSelect('concert.venue', 'venue')
      .leftJoinAndSelect('ticket.ticketCategory', 'ticketCategory')
      .where('order.order_id = :order_id', { order_id })
      .andWhere('order.user_id = :user_id', { user_id })
      .select([
        'order.order_id as order_id',
        'order.total_price as total_price',
        'order.delivery_address as delivery_address',
        'order.delivery_email_address  as delivery_email_address',
        'order.status as status',

        'ticket.ticket_id as ticket_id',
        'ticket.ticket_code as ticket_code',
        'ticket.serial_code as serial_code',

        'ticketCategory.ticket_category_id as ticket_category_id',
        'ticketCategory.ticket_category_name as ticket_category_name',
        'ticketCategory.price as price',
        'ticketCategory.start_date as start_date',
        'ticketCategory.end_date as end_date',
        'ticketCategory.area as area',

        'concert.concert_id as concert_id',
        'concert.concert_name as concert_name',
        'venue.venue_id as venue_id',
        'venue.venue_name as venue_name',
        'venue.location as location',
      ])
      .getRawMany();
  }

  async getTicketByUserIdAndOrderIdAndTicketId(
    user_id: number,
    order_id: number,
    ticket_id: number,
  ) {
    const order = await this.orderRepository.findOne({
      where: { user_id, order_id },
    });

    if (!order) {
      throw new HttpException('Order not found', HttpStatus.BAD_REQUEST);
    }

    return await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderTickets', 'orderTickets')
      .leftJoinAndSelect('orderTickets.ticket', 'ticket')
      .leftJoinAndSelect('ticket.concert', 'concert')
      .leftJoinAndSelect('concert.venue', 'venue')
      .leftJoinAndSelect('ticket.ticketCategory', 'ticketCategory')
      .where('order.order_id = :order_id', { order_id })
      .andWhere('order.user_id = :user_id', { user_id })
      .andWhere('ticket.ticket_id = :ticket_id', { ticket_id })
      .select([
        'order.order_id as order_id',
        'order.total_price as total_price',
        'order.delivery_address as delivery_address',
        'order.delivery_email_address  as delivery_email_address',
        'order.status as status',

        'ticket.ticket_id as ticket_id',
        'ticket.ticket_code as ticket_code',
        'ticket.serial_code as serial_code',

        'ticketCategory.ticket_category_id as ticket_category_id',
        'ticketCategory.ticket_category_name as ticket_category_name',
        'ticketCategory.price as price',
        'ticketCategory.start_date as start_date',
        'ticketCategory.end_date as end_date',
        'ticketCategory.area as area',

        'concert.concert_id as concert_id',
        'concert.concert_name as concert_name',
        'venue.venue_id as venue_id',
        'venue.venue_name as venue_name',
        'venue.location as location',
      ])
      .getRawOne();
  }

  async sendTicketOrderToMailer(order_id: number) {
    const order = await this.orderRepository.findOne({ where: { order_id } });
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.BAD_REQUEST);
    }

    const TicketsOrder = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderTickets', 'orderTickets')
      .leftJoinAndSelect('orderTickets.ticket', 'ticket')
      .leftJoinAndSelect('ticket.concert', 'concert')
      .leftJoinAndSelect('concert.venue', 'venue')
      .leftJoinAndSelect('ticket.ticketCategory', 'ticketCategory')
      .where('order.order_id = :order_id', { order_id })
      .select([
        'order.order_id as order_id',
        'order.total_price as total_price',
        'order.delivery_address as delivery_address',
        'order.delivery_email_address as delivery_email_address',
        'order.status as status',
        'order.created_at as order_date',

        'ticket.ticket_id as ticket_id',
        'ticket.ticket_code as ticket_code',
        'ticket.serial_code as serial_code',

        'ticketCategory.ticket_category_id as ticket_category_id',
        'ticketCategory.ticket_category_name as ticket_category_name',
        'ticketCategory.price as price',
        'ticketCategory.start_date as start_date',
        'ticketCategory.end_date as end_date',
        'ticketCategory.area as area',

        'concert.concert_id as concert_id',
        'concert.concert_name as concert_name',
        'venue.venue_id as venue_id',
        'venue.venue_name as venue_name',
        'venue.location as location',
      ])
      .getRawMany();

    const privateKey = this.configService.getOrThrow<string>(
      'PRIVATE_KEY_SIGNATURE',
    );

    const tickets = await Promise.all(
      TicketsOrder.map(async (ticket) => {
        const payload = `${ticket.ticket_id}:${ticket.ticket_code}`;
        const sign = createSign('SHA256');
        sign.update(payload);
        sign.end();
        const signature = sign.sign(privateKey, 'base64');

        return {
          qrCodeUrl: await QRCode.toDataURL(`${payload}:${signature}`),
          imageUrl: '',
          ticketNumber: ticket.ticket_id.toString().padStart(6, '0'),
          category: ticket.ticket_category_name,
          eventName: ticket.concert_name,
          startDate: ticket.start_date
            .toISOString()
            .replace('T', ' ')
            .replace(/\..+/, ''),
          endDate: ticket.end_date
            .toISOString()
            .replace('T', ' ')
            .replace(/\..+/, ''),
          location: ticket.location,
          owner: null,
          validUntil: ticket.end_date
            .toISOString()
            .replace('T', ' ')
            .replace(/\..+/, ''),
        };
      }),
    );

    this.clientNotificationService.emit('order_ticket_email', {
      email: TicketsOrder[0].delivery_email_address,
      poweredBy: 'Eventi',
      tickets,
    });
  }

  async register(createRegisterDto: CreateRegisterDto) {
    const register_code = uuidv4();
    const register = await this.registerRepository.save({
      ...createRegisterDto,
      register_code: await hash(register_code, 10),
    });

    return {
      ...register,
      register_code: register_code,
    };
  }

  async getRegisters() {
    return await this.registerRepository.find();
  }

  async getRegisterById(register_id: number) {
    return await this.registerRepository.findOne({ where: { register_id } });
  }

  async getRegisterByConcertId(concert_id: number) {
    return await this.registerRepository.find({ where: { concert_id } });
  }
  async deleteRegister(register_id: number) {
    return await this.registerRepository.delete({ register_id });
  }

  async createOrderByRegister(
    register_id: number,
    register_code: string,
    createOrderDto: CreateOrderDto,
  ) {
    const tickOrder = createOrderDto.tickets;
    const concertSets = new Set(tickOrder.map((ticket) => ticket.concert_id));

    if (concertSets.size > 1) {
      throw new HttpException(
        'Tickets must be from the same concert',
        HttpStatus.BAD_REQUEST,
      );
    }

    const register = await this.registerRepository.findOne({
      where: { register_id },
      relations: ['registrationRule'],
    });

    console.log(register);
    if (!register) {
      throw new HttpException('Register not found', HttpStatus.BAD_REQUEST);
    }

    if (register.registrationRule.valid_until < new Date()) {
      throw new HttpException(
        'registration is not available anymore',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (register.registrationRule.is_active === false) {
      throw new HttpException(
        'registration is not active',
        HttpStatus.BAD_REQUEST,
      );
    }

    /*if (register.registrationRule.available_from > new Date()) {
      throw new HttpException(
        'registration is not yet available',
        HttpStatus.BAD_REQUEST,
      );
    } */

    if (await compare(register_code, register.register_code)) {
      throw new HttpException('Invalid register code', HttpStatus.BAD_REQUEST);
    }
    if (register.concert_id !== tickOrder[0].concert_id) {
      throw new HttpException('Invalid concert id', HttpStatus.BAD_REQUEST);
    }

    if (register.is_used === true) {
      throw new HttpException(
        'Register code already used',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.createOrder(createOrderDto, null, register_id);

    if (result) {
      this.registerRepository.update(register_id, {
        is_used: true,
      });
    } else {
      throw new HttpException('Failed to create order', HttpStatus.BAD_REQUEST);
    }
    return result;
  }

  async getOrderForCurrentUserWithAggregate(
    query: FindOrdersDto,
    currentUserId: number,
  ): Promise<any> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.register', 'register');

    queryBuilder.andWhere('order.user_id = :user_id', {
      user_id: currentUserId,
    });

    if (query.register_id) {
      queryBuilder.andWhere('order.register_id = :register_id', {
        register_id: query.register_id,
      });
    }

    if (query.status) {
      queryBuilder.andWhere('order.status = :status', {
        status: query.status,
      });
    }

    if (query.payment_method) {
      queryBuilder.andWhere('order.payment_method = :payment_method', {
        payment_method: query.payment_method,
      });
    }

    if (query.start_date) {
      queryBuilder.andWhere('order.created_at >= :start_date', {
        start_date: query.start_date,
      });
    }

    if (query.end_date) {
      queryBuilder.andWhere('order.created_at <= :end_date', {
        end_date: query.end_date,
      });
    }

    if (query.total_price_gte) {
      queryBuilder.andWhere('order.total_price >= :total_price_gte', {
        total_price_gte: query.total_price_gte,
      });
    }

    if (query.total_price_lte) {
      queryBuilder.andWhere('order.total_price <= :total_price_lte', {
        total_price_lte: query.total_price_lte,
      });
    }

    const totalSalesQuery = await queryBuilder
      .clone()
      .select('SUM(order.total_price)', 'totalSales')
      .getRawOne();
    const totalSales = parseFloat(totalSalesQuery.totalSales) || 0;

    if (query.orderBy) {
      for (const [key, order] of Object.entries(query.orderBy)) {
        queryBuilder.addOrderBy(
          `order.${key}`,
          order.toUpperCase() as 'ASC' | 'DESC',
        );
      }
    }

    const limit = query.limit ?? 10;
    const offset = query.offset ?? 0;

    queryBuilder.limit(limit);
    queryBuilder.offset(offset);

    const orders = query.rawQuery
      ? await queryBuilder.getRawMany()
      : await queryBuilder.getMany();

    return {
      totalSales,
      orders,
    };
  }
}
