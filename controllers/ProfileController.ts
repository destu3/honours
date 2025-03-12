import { Request, Response } from 'express';
import supabase from '../db/client.ts';
import { logger } from '../logger.config.ts';
import { handleError } from '../utils/handleError.ts';

// Create a user financial profile from a selected base profile
export const createUserFinancialProfile = async (req: Request, res: Response) => {
  const { selectedProfileId, userId } = req.body;

  if (!selectedProfileId || !userId) {
    return handleError(res, 'Missing required fields.', { selectedProfileId, userId }, 400);
  }

  logger.info('Assigning financial profile', { userId, selectedProfileId });

  try {
    // Fetch the selected financial profile template
    const { data: financialProfile, error: profileError } = await supabase
      .from('financial_profiles')
      .select('id, starting_income, starting_debt')
      .eq('id', selectedProfileId)
      .single();

    if (profileError || !financialProfile) {
      return handleError(res, 'Invalid financial profile selected.', profileError, 400);
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
      return handleError(res, 'Failed to create user financial profile.', userProfileError);
    }

    logger.info('User financial profile created', { userFinancialProfileId: userProfile.id });

    return res.status(201).json({
      message: 'User financial profile created successfully.',
      userFinancialProfile: userProfile,
    });
  } catch (error: any) {
    return handleError(res, 'Unexpected error creating user financial profile.', error);
  }
};

// Fetch all base financial profiles
export const getBaseFinancialProfiles = async (_req: Request, res: Response) => {
  logger.info('Fetching base financial profiles');

  try {
    const { data: financialProfiles, error: profileError } = await supabase.from('financial_profiles').select('*');

    if (profileError || !financialProfiles) {
      return handleError(res, 'Failed to fetch financial profiles.', profileError);
    }

    logger.info('Base financial profiles fetched successfully');
    return res.status(200).json(financialProfiles);
  } catch (error: any) {
    return handleError(res, 'Unexpected error fetching financial profiles.', error);
  }
};
