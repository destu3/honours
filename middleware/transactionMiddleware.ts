import { Request, Response, NextFunction } from 'npm:@types/express';
import supabase from '../db/client.ts';
import { logger } from '../logger.config.ts';
import { handleError } from '../utils/handleError.ts';
import { generateFakeTransactions } from '../utils/generateTransactions.ts';
import { Transaction } from '../utils/generateTransactions.ts';

export const generateTransactions = async (req: Request, res: Response, next: NextFunction) => {
  const { accountId } = req.body;
  logger.info('Generating transactions', { accountId });

  try {
    const newTransactions: Transaction[] = generateFakeTransactions(accountId);
    const { error } = await supabase.from('transactions').insert(newTransactions);

    if (error) {
      return handleError(res, 'Failed to generate transactions.', error);
    }

    logger.info('Transactions generated successfully', { count: newTransactions.length });

    const totalAmount = newTransactions.reduce((acc, curr) => acc + Number(curr.amount), 0);

    // Compute total amount per category using a Map
    const categoryTotals = new Map<string, number>();

    newTransactions.forEach(({ category, amount }) => {
      categoryTotals.set(category, (categoryTotals.get(category) || 0) + Number(amount));
    });

    // Store in res.locals for the next middleware
    res.locals.accountId = accountId;
    res.locals.categoryTotals = categoryTotals;
    res.locals.newTransactions = newTransactions;
    res.locals.totalAmount = totalAmount;

    next();
  } catch (error: any) {
    return handleError(res, 'Unexpected error generating transactions.', error);
  }
};
