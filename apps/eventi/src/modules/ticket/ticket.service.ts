import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket, TicketCategory } from '../../database/entities/ticket';
import { Repository, EntityManager } from 'typeorm';
import { CreateTicketDto } from './dto/CreateTicketDto';
import { UpdateTicketDto } from './dto/UpdateTicketDto';
import { CreateTicketCategoryDto } from './dto/CreateTicketCategoryDto';
import { UpdateTicketCategoryDto } from './dto/UpdateTicketCategoryDto';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';
import { compare, hash } from 'bcrypt';
import { FindTicketsDto } from './dto/FindTicketsDto';
import { FindTicketsCategoriesDto } from './dto/FindTicketsCategoriesDto';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketCategory)
    private ticketCategoryRepository: Repository<TicketCategory>,
    private readonly entityManger: EntityManager,
  ) {}

  private readonly MAX_RETRIES = 5;

  async createTicket(createTicketDto: CreateTicketDto) {
    let retryCount = 0;

    while (retryCount < this.MAX_RETRIES) {
      try {
        return await this.entityManger.transaction(
          async (transactionalEntityManager) => {
            // Fetch the ticket category first
            const ticketCategory = await transactionalEntityManager.findOne(
              TicketCategory,
              {
                where: {
                  ticket_category_id: createTicketDto.ticket_category_id,
                },
              },
            );

            if (!ticketCategory) {
              throw new Error('Ticket category not found');
            }

            // Apply optimistic locking with the version from the fetched ticketCategory
            await transactionalEntityManager.findOne(TicketCategory, {
              where: { ticket_category_id: createTicketDto.ticket_category_id },
              lock: { mode: 'optimistic', version: ticketCategory.version },
            });

            // Check if there are enough tickets available
            if (ticketCategory.quantity < 1) {
              throw new Error('No tickets available');
            }

            // Reduce the ticket category quantity
            ticketCategory.quantity -= 1;

            // Save the updated ticket category
            await transactionalEntityManager.save(ticketCategory);

            // Create a new ticket
            const ticket_code = uuidv4();
            const serial_code = uuidv4();

            const ticket = this.ticketRepository.create({
              ...createTicketDto,
              ticket_code,
              serial_code,
            });

            // Save the ticket
            return await transactionalEntityManager.save(ticket);
          },
        );
      } catch (error) {
        if (error.name === 'OptimisticLockVersionMismatchError') {
          retryCount++;
          if (retryCount >= this.MAX_RETRIES) {
            throw new Error(
              'Failed to reserve a ticket due to concurrency issues.',
            );
          }
        } else {
          throw error;
        }
      }
    }
  }

  async updateTicket(ticketId: number, updateTicketDto: UpdateTicketDto) {
    const result = await this.ticketRepository.update(
      ticketId,
      updateTicketDto,
    );

    if (result.affected > 0) {
      return await this.ticketRepository.findOne({
        where: {
          ticket_id: ticketId,
        },
      });
    } else {
      throw new Error('Ticket not found');
    }
  }

  async convertTicketToQRCode(ticketId: number) {
    const ticket = await this.ticketRepository.findOne({
      where: {
        ticket_id: ticketId,
      },
    });

    if (!ticket) {
      throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
    }

    if (!ticket.ticket_code) {
      throw new HttpException('Ticket code is missing', HttpStatus.BAD_REQUEST);
    }

    try {
      const hashedTicketCode = await hash(ticket.ticket_code, 10);
      const qrCode = await QRCode.toDataURL(hashedTicketCode);
      return qrCode;
    } catch (error) {
      console.error('Error generating QR Code:', error);
      throw new HttpException(
        'Failed to generate QR Code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTickets(query: FindTicketsDto) {
    const queryBuilder = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.concert', 'concert')
      .leftJoinAndSelect('ticket.ticketCategory', 'ticketCategory');
    if (query.ticket_id) {
      queryBuilder.andWhere('ticket.ticket_id = :ticket_id', {
        ticket_id: query.ticket_id,
      });
    }

    if (query.concert_id) {
      queryBuilder.andWhere('ticket.concert_id = :concert_id', {
        concert_id: query.concert_id,
      });
    }

    if (query.ticket_code) {
      queryBuilder.andWhere('ticket.ticket_code LIKE :ticket_code', {
        ticket_code: `%${query.ticket_code}%`,
      });
    }

    if (query.is_used !== undefined) {
      queryBuilder.andWhere('ticket.is_used = :is_used', {
        is_used: query.is_used,
      });
    }

    if (query.ticket_category_id) {
      queryBuilder.andWhere('ticket.ticket_category_id = :ticket_category_id', {
        ticket_category_id: query.ticket_category_id,
      });
    }

    //price filter

    if (query.price) {
      queryBuilder.andWhere('ticketCategory.price = :price', {
        price: query.price,
      });
    }

    if (query.price_gte) {
      queryBuilder.andWhere('ticketCategory.price >= :price_gte', {
        price_gte: query.price_gte,
      });
    }

    if (query.price_lte) {
      queryBuilder.andWhere('ticketCategory.price <= :price_lte', {
        price_lte: query.price_lte,
      });
    }

    // Date filters (gte, lte)
    if (query.start_date) {
      queryBuilder.andWhere('ticket.created_at >= :start_date', {
        start_date: query.start_date,
      });
    }

    if (query.start_date_gte) {
      queryBuilder.andWhere('ticket.created_at >= :start_date_gte', {
        start_date_gte: query.start_date_gte,
      });
    }

    if (query.start_date_lte) {
      queryBuilder.andWhere('ticket.created_at <= :start_date_lte', {
        start_date_lte: query.start_date_lte,
      });
    }

    if (query.end_date) {
      queryBuilder.andWhere('ticket.created_at <= :end_date', {
        end_date: query.end_date,
      });
    }

    if (query.end_date_gte) {
      queryBuilder.andWhere('ticket.created_at >= :end_date_gte', {
        end_date_gte: query.end_date_gte,
      });
    }

    if (query.end_date_lte) {
      queryBuilder.andWhere('ticket.created_at <= :end_date_lte', {
        end_date_lte: query.end_date_lte,
      });
    }

    // Ordering
    if (query.orderBy) {
      for (const [key, order] of Object.entries(query.orderBy)) {
        queryBuilder.addOrderBy(
          `ticket.${key}`,
          order.toUpperCase() as 'ASC' | 'DESC',
        );
      }
    }

    // Pagination
    const limit = query.limit ?? 10;
    const offset = query.offset ?? 0;

    queryBuilder.limit(limit);
    queryBuilder.offset(offset);

    // Execute query
    const tickets = query.rawQuery
      ? await queryBuilder.getRawMany()
      : await queryBuilder.getMany();

    return tickets;
  }

  async getTicketById(ticketId: number) {
    return await this.ticketRepository.findOne({
      where: {
        ticket_id: ticketId,
      },
    });
  }

  async deleteTicket(ticketId: number) {
    return await this.ticketRepository.delete(ticketId);
  }

  //ticket category

  async createTicketCategory(CreateTicketCategoryDto: CreateTicketCategoryDto) {
    return await this.ticketCategoryRepository.save(CreateTicketCategoryDto);
  }

  async updateTicketCategory(
    ticketCategoryId: number,
    updateTicketCategoryDto: UpdateTicketCategoryDto,
  ) {
    const result = await this.ticketCategoryRepository.update(
      ticketCategoryId,
      updateTicketCategoryDto,
    );

    if (result.affected > 0) {
      return await this.ticketCategoryRepository.findOne({
        where: {
          ticket_category_id: ticketCategoryId,
        },
      });
    } else {
      throw new Error('Ticket category not found');
    }
  }

  async getTicketCategories(query: FindTicketsCategoriesDto) {
    const queryBuilder =
      this.ticketCategoryRepository.createQueryBuilder('ticketCategory');

    if (query.ticket_category_id) {
      queryBuilder.andWhere(
        'ticketCategory.ticket_category_id = :ticket_category_id',
        {
          ticket_category_id: query.ticket_category_id,
        },
      );
    }

    if (query.ticket_category_name) {
      queryBuilder.andWhere(
        'LOWER(ticketCategory.ticket_category_name) LIKE LOWER(:ticket_category_name)',
        {
          ticket_category_name: `%${query.ticket_category_name}%`,
        },
      );
    }

    if (query.ticket_category_description) {
      queryBuilder.andWhere(
        'LOWER(ticketCategory.ticket_category_description) LIKE LOWER(:ticket_category_description)',
        {
          ticket_category_description: `%${query.ticket_category_description}%`,
        },
      );
    }

    if (query.price) {
      queryBuilder.andWhere('ticketCategory.price = :price', {
        price: query.price,
      });
    }

    if (query.price_gte) {
      queryBuilder.andWhere('ticketCategory.price >= :price_gte', {
        price_gte: query.price_gte,
      });
    }

    if (query.price_lte) {
      queryBuilder.andWhere('ticketCategory.price <= :price_lte', {
        price_lte: query.price_lte,
      });
    }

    if (query.quantity) {
      queryBuilder.andWhere('ticketCategory.quantity = :quantity', {
        quantity: query.quantity,
      });
    }

    if (query.quantity_gte) {
      queryBuilder.andWhere('ticketCategory.quantity >= :quantity_gte', {
        quantity_gte: query.quantity_gte,
      });
    }

    if (query.quantity_lte) {
      queryBuilder.andWhere('ticketCategory.quantity <= :quantity_lte', {
        quantity_lte: query.quantity_lte,
      });
    }

    if (query.start_date) {
      queryBuilder.andWhere('ticketCategory.start_date = :start_date', {
        start_date: query.start_date,
      });
    }

    if (query.start_date_gte) {
      queryBuilder.andWhere('ticketCategory.start_date >= :start_date_gte', {
        start_date_gte: query.start_date_gte,
      });
    }

    if (query.start_date_lte) {
      queryBuilder.andWhere('ticketCategory.start_date <= :start_date_lte', {
        start_date_lte: query.start_date_lte,
      });
    }

    if (query.end_date) {
      queryBuilder.andWhere('ticketCategory.end_date = :end_date', {
        end_date: query.end_date,
      });
    }

    if (query.end_date_gte) {
      queryBuilder.andWhere('ticketCategory.end_date >= :end_date_gte', {
        end_date_gte: query.end_date_gte,
      });
    }

    if (query.end_date_lte) {
      queryBuilder.andWhere('ticketCategory.end_date <= :end_date_lte', {
        end_date_lte: query.end_date_lte,
      });
    }

    if (query.area) {
      queryBuilder.andWhere('ticketCategory.area = :area', {
        area: query.area,
      });
    }

    if (query.default_quantity) {
      queryBuilder.andWhere(
        'ticketCategory.default_quantity = :default_quantity',
        {
          default_quantity: query.default_quantity,
        },
      );
    }

    if (query.default_quantity_gte) {
      queryBuilder.andWhere(
        'ticketCategory.default_quantity >= :default_quantity_gte',
        {
          default_quantity_gte: query.default_quantity_gte,
        },
      );
    }

    if (query.default_quantity_lte) {
      queryBuilder.andWhere(
        'ticketCategory.default_quantity <= :default_quantity_lte',
        {
          default_quantity_lte: query.default_quantity_lte,
        },
      );
    }

    // Ordering

    if (query.orderBy) {
      for (const [key, order] of Object.entries(query.orderBy)) {
        queryBuilder.addOrderBy(
          `ticketCategory.${key}`,
          order.toUpperCase() as 'ASC' | 'DESC',
        );
      }
    }

    // Pagination

    const limit = query.limit ?? 10;
    const offset = query.offset ?? 0;

    queryBuilder.limit(limit);
    queryBuilder.offset(offset);

    // Execute query

    const ticketCategories = query.rawQuery
      ? await queryBuilder.getRawMany()
      : await queryBuilder.getMany();

    return ticketCategories;
  }

  async getTicketCategoryById(ticketCategoryId: number) {
    return await this.ticketCategoryRepository.findOne({
      where: {
        ticket_category_id: ticketCategoryId,
      },
    });
  }

  async deleteTicketCategory(ticketCategoryId: number) {
    return await this.ticketCategoryRepository.delete(ticketCategoryId);
  }

  async scanTicket(ticket_id: number, hashed_ticket_id: string) {
    const ticket = await this.ticketRepository.findOne({
      where: {
        ticket_id: ticket_id,
      },
      relations: ['ticketCategory'],
    });

    if (!ticket) {
      throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
    }

    const isMatch = await compare(ticket.ticket_code, hashed_ticket_id);

    if (!isMatch) {
      throw new HttpException('Invalid ticket code', HttpStatus.BAD_REQUEST);
    }

    if (ticket.is_used) {
      throw new HttpException('Ticket already scanned', HttpStatus.BAD_REQUEST);
    }

    if (ticket.ticketCategory.start_date > new Date()) {
      throw new HttpException('Ticket has not started', HttpStatus.BAD_REQUEST);
    }

    if (ticket.ticketCategory.end_date < new Date()) {
      throw new HttpException('Ticket has expired', HttpStatus.BAD_REQUEST);
    }

    if (isMatch) {
      ticket.is_used = true;
      await this.ticketRepository.save(ticket);
      return true;
    }

    return false;
  }

  async getTicketForCurrentUserWithAggregate(
    query: FindTicketsDto,
    currentUserId: number,
  ): Promise<any> {
    const queryBuilder = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.concert', 'concert')
      .leftJoinAndSelect('ticket.ticketCategory', 'ticketCategory');

    queryBuilder.andWhere('ticket.user_id = :user_id', {
      user_id: currentUserId,
    });

    if (query.ticket_id) {
      queryBuilder.andWhere('ticket.ticket_id = :ticket_id', {
        ticket_id: query.ticket_id,
      });
    }

    if (query.concert_id) {
      queryBuilder.andWhere('ticket.concert_id = :concert_id', {
        concert_id: query.concert_id,
      });
    }

    if (query.ticket_code) {
      queryBuilder.andWhere('ticket.ticket_code LIKE :ticket_code', {
        ticket_code: `%${query.ticket_code}%`,
      });
    }

    if (query.is_used !== undefined) {
      queryBuilder.andWhere('ticket.is_used = :is_used', {
        is_used: query.is_used,
      });
    }

    if (query.ticket_category_id) {
      queryBuilder.andWhere('ticket.ticket_category_id = :ticket_category_id', {
        ticket_category_id: query.ticket_category_id,
      });
    }

    // Date filters (gte, lte)
    if (query.start_date) {
      queryBuilder.andWhere('ticket.created_at >= :start_date', {
        start_date: query.start_date,
      });
    }

    if (query.start_date_gte) {
      queryBuilder.andWhere('ticket.created_at >= :start_date_gte', {
        start_date_gte: query.start_date_gte,
      });
    }

    if (query.start_date_lte) {
      queryBuilder.andWhere('ticket.created_at <= :start_date_lte', {
        start_date_lte: query.start_date_lte,
      });
    }

    if (query.end_date) {
      queryBuilder.andWhere('ticket.created_at <= :end_date', {
        end_date: query.end_date,
      });
    }

    if (query.end_date_gte) {
      queryBuilder.andWhere('ticket.created_at >= :end_date_gte', {
        end_date_gte: query.end_date_gte,
      });
    }

    if (query.end_date_lte) {
      queryBuilder.andWhere('ticket.created_at <= :end_date_lte', {
        end_date_lte: query.end_date_lte,
      });
    }

    // Ordering
    if (query.orderBy) {
      for (const [key, order] of Object.entries(query.orderBy)) {
        queryBuilder.addOrderBy(
          `ticket.${key}`,
          order.toUpperCase() as 'ASC' | 'DESC',
        );
      }
    }

    // Pagination
    const limit = query.limit ?? 10;
    const offset = query.offset ?? 0;

    queryBuilder.limit(limit);
    queryBuilder.offset(offset);

    // Execute query
    const tickets = query.rawQuery
      ? await queryBuilder.getRawMany()
      : await queryBuilder.getMany();

    return tickets;
  }
}
