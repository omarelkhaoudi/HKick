import { Router } from 'express';
import { getWallet, payDeposit, topUpWallet } from '../controllers/wallet.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const walletRouter = Router();

walletRouter.use(requireAuth);
walletRouter.get('/', getWallet);
walletRouter.post('/top-up', topUpWallet);
walletRouter.post('/deposit', payDeposit);
