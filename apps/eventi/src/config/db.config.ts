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
  OrderTicket,
  Order,
  OrderTicketCategory,
  Register,
  RegistrationRule,
} from '../database/entities/order';
import { Ticket, TicketCategory } from '../database/entities/ticket';
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
import { Payment } from '../database/entities/payment/payment.entity';

export default (): PostgresConnectionOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: true,
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
  ],
});
