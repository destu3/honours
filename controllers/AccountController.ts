import { Request, Response } from 'express';
import supabase from '../db/client.ts';
import { logger } from '../logger.config.ts';
import { handleError } from '../utils/handleError.ts';

// Create checking and savings accounts for a user
export const createAccounts = async (req: Request, res: Response) => {
  const { userProfileId, userProfileCurrentIncome } = req.body;

  if (!userProfileId || !userProfileCurrentIncome) {
    return handleError(res, 'Missing required fields.', { userProfileId, userProfileCurrentIncome }, 400);
  }

  logger.info('Creating initial accounts', { userProfileId });

  try {
    const initialAccounts = [
      { account_type: 'checking', user_financial_profile_id: userProfileId, balance: userProfileCurrentIncome },
      { account_type: 'savings', user_financial_profile_id: userProfileId, balance: 0 },
    ];

    const { data: accounts, error } = await supabase.from('accounts').insert(initialAccounts).select();

    if (error || !accounts) {
      return handleError(res, 'Failed to create accounts.', error);
    }

    logger.info('Accounts created successfully', { accounts });
    return res.status(201).json({ message: 'Accounts created successfully.', accounts });
  } catch (error: any) {
    return handleError(res, 'Unexpected error creating accounts.', error);
  }
};

// Fetch the checking account ID from a user ID
export const getAccountIdFromUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;
  logger.info('Fetching checking account ID', { userId });

  try {
    const { data: profileData, error: profileError } = await supabase
      .from('user_financial_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (profileError || !profileData) {
      return handleError(res, 'User financial profile not found.', profileError, 404);
    }

    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('user_financial_profile_id', profileData.id)
      .eq('account_type', 'checking')
      .single();

    if (accountError || !accountData) {
      return handleError(res, 'Checking account not found.', accountError, 404);
    }

    logger.info('Checking account ID fetched successfully', { accountId: accountData.id });
    return res.status(200).json({ accountId: accountData.id });
  } catch (error: any) {
    return handleError(res, 'Unexpected error fetching checking account ID.', error);
  }
};

// Update account balance after transactions
export const updateAccountBalance = async (req: Request, res: Response) => {
  const { accountId, totalAmount, newTransactions } = req.body;
  logger.info('Updating account balance', { accountId });

  try {
    const { data: accountData, error: fetchError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', accountId)
      .single();

    if (fetchError || !accountData) {
      return handleError(res, 'Failed to fetch account balance.', fetchError);
    }

    const updatedBalance = accountData.balance - totalAmount;

    const { error: updateError } = await supabase.from('accounts').update({ balance: updatedBalance }).eq('id', accountId);

    if (updateError) {
      return handleError(res, 'Failed to update account balance.', updateError);
    }

    logger.info('Account balance updated', { accountId, deductedAmount: totalAmount, updatedBalance });
    return res
      .status(200)
      .json({ message: 'Transactions processed successfully.', newTransactions, deductedAmount: totalAmount });
  } catch (error: any) {
    return handleError(res, 'Unexpected error updating account balance.', error);
  }
};

export const getCurrentAccountBalance = async (req: Request, res: Response) => {
  const { accountId } = req.params;
  logger.info('Fetching current account balance', { accountId });

  try {
    const { data: accountData, error } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', accountId)
      .eq('account_type', 'checking')
      .single();

    if (error || !accountData) {
      return handleError(res, 'Failed to fetch account balance.', error);
    }

    logger.info('Account balance fetched successfully', { accountId, balance: accountData.balance });
    return res.status(200).json({ balance: accountData.balance });
  } catch (error: any) {
    return handleError(res, 'Unexpected error fetching account balance.', error);
  }
};
