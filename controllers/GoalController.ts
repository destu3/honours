import { Request, Response } from 'npm:@types/express';
import supabase from '../db/client.ts';
import { logger } from '../logger.config.ts';
import { handleError } from '../utils/handleError.ts';
import { log } from 'node:util';

export const createFinancialGoals = async (_req: Request, res: Response) => {
  const userProfile = res.locals.userFinancialProfile;

  if (!userProfile) {
    return handleError(res, 'User financial profile not found in request.', {}, 500);
  }

  try {
    const goals = [
      { goal_name: 'Essential Needs Budget', goal_type: 'spending_limit', target_amount: userProfile.needs_budget },
      { goal_name: 'Wants Budget', goal_type: 'spending_limit', target_amount: userProfile.wants_budget },
      { goal_name: 'Savings Budget', goal_type: 'savings_target', target_amount: userProfile.savings_budget },
    ];

    // Insert goals into the financial_goals table
    const { error: goalsError } = await supabase.from('financial_goals').insert(
      goals.map(goal => ({
        user_financial_profile_id: userProfile.id,
        name: goal.goal_name,
        type: goal.goal_type,
        target_amount: goal.target_amount,
        current_progress: 0,
      }))
    );

    if (goalsError) {
      return handleError(res, 'Failed to create financial goals.', goalsError);
    }

    logger.info('Financial goals created successfully', { userFinancialProfileId: userProfile.id });

    return res.status(201).json({
      message: 'User financial profile and goals created successfully.',
      userFinancialProfile: userProfile,
    });
  } catch (error: any) {
    return handleError(res, 'Unexpected error creating financial goals.', error);
  }
};

export const getFinancialGoals = async (req: Request, res: Response) => {
  const { userId } = req.params;
  logger.info('Fetching financial goals', { userId });

  try {
    const { data: profileData, error: profileError } = await supabase
      .from('user_financial_profiles')
      .select('id, needs_budget, wants_budget, savings_budget')
      .eq('user_id', userId)
      .single();

    if (profileError || !profileData) {
      return handleError(res, 'User financial profile not found.', profileError, 404);
    }

    const { data: goals, error: goalsError } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_financial_profile_id', profileData.id);

    if (goalsError || !goals) {
      return handleError(res, 'Failed to fetch financial goals.', goalsError, 404);
    }

    logger.info('Financial goals fetched successfully', { userId, goals });
    return res.status(200).json({ goals, financialProfile: profileData });
  } catch (error: any) {
    return handleError(res, 'Unexpected error fetching financial goals.', error);
  }
};
