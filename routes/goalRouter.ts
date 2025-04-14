import express from 'express';
import { getFinancialGoals } from '../controllers/GoalController.ts';

const goalRouter = express.Router();

goalRouter.get('/user/:userId', getFinancialGoals);

export default goalRouter;
