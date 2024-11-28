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
  Query,
  HttpCode,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/CreateTicketDto';
import { UpdateTicketDto } from './dto/UpdateTicketDto';
import { CreateTicketCategoryDto } from './dto/CreateTicketCategoryDto';
import { UpdateTicketCategoryDto } from './dto/UpdateTicketCategoryDto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../database/entities/user/userRole.entity';
import { FindTicketsDto } from './dto/FindTicketsDto';
import { FindTicketsCategoriesDto } from './dto/FindTicketsCategoriesDto';

@Controller('tickets')
@Roles(Role.ADMIN, Role.SUPPORT_STAFF)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get()
  async getTickets(@Query() query: FindTicketsDto) {
    const tickets = await this.ticketService.getTickets(query);
    return {
      status: 'success',
      count: tickets.length,
      data: tickets,
    };
  }

  @Get('category')
  async getTicketCategories(@Query() query: FindTicketsCategoriesDto) {
    const ticketCategories =
      await this.ticketService.getTicketCategories(query);
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
  @Post('convert-to-qr/:id')
  async convertTicketToQRCode(@Param('id', ParseIntPipe) id: number) {
    const qrCode = await this.ticketService.convertTicketToQRCode(id);

    return {
      status: 'success',
      data: qrCode,
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

  @HttpCode(200)
  @Post('validate/:ticket_id/ticket-code')
  async scanTicket(
    @Param('ticket_id') ticketId: number,
    @Body('ticket_code_h') hashedTicketCode: string,
    @Body('signature') signature: string,
  ) {
    const ticket = await this.ticketService.scanTicket(
      ticketId,
      hashedTicketCode,
      signature,
    );
    if (ticket === true) {
      return {
        status: 'success',
        message: 'Ticket scanned successfully',
      };
    }
    return {
      status: 'error',
      message: ticket,
    };
  }
}
