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
import { hash } from 'bcrypt';

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

  async getTickets() {
    return await this.ticketRepository.find();
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

  async getTicketCategories() {
    return await this.ticketCategoryRepository.find();
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
}
