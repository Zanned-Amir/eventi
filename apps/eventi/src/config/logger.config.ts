import * as winston from 'winston';
import * as MongoDB from 'winston-mongodb';
import * as WinstonElasticsearch from 'winston-elasticsearch';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

// Define custom log levels
const customLogLevels = {
  levels: {
    critical: 0, // Highest severity
    error: 1,
    warn: 2,
    info: 3,
    http: 4,
    user: 5,
    verbose: 6,
    debug: 7,
    silly: 8,
  },
  colors: {
    critical: 'magenta',
    error: 'red',
    warn: 'yellow',
    info: 'blue',
    http: 'cyan',
    user: 'green',
    verbose: 'white',
    debug: 'gray',
    silly: 'gray',
  },
};

// Elasticsearch Transport Configuration
const elasticsearchTransportOptions: WinstonElasticsearch.ElasticsearchTransportOptions =
  {
    level: 'info',
    clientOpts: {
      node: process.env.ELASTICSEARCH_URI || 'http://localhost:9200',
      auth: {
        username: process.env.ES_USERNAME || '',
        password: process.env.ES_PASSWORD || '',
      },
    },
    indexPrefix: 'nestjs-application-logs',
    transformer: (logData) => {
      const { message, level, metadata, timestamp } =
        (logData as any).metadata || {}; // Type-cast to include metadata
      return {
        '@timestamp': timestamp,
        severity: level,
        message,
        application: process.env.APP_NAME || 'MyApp',
        server: process.env.SERVER_NAME || 'localhost',
        ...metadata,
      };
    },
  };

// Create Winston Logger
export const winstonConfig = {
  levels: customLogLevels.levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    // Console Transport
    new winston.transports.Console({
      level: 'silly', // Enable all levels for console transport
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),

        nestWinstonModuleUtilities.format.nestLike(
          process.env.APP_NAME || 'MyApp',
          {
            colors: true,
            prettyPrint: true,
            processId: true,
            appName: true,
          },
        ),
      ),
    }),

    // Daily Rotate File Transport for Critical Logs
    new DailyRotateFile({
      level: 'error',
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),

    // Daily Rotate File Transport for User Logs
    new DailyRotateFile({
      level: 'critical',
      filename: 'logs/critical-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),

    // MongoDB Transport for Error Logs
    new MongoDB.MongoDB({
      db: process.env.MONGODB_URI || 'mongodb://localhost:27017/logs',
      level: 'error', // Only log error-level logs in MongoDB
      collection: 'error-logs',
      metaKey: 'metadata',
      storeHost: true, // Log the hostname
    }),

    // MongoDB Transport for Critical Logs
    new MongoDB.MongoDB({
      db: process.env.MONGODB_URI || 'mongodb://localhost:27017/logs',
      level: 'critical', // Only log critical-level logs in MongoDB
      collection: 'critical-logs',
      metaKey: 'metadata',
      storeHost: true, // Log the hostname
    }),

    new MongoDB.MongoDB({
      db: process.env.MONGODB_URI || 'mongodb://localhost:27017/logs',
      level: 'user',
      collection: 'user-logs',
      metaKey: 'metadata',
      storeHost: true,
    }),

    // Elasticsearch Transport
    new WinstonElasticsearch.ElasticsearchTransport(
      elasticsearchTransportOptions,
    ),
  ],
};

// Add custom colors for log levels
winston.addColors(customLogLevels.colors);
