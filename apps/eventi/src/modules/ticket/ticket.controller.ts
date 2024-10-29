import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  NotFoundException,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/CreateTicketDto';
import { UpdateTicketDto } from './dto/UpdateTicketDto';
import { CreateTicketCategoryDto } from './dto/CreateTicketCategoryDto';
import { UpdateTicketCategoryDto } from './dto/UpdateTicketCategoryDto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Public()
  @Get()
  async getTickets() {
    const tickets = await this.ticketService.getTickets();
    return {
      status: 'success',
      count: tickets.length,
      data: tickets,
    };
  }

  @Public()
  @Get('category')
  async getTicketCategories() {
    const ticketCategories = await this.ticketService.getTicketCategories();
    return {
      status: 'success',
      count: ticketCategories.length,
      data: ticketCategories,
    };
  }

  @Public()
  @Get(':id')
  async getTicket(@Param('id', ParseIntPipe) id: number) {
    const ticket = await this.ticketService.getTicketById(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return {
      status: 'success',
      data: ticket,
    };
  }

  @Post()
  async createTicket(@Body() createTicketDto: CreateTicketDto) {
    const ticket = await this.ticketService.createTicket(createTicketDto);
    return {
      status: 'success',
      data: ticket,
    };
  }

  @Patch(':id')
  async updateTicket(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    const ticket = await this.ticketService.updateTicket(id, updateTicketDto);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return {
      status: 'success',
      data: ticket,
    };
  }

  @Delete(':id')
  async deleteTicket(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.ticketService.deleteTicket(id);
    if (!deleted) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return {
      status: 'success',
      message: 'Ticket deleted successfully',
    };
  }

  // Ticket category endpoints

  @Post('category')
  async createTicketCategory(
    @Body() createTicketCategoryDto: CreateTicketCategoryDto,
  ) {
    const ticketCategory = await this.ticketService.createTicketCategory(
      createTicketCategoryDto,
    );
    return {
      status: 'success',
      data: ticketCategory,
    };
  }

  @Get('category/:id')
  async getTicketCategory(@Param('id', ParseIntPipe) id: number) {
    const ticketCategory = await this.ticketService.getTicketCategoryById(id);
    if (!ticketCategory) {
      throw new NotFoundException(`Ticket category with ID ${id} not found`);
    }
    return {
      status: 'success',
      data: ticketCategory,
    };
  }

  @Patch('category/:id')
  async updateTicketCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTicketCategoryDto: UpdateTicketCategoryDto,
  ) {
    const ticketCategory = await this.ticketService.updateTicketCategory(
      id,
      updateTicketCategoryDto,
    );
    if (!ticketCategory) {
      throw new NotFoundException(`Ticket category with ID ${id} not found`);
    }
    return {
      status: 'success',
      data: ticketCategory,
    };
  }

  @Delete('category/:id')
  async deleteTicketCategory(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.ticketService.deleteTicketCategory(id);
    if (!deleted) {
      throw new NotFoundException(`Ticket category with ID ${id} not found`);
    }
    return {
      status: 'success',
      message: 'Ticket category deleted successfully',
    };
  }
}
