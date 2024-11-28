// src/config/mongodb.connection.ts
import { MongoClient } from 'mongodb';
import { Logger } from '@nestjs/common';

// Function to test MongoDB connection with NestJS Logger
export async function testMongoDBConnection(uri?: string) {
  const logger = new Logger('MongoDBConnection'); // Instantiate the NestJS Logger
  const connectionUri =
    uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/logs';

  try {
    logger.log(`Attempting to connect to MongoDB with URI: ${connectionUri}`);

    const client = new MongoClient(connectionUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    });

    await client.connect();
    logger.log('✅ Successfully connected to MongoDB');

    await client.close();
    return true;
  } catch (error) {
    logger.error('❌ MongoDB Connection Failed:', error.message || error);
    return false;
  }
}
