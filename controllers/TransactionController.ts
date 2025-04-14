import { Request, Response } from 'npm:@types/express';
import supabase from '../db/client.ts';
import { logger } from '../logger.config.ts';
import { handleError } from '../utils/handleError.ts';

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
