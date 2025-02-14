import winston from 'winston';
import expressWinston from 'express-winston';

const { combine, timestamp, printf, colorize } = winston.format;

// Define the log format
const logFormat = printf(({ timestamp, level, message, ...metadata }: winston.Logform.TransformableInfo) => {
  let logMessage = `[${timestamp}] ${level}: ${message}`;
  if (Object.keys(metadata).length) {
    logMessage += ` ${JSON.stringify(metadata)}`;
  }
  return logMessage;
});

export const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), colorize(), logFormat),
  transports: [
    new winston.transports.Console(),
    // Add other transports here (e.g., File, HTTP) as needed
  ],
});

// HTTP request logging setup with timestamp and basic information
export const HTTPLogger = expressWinston.logger({
  transports: [new winston.transports.Console()],
  format: combine(
    colorize(),
    timestamp(),
    printf(({ timestamp, level, message }: winston.Logform.TransformableInfo) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  msg: (req, res) => {
    // Custom log message without metadata and body
    return `HTTP ${req.method} ${req.url} - Status: ${res.statusCode}`;
  },
  expressFormat: true,
  colorize: true,
  meta: false, // Disable metadata logging
});
