import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAccount } from '../../database/entities/user';
import { TicketCategory } from '../../database/entities/ticket';
import { Concert } from '../../database/entities/concert';
import { Order } from '../../database/entities/order';
import { Role } from '../../database/entities/user/userRole.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(UserAccount)
    private userRepo: Repository<UserAccount>,
    @InjectRepository(TicketCategory)
    private ticketCategoryRepo: Repository<TicketCategory>,
    @InjectRepository(Concert)
    private concertRepo: Repository<Concert>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {}

  async getTotalConcerts(): Promise<number> {
    return this.concertRepo.count();
  }

  async getTotalOrderRevenue(query): Promise<number> {
    const queryBuilder = this.orderRepo
      .createQueryBuilder('order')
      .where('concert.status = :status', { status: 'completed' })
      .andWhere('concert.payment_date IS NOT NULL');

    if (query.startDate && query.endDate) {
      queryBuilder.andWhere(
        'concert.start_date BETWEEN :startDate AND :endDate',
        {
          startDate: query.startDate,
          endDate: query.endDate,
        },
      );
    }

    return queryBuilder
      .select('SUM(order.total_price)', 'totalRevenue')
      .getRawOne();
  }

  async getTicketSalesByCategory(): Promise<any[]> {
    return this.ticketCategoryRepo
      .createQueryBuilder('ticketCategory')
      .leftJoinAndSelect('ticketCategory.tickets', 'tickets')
      .select([
        'ticketCategory.ticket_category_name AS category',
        'COUNT(tickets.ticket_id) AS ticketsSold',
      ])
      .groupBy('ticketCategory.ticket_category_id')
      .getRawMany();
  }

  async getRevenueByConcert(): Promise<any[]> {
    return this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.orderTicketCategories', 'categories')
      .leftJoinAndSelect('categories.ticketCategory', 'ticketCategory')
      .select([
        'ticketCategory.concert_id AS concert',
        'SUM(order.total_price) AS totalRevenue',
      ])
      .groupBy('ticketCategory.concert_id')
      .getRawMany();
  }

  async countUsersWithUserRole(query: any): Promise<number> {
    const queryBuilder = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRole', 'role')
      .where('role.role_name = :role', { role: Role.USER });

    if (query.startDate && query.endDate) {
      queryBuilder.andWhere('user.created_at BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      });
    }

    return queryBuilder.getCount();
  }
}
