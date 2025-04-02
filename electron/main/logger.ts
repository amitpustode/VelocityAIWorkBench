import winston from 'winston';
import 'winston-daily-rotate-file';
import moment from 'moment';
import { logsDir } from './electronConfig';

// Custom colors for log levels
const levelColors = {
  silly: 'magenta',
  debug: 'cyan',
  verbose: 'green',
  info: 'blue',
  warn: 'yellow',
  error: 'red'
};

// Define initial log level (default)
let currentLogLevel = 'silly';

// Logger format with colored levels
const customConsoleFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.colorize({
    colors: levelColors // Apply custom colors for each log level
  }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}]: ${message}`;
  })
);

// Create Winston logger instance
export const logger = winston.createLogger({
  level: currentLogLevel, // Use the variable instead of hardcoding
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      dirname: logsDir,
      filename: 'application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '10d',
      zippedArchive: true,
      level: currentLogLevel, // Ensure initial level is used
    }),
    new winston.transports.Console({
      format: customConsoleFormat,
      level: currentLogLevel, // Ensure initial level is used
    })
  ],
});

// Function to update log level dynamically
export const updateLogLevel = (newLevel:any) => {
  if (winston.config.npm.levels[newLevel] !== undefined) {
    currentLogLevel = newLevel;
    
    // Update log level for all transports
    logger.transports.forEach((transport) => {
      transport.level = newLevel;
    });

    logger.info(`Log level changed to: ${newLevel}`);
  } else {
    logger.warn(`Invalid log level: ${newLevel}`);
  }
};
