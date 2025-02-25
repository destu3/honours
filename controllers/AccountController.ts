import { Request, Response } from 'express';
import supabase from '../db/client.ts';
import { logger } from '../logger.config.ts';

export const createAccounts = async (req: Request, res: Response) => {
  const { userProfileId, userProfileCurrentIncome } = req.body;

  if (!userProfileId || !userProfileCurrentIncome) {
    logger.error('Missing required fields', { userProfileId, userProfileCurrentIncome });
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  logger.info('Attempting to create initial accounts', { userProfileId });

  try {
    // Define accounts to be created
    const initialAccounts = [
      { account_type: 'checking', user_financial_profile_id: userProfileId, balance: userProfileCurrentIncome },
      { account_type: 'savings', user_financial_profile_id: userProfileId, balance: 0 },
    ];

    // Create checking and savings accounts associated with the user financial profile
    const { data: accounts, error: accountsError } = await supabase.from('accounts').insert(initialAccounts).select();

    if (accountsError || !accounts) {
      logger.error('Failed to create accounts', { error: accountsError?.message });
      return res.status(500).json({ error: 'Failed to create accounts.' });
    }

    logger.info('Accounts created successfully', { accounts });

    // Respond with the created accounts
    return res.status(201).json({
      message: 'Accounts created successfully.',
      accounts,
    });
  } catch (error: any) {
    logger.error('An unexpected error occurred', { error: error.message });
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};
