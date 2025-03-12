import express from 'express';
import { createAccounts, getAccountIdFromUserId, getCurrentAccountBalance } from '../controllers/AccountController.ts';

const accountRouter = express.Router();

accountRouter.post('/', createAccounts);
accountRouter.get('/user/:userId', getAccountIdFromUserId);
accountRouter.get('/:accountId/balance', getCurrentAccountBalance);

export default accountRouter;
