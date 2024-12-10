import * as winston from 'winston';
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
winston.addColors(customLogLevels.colors);

// Elasticsearch Transport Configuration

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
      level: 'silly',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize({
          all: true,
        }), // Add colors to all levels
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
      maxFiles: '1d',
      format: winston.format.combine(
        winston.format((info) => {
          return info.level === 'error' ? info : false; // Only include 'error' level logs
        })(),
      ),
    }),

    // Daily Rotate File Transport for User Logs
    new DailyRotateFile({
      level: 'critical',
      filename: 'logs/critical-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '1d',
      format: winston.format.combine(
        winston.format((info) => {
          return info.level === 'critical' ? info : false; // Only include 'critical' level logs
        })(),
      ),
    }),
    /*
    new MongoDB.MongoDB({
      db: process.env.MONGODB_URI || 'mongodb://localhost:27017/logs',
      level: 'user',
      collection: 'user-logs',
      metaKey: 'metadata',
      storeHost: true,
      format: winston.format.combine(
        winston.format((info) => {
          return info.level === 'user' ? info : false;
        })(),
      ),
    }),

    new MongoDB.MongoDB({
      db: process.env.MONGODB_URI || 'mongodb://localhost:27017/logs',
      level: 'critical',
      collection: 'critical-logs',
      metaKey: 'metadata',
      storeHost: true,
      format: winston.format.combine(
        winston.format((info) => {
          return info.level === 'critical' ? info : false; // Only include 'critical' level logs
        })(),
      ),
    }),

    new MongoDB.MongoDB({
      db: process.env.MONGODB_URI || 'mongodb://localhost:27017/logs',
      level: 'error',
      collection: 'error-logs',
      metaKey: 'metadata',
      storeHost: true,
      format: winston.format.combine(
        winston.format((info) => {
          return info.level === 'error' ? info : false; // Only include 'error' level logs
        })(),
      ),
    }),
*/
    // Elasticsearch Transport
  ],
};
