import { Request, Response, NextFunction } from 'express';
import supabase from '../db/client.ts';
import { logger } from '../logger.config.ts';
import { generateFakeTransactions } from '../utils/generateTransactions.ts';
import { handleError } from '../utils/handleError.ts';

// Middleware: Generate transactions and pass data to the next handler
export const generateTransactions = async (req: Request, res: Response, next: NextFunction) => {
  const { accountId } = req.body;
  logger.info('Generating transactions', { accountId });

  try {
    const newTransactions = generateFakeTransactions(accountId);
    const { error } = await supabase.from('transactions').insert(newTransactions);

    if (error) {
      return handleError(res, 'Failed to generate transactions.', error);
    }

    logger.info('Transactions generated successfully', { count: newTransactions.length });

    // Compute total amount
    const totalAmount = newTransactions.reduce((acc, curr) => acc + Number(curr.amount) || 0, 0);

    // Pass generated data to the next middleware
    req.body = { ...req.body, newTransactions, totalAmount };
    next();
  } catch (error: any) {
    return handleError(res, 'Unexpected error generating transactions.', error);
  }
};

// Fetch all transactions for an account
export const getTransactions = async (req: Request, res: Response) => {
  const { accountId } = req.params;
  logger.info('Fetching transactions', { accountId });

  try {
    const { data, error } = await supabase.from('transactions').select('*').eq('account_id', accountId);

    if (error) {
      return handleError(res, 'Failed to fetch transactions.', error);
    }

    logger.info('Transactions fetched successfully', { count: data.length });
    return res.status(200).json(data);
  } catch (error: any) {
    return handleError(res, 'Unexpected error fetching transactions.', error);
  }
};
