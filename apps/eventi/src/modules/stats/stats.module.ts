import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Concert } from '../../database/entities/concert';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { UserAccount } from '../../database/entities/user';
import { Ticket, TicketCategory } from '../../database/entities/ticket';
import { Order } from '../../database/entities/order';
import { Payment } from '../../database/entities/payment/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserAccount,
      Concert,
      TicketCategory,
      Ticket,
      Order,
      Payment,
    ]),
  ],
  providers: [StatsService],
  controllers: [StatsController],
  exports: [StatsService],
})
export class StatsModule {}
