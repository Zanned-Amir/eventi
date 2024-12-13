import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import {
  externalProvider,
  Permission,
  UserAccount,
  UserLoginData,
  UserLoginDataExternal,
  UserRole,
  UserTokens,
} from '../database/entities/user';
import {
  Artist,
  Concert,
  ConcertGroup,
  ConcertMember,
  ConcertRole,
  Genre,
  Role,
  Venue,
} from '../database/entities/concert';
import { FileAssociation, File } from '../database/entities/file';
import {
  Order,
  OrderTicket,
  OrderTicketCategory,
  Register,
  RegistrationRule,
} from '../database/entities/order';
import { Payment } from '../database/entities/payment/payment.entity';
import { Ticket, TicketCategory } from '../database/entities/ticket';

import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../../.env') });

export default (): PostgresConnectionOptions => ({
  type: 'postgres',
  host:
    process.env.NODE_ENV === 'production'
      ? process.env.DB_HOST_PROD
      : process.env.DB_HOST,
  port:
    process.env.NODE_ENV === 'production'
      ? +process.env.DB_PORT_PROD
      : +process.env.DB_PORT,
  username:
    process.env.NODE_ENV === 'production'
      ? process.env.DB_USERNAME_PROD
      : process.env.DB_USERNAME,
  password:
    process.env.NODE_ENV === 'production'
      ? process.env.DB_PASSWORD_PROD
      : process.env.DB_PASSWORD,
  database:
    process.env.NODE_ENV === 'production'
      ? process.env.DB_NAME_PROD
      : process.env.DB_NAME,
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  entities: [
    UserAccount,
    UserLoginData,
    UserLoginDataExternal,
    UserTokens,
    UserRole,
    externalProvider,
    Permission,
    Order,
    OrderTicket,
    Ticket,
    TicketCategory,
    Artist,
    Concert,
    ConcertGroup,
    ConcertMember,
    ConcertRole,
    Genre,
    Role,
    Venue,
    OrderTicketCategory,
    Register,
    RegistrationRule,
    Payment,
    File,
    FileAssociation,
  ],
});
