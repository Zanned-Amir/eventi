import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { StatsService } from './stats.service';

@ApiTags('Statistics')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('total-concerts')
  @ApiOperation({ summary: 'Get total number of concerts' })
  @ApiResponse({
    status: 200,
    description: 'Total number of concerts retrieved.',
  })
  async getTotalConcerts(): Promise<number> {
    return this.statsService.getTotalConcerts();
  }

  @Get('total-order-revenue')
  @ApiOperation({ summary: 'Get total order revenue within a date interval' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date (YYYY-MM-DD)',
  })
  @ApiResponse({ status: 200, description: 'Total order revenue retrieved.' })
  async getTotalOrderRevenue(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<number> {
    return this.statsService.getTotalOrderRevenue({ startDate, endDate });
  }

  @Get('ticket-sales-by-category')
  @ApiOperation({ summary: 'Get ticket sales grouped by category' })
  @ApiResponse({ status: 200, description: 'Ticket sales data retrieved.' })
  async getTicketSalesByCategory(): Promise<any[]> {
    return this.statsService.getTicketSalesByCategory();
  }

  @Get('revenue-by-concert')
  @ApiOperation({ summary: 'Get revenue grouped by concert' })
  @ApiResponse({ status: 200, description: 'Concert revenue data retrieved.' })
  async getRevenueByConcert(): Promise<any[]> {
    return this.statsService.getRevenueByConcert();
  }

  @Get('users-with-role')
  @ApiOperation({
    summary: 'Count users with a specific role within a date interval',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date (YYYY-MM-DD)',
  })
  @ApiResponse({ status: 200, description: 'User count retrieved.' })
  async countUsersWithUserRole(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<number> {
    return this.statsService.countUsersWithUserRole({ startDate, endDate });
  }
}
