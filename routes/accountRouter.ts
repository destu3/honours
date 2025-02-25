import express from 'express';
import { createAccounts } from '../controllers/AccountController.ts';

const accountRouter = express.Router();

accountRouter.post('/', createAccounts);

export default accountRouter;
