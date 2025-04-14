import { Request, Response, NextFunction } from 'npm:@types/express';
import supabase from '../db/client.ts';
import { logger } from '../logger.config.ts';
import { handleError } from '../utils/handleError.ts';

export const createUserFinancialProfile = async (req: Request, res: Response, next: NextFunction) => {
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

    // Calculate budget allocations based on the 50-30-20 rule
    const needsBudget = (financialProfile.starting_income * 50) / 100;
    const wantsBudget = (financialProfile.starting_income * 30) / 100;
    const savingsBudget = (financialProfile.starting_income * 20) / 100;

    // Create a new user financial profile with calculated budgets
    const { data: userProfile, error: userProfileError } = await supabase
      .from('user_financial_profiles')
      .insert({
        user_id: userId,
        base_profile_id: financialProfile.id,
        current_income: financialProfile.starting_income,
        current_debt: financialProfile.starting_debt,
        needs_budget: needsBudget,
        wants_budget: wantsBudget,
        savings_budget: savingsBudget,
      })
      .select()
      .single();

    if (userProfileError || !userProfile) {
      return handleError(res, 'Failed to create user financial profile.', userProfileError);
    }

    logger.info('User financial profile created with budget allocation', { userFinancialProfileId: userProfile.id });

    // Store user profile in response locals for middleware
    res.locals.userFinancialProfile = userProfile;

    // Pass control to the next middleware to create goals
    next();
  } catch (error: any) {
    return handleError(res, 'Unexpected error creating user financial profile.', error);
  }
};
