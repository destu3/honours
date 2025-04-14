import express from 'express';
import { getBaseFinancialProfiles } from '../controllers/ProfileController.ts';
import { createUserFinancialProfile } from '../middleware/profileMiddleware.ts';
import { createFinancialGoals } from '../controllers/GoalController.ts';

const profileRouter = express.Router();

profileRouter.route('/').get(getBaseFinancialProfiles).post(createUserFinancialProfile, createFinancialGoals);

export default profileRouter;
