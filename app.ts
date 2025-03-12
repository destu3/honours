import express from 'express';
import cors from 'cors';
import { HTTPLogger } from './logger.config.ts';
import profileRouter from './routes/profileRouter.ts';
import accountRouter from './routes/accountRouter.ts';
import transactionRouter from './routes/transactionRouter.ts';

export const app = express();
app.use(express.json(), cors(), HTTPLogger);
app.use('/api/profiles', profileRouter);
app.use('/api/accounts', accountRouter);
app.use('/api/transactions', transactionRouter);
