import express from 'express';
import cors from 'cors';
import { HTTPLogger } from './logger.config.ts';

export const app = express();
app.use(express.json(), cors(), HTTPLogger);
