import config from '../config';

import winston from 'winston';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
const { combine, timestamp, label, printf } = winston.format;

// Define the directory path for logs
const logDir = 'logs';

// Create the log directory if it does not exist
if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

// Function to get a label for a given module filename
const getLabel = function (module: any) {
  // Split the filename path and return the last two parts
  const parts = module.filename.split(path.sep);
  return parts[parts.length - 2] + path.sep + parts.pop();
};

// Define a custom log format using winston's printf
const customFormat = printf((data: winston.Logform.TransformableInfo) => {
  if (data.message && typeof data.message === 'object') {
    // Format log message for objects
    return `${data.level}: ${data.timestamp} [${data.label} - ${data.message!['fn']}()] ${
      typeof data.message!['text'] === 'string' ? data.message!['text'] : JSON.stringify(data.message!['text'], null, 2)
    }`;
  } else {
    // Format log message for non-objects
    return `${data.level}: ${data.timestamp} [${data.label}] ${data.message}`;
  }
});

// Function to create and configure a logger based on a module
const getLogger = function (module: any) {
  return winston.createLogger({
    // Set the log level based on the configuration
    level: config.logs.level,

    // Set log levels based on npm levels
    levels: winston.config.npm.levels,

    // Configure log format with label, timestamp, and custom format
    format: combine(label({ label: getLabel(module) }), timestamp(), customFormat),

    // Configure transports (output destinations)
    transports: [
      // Console transport for logging to the console
      new winston.transports.Console({
        format: combine(label({ label: getLabel(module) }), timestamp(), customFormat),
      }),

      // Daily Rotate File transport for logging to files with rotation
      new (require('winston-daily-rotate-file'))({
        filename: `${logDir}/application-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        auditFile: `${logDir}/audit.json`,
        level: config.logs.level,
        maxSize: '20m',
        maxFiles: '14d',
      }),
    ],
  });
};

export default getLogger;
