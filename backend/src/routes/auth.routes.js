import { Router } from 'express';
import { login, me, register } from '../controllers/auth.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';

export const authRouter = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60_000, max: 20, keyPrefix: 'auth' });

authRouter.post('/register', authLimiter, asyncHandler(register));
authRouter.post('/login', authLimiter, asyncHandler(login));
authRouter.get('/me', requireAuth, me);
