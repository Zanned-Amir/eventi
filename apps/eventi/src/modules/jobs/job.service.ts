import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLoginData, UserTokens } from '../../database/entities/user';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);

  constructor(
    @InjectRepository(UserTokens)
    private userTokensRepository: Repository<UserTokens>,
    @InjectRepository(UserLoginData)
    private userLoginDataRepository: Repository<UserLoginData>,
  ) {}

  // clear for expired tokens or blacklisted tokens
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'clear_expired_tokens',
    timeZone: 'Europe/Paris',
  })
  async clearExpiredTokens() {
    this.logger.debug('Clearing expired tokens...');
    const result = await this.userTokensRepository
      .createQueryBuilder()
      .delete()
      .from(UserTokens)
      .where('expires_at < NOW() OR is_in_blacklist = true')
      .execute();

    this.logger.debug(
      `Deleted ${result.affected} expired or blacklisted tokens`,
    );
  }

  // set user login data to inactive in case of inactivity for 30 days
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'clear_inactive_users',
    timeZone: 'Europe/Paris',
  })
  async clearInactiveUsers() {
    this.logger.debug('Clearing inactive users...');

    const inactivityThreshold = 30;

    const result = await this.userLoginDataRepository
      .createQueryBuilder()
      .update(UserLoginData)
      .set({
        account_status: 'INACTIVE',
      })
      .where(
        `(last_activity_timestamp IS NULL OR last_activity_timestamp < NOW() - INTERVAL '${inactivityThreshold} days') 
         AND (last_login_timestamp IS NULL OR last_login_timestamp < NOW() - INTERVAL '${inactivityThreshold} days')`,
      )
      .execute();

    this.logger.debug(
      `Marked ${result.affected} users inactive after ${inactivityThreshold} days of inactivity`,
    );
  }

  // set user that last activity  less than 30 days to active
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'set_active_users',
    timeZone: 'Europe/Paris',
  })
  async setActiveUsers() {
    this.logger.debug('Setting active users...');

    const inactivityThreshold = 30;

    const result = await this.userLoginDataRepository
      .createQueryBuilder()
      .update(UserLoginData)
      .set({
        account_status: 'ACTIVE',
      })
      .where(
        `(last_activity_timestamp IS NOT NULL AND last_activity_timestamp > NOW() - INTERVAL '${inactivityThreshold} days') 
         OR (last_login_timestamp IS NOT NULL AND last_login_timestamp > NOW() - INTERVAL '${inactivityThreshold} days')`,
      )
      .execute();

    this.logger.debug(
      `Marked ${result.affected} users active after ${inactivityThreshold} days of inactivity`,
    );
  }
}
