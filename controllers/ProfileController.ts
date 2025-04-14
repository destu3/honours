import { Request, Response } from 'npm:@types/express';
import supabase from '../db/client.ts';
import { logger } from '../logger.config.ts';
import { handleError } from '../utils/handleError.ts';

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
