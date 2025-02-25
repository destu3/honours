import express from 'express';
import { createUserFinancialProfile, getBaseFinancialProfiles } from '../controllers/ProfileController.ts';

const profileRouter = express.Router();

profileRouter.route('/').get(getBaseFinancialProfiles).post(createUserFinancialProfile);

export default profileRouter;
