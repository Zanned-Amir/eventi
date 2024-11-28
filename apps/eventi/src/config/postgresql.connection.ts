// src/config/postgresql.connection.ts
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';

export async function testPostgresConnection(dataSource: DataSource) {
  const logger = new Logger('PostgresConnection'); // Instantiate NestJS Logger

  try {
    logger.log('Attempting to connect to PostgreSQL...');
    await dataSource.initialize(); // Try to connect to the database

    logger.log('✅ Successfully connected to PostgreSQL');

    // Optionally, check some metadata or run a query to verify connection
    const queryRunner = dataSource.createQueryRunner();
    const databases = await queryRunner.query('SELECT current_database();');
    logger.log(`Connected to the database: ${databases[0].current_database}`);

    await dataSource.destroy(); // Clean up the connection
    return true;
  } catch (error) {
    logger.error('❌ PostgreSQL Connection Failed:', error.message || error);
    return false;
  }
}
