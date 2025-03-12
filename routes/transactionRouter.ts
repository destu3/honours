import express from 'express';
import { generateTransactions, getTransactions } from '../controllers/TransactionController.ts';
import { updateAccountBalance } from '../controllers/AccountController.ts';

const transactionRouter = express.Router();
transactionRouter.post('/', generateTransactions, updateAccountBalance);
transactionRouter.get('/account/:accountId', getTransactions);

export default transactionRouter;
