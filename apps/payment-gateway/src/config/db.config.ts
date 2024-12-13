import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { Payment } from '../database/entities/payment.entity';

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
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  entities: [Payment],
});
