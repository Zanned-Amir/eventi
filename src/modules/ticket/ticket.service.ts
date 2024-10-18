import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket, TicketCategory } from 'src/database/entities/ticket';
import { Repository } from 'typeorm';
import { CreateTicketDto } from './dto/CreateTicketDto';
import { UpdateTicketDto } from './dto/UpdateTicketDto';
import { CreateTicketCategoryDto } from './dto/CreateTicketCategoryDto';
import { UpdateTicketCategoryDto } from './dto/UpdateTicketCategoryDto';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketCategory)
    private ticketCategoryRepository: Repository<TicketCategory>,
  ) {}

  //ticket

  async createTicket(createTicketDto: CreateTicketDto) {
    return await this.ticketRepository.save(createTicketDto);
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
