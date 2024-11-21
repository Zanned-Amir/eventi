import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket, TicketCategory } from '../../database/entities/ticket';

@Module({
  providers: [TicketService],
  controllers: [TicketController],
  imports: [TypeOrmModule.forFeature([Ticket, TicketCategory])],
  exports: [TicketService],
})
export class TicketModule {}
