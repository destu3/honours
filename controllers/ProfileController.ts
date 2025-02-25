import { Request, Response } from 'express';
import supabase from '../db/client.ts';
import { logger } from '../logger.config.ts';

export const createUserFinancialProfile = async (req: Request, res: Response) => {
  const { selectedProfileId, userId } = req.body;

  if (!selectedProfileId || !userId) {
    logger.error('Missing required fields', { selectedProfileId, userId });
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  logger.info('Attempting to assign financial profile', { userId, selectedProfileId });

  try {
    // Fetch the selected financial profile template
    const { data: financialProfile, error: profileError } = await supabase
      .from('financial_profiles')
      .select('id, starting_income, starting_debt')
      .eq('id', selectedProfileId)
      .single();

    if (profileError || !financialProfile) {
      logger.error('Failed to fetch financial profile', { error: profileError?.message });
      return res.status(400).json({ error: 'Invalid financial profile selected.' });
    }

    // Create a new user financial profile
    const { data: userProfile, error: userProfileError } = await supabase
      .from('user_financial_profiles')
      .insert({
        user_id: userId,
        base_profile_id: financialProfile.id,
        current_income: financialProfile.starting_income,
        current_debt: financialProfile.starting_debt,
      })
      .select()
      .single();

    if (userProfileError || !userProfile) {
      logger.error('Failed to create user financial profile', { error: userProfileError?.message });
      return res.status(500).json({ error: 'Failed to create user financial profile.' });
    }

    logger.info('User financial profile created successfully', { userFinancialProfileId: userProfile.id });

    // Respond with the created user financial profile
    return res.status(201).json({
      message: 'User financial profile created successfully.',
      userFinancialProfile: userProfile,
    });
  } catch (error: any) {
    logger.error('An unexpected error occurred', { error: error.message });
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

export const getBaseFinancialProfiles = async (_req: Request, res: Response) => {
  logger.info('Attempting to fetch base financial profiles');

  try {
    // Fetch all base financial profiles
    const { data: financialProfiles, error: profileError } = await supabase.from('financial_profiles').select('*');

    if (profileError || !financialProfiles) {
      logger.error('Failed to fetch base financial profiles', { error: profileError?.message });
      return res.status(500).json({ error: 'Failed to fetch financial profiles.' });
    }

    logger.info('Base financial profiles fetched successfully');

    // Respond with the fetched base financial profiles
    return res.status(200).json({ financialProfiles });
  } catch (error: any) {
    logger.error('An unexpected error occurred', { error: error.message });
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};
