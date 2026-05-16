import { Router } from 'express';
import { createMatchDepositCheckout, syncMatchDepositPayment } from '../controllers/payment.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { rateLimit } from '../middleware/rateLimit.js';

export const paymentRouter = Router();
const paymentLimiter = rateLimit({ windowMs: 60_000, max: 20, keyPrefix: 'payments' });

paymentRouter.use(requireAuth);
paymentRouter.post('/match-deposits/checkout', paymentLimiter, asyncHandler(createMatchDepositCheckout));
paymentRouter.post('/match-deposits/:id/sync', paymentLimiter, asyncHandler(syncMatchDepositPayment));
