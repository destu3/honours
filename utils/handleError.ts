import { logger } from '../logger.config.ts';
import { Response } from 'express';

export const handleError = (res: Response, message: string, error: any, statusCode = 500) => {
  logger.error(message, { error: error?.message || error });
  return res.status(statusCode).json({ error: message });
};
