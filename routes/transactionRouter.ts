import express from 'express';
import { getTransactions } from '../controllers/TransactionController.ts';
import { generateTransactions } from '../middleware/transactionMiddleware.ts';
import { updateAccountBalance } from '../controllers/AccountController.ts';
import { updateGoalProgress } from '../middleware/goalMiddleware.ts';

const transactionRouter = express.Router();
transactionRouter.post('/', generateTransactions, updateGoalProgress, updateAccountBalance);
transactionRouter.get('/account/:accountId', getTransactions);

export default transactionRouter;
