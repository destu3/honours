import { Request, Response, NextFunction } from 'npm:@types/express';
import supabase from '../db/client.ts';
import { logger } from '../logger.config.ts';
import { handleError } from '../utils/handleError.ts';
import { Transaction } from '../utils/generateTransactions.ts';

interface GoalMapping {
  category: string;
  goalName: string;
}

interface Notification {
  type: 'goal_completed' | 'goal_nearly_completed';
  message: string;
  goalName?: string;
  firstTimeCompletion?: boolean;
}

interface ResponseLocals {
  newTransactions: Transaction[];
  categoryTotals: Map<string, number>;
  accountId: string;
  notifications?: Notification[];
}

/**
 * Check if a notification should be created based on goal progress
 */
function checkAndCreateNotification(goalName: string, newProgress: number, targetAmount: number): Notification | null {
  const progressPercentage = (newProgress / targetAmount) * 100;

  // Check if the goal is reached (100%)
  if (progressPercentage >= 100) {
    return {
      type: 'goal_completed',
      message: `Congratulations! You've reached your ${goalName} goal! Focus your spending on other categories now.`,
      goalName,
    };
  }

  // Check if the goal is nearly reached (80%)
  if (progressPercentage >= 80 && progressPercentage < 100) {
    return {
      type: 'goal_nearly_completed',
      message: `You're almost there! You've reached ${Math.round(progressPercentage)}% of your ${goalName} goal.`,
      goalName,
    };
  }

  return null;
}

/**
 * Increment the user's account level
 */
async function incrementAccountLevel(accountId: string): Promise<void> {
  try {
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('user_financial_profile_id')
      .eq('id', accountId)
      .single();

    if (accountError || !accountData) {
      logger.error('Failed to fetch account data', accountError);
      return;
    }

    const { user_financial_profile_id } = accountData;

    // Then, get the current account level
    const { data: profileData, error: profileError } = await supabase
      .from('user_financial_profiles')
      .select('account_level')
      .eq('id', user_financial_profile_id)
      .single();

    if (profileError || !profileData) {
      logger.error('Failed to fetch user financial profile', profileError);
      return;
    }

    const newLevel = (profileData.account_level || 0) + 1;

    // Update the account level
    const { error: updateError } = await supabase
      .from('user_financial_profiles')
      .update({ account_level: newLevel })
      .eq('id', user_financial_profile_id);

    if (updateError) {
      logger.error('Failed to update account level', updateError);
      return;
    }

    logger.info(`Successfully incremented account level to ${newLevel} for account ${accountId}`);
  } catch (error) {
    logger.error('Error incrementing account level', error);
  }
}

/**
 * Update a specific financial goal
 */
async function updateGoal(goalName: string, totalSpent: number, accountId: string, notifications: Notification[]): Promise<void> {
  // Step 1: Retrieve the current progress and completion status
  const { data: goalData, error: fetchError } = await supabase
    .from('financial_goals')
    .select('current_progress, target_amount, is_completed')
    .eq('name', goalName)
    .single();

  if (fetchError || !goalData) {
    logger.error(`Failed to fetch current progress for goal: ${goalName}`, fetchError);
    return;
  }

  // Step 2: Calculate the new progress
  const newProgress = goalData.current_progress + totalSpent;

  // Step 3: Check if we need to create notifications
  const notification = checkAndCreateNotification(goalName, newProgress, goalData.target_amount);

  // Create an update object with the new progress
  const updateData: { current_progress: number; is_completed?: boolean } = {
    current_progress: newProgress,
  };

  if (notification) {
    // If goal is completed (100%) and wasn't previously completed, increment account level
    if (notification.type === 'goal_completed' && !goalData.is_completed) {
      await incrementAccountLevel(accountId);
      notification.firstTimeCompletion = true;
      // Mark the goal as completed
      updateData.is_completed = true;
    }

    notifications.push(notification);
  }

  // Step 4: Update the goal with the new progress and completion status
  const { error: updateError } = await supabase.from('financial_goals').update(updateData).eq('name', goalName);

  if (updateError) {
    logger.error(`Failed to update progress for goal: ${goalName}`, updateError);
  }
}

export const updateGoalProgress = async (_req: Request, res: Response, next: NextFunction) => {
  const { newTransactions, categoryTotals, accountId } = res.locals as ResponseLocals;

  if (!newTransactions || newTransactions.length === 0) {
    return next();
  }

  logger.info('Updating financial goals progress');

  const goalMappings: GoalMapping[] = [
    { category: 'needs', goalName: 'Essential Needs Budget' },
    { category: 'wants', goalName: 'Wants Budget' },
    { category: 'savings', goalName: 'Savings Budget' },
  ];

  try {
    // Create notifications array to store any notifications generated
    const notifications: Notification[] = [];

    // Process each goal mapping
    for (const { category, goalName } of goalMappings) {
      const totalSpent = categoryTotals.get(category) || 0;
      await updateGoal(goalName, totalSpent, accountId, notifications);
    }

    // Add notifications to res.locals for the next middleware
    if (notifications.length > 0) {
      res.locals.notifications = notifications;
    }

    logger.info('Financial goals updated successfully');
    return next();
  } catch (error: any) {
    return handleError(res, 'Failed to update financial goals.', error);
  }
};
