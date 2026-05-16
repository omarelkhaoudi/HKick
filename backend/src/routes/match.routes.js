import { Router } from 'express';
import {
  createMatch,
  createReview,
  getMatch,
  getMatchmaking,
  instantMatch,
  joinMatch,
  leaveMatch,
  listMatches,
  reserveDeposit,
  sendMessage,
  upsertConfirmation,
  upsertResult
} from '../controllers/match.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';

export const matchRouter = Router();
const createMatchLimiter = rateLimit({ windowMs: 60_000, max: 10, keyPrefix: 'match:create' });
const chatLimiter = rateLimit({ windowMs: 60_000, max: 30, keyPrefix: 'match:chat' });
const operationsLimiter = rateLimit({ windowMs: 60_000, max: 60, keyPrefix: 'match:ops' });

matchRouter.use(requireAuth);
matchRouter.get('/', asyncHandler(listMatches));
matchRouter.post('/', createMatchLimiter, asyncHandler(createMatch));
matchRouter.get('/matchmaking', asyncHandler(getMatchmaking));
matchRouter.post('/matchmaking/instant', asyncHandler(instantMatch));
matchRouter.get('/:id', asyncHandler(getMatch));
matchRouter.post('/:id/join', asyncHandler(joinMatch));
matchRouter.post('/:id/leave', asyncHandler(leaveMatch));
matchRouter.post('/:id/messages', chatLimiter, asyncHandler(sendMessage));
matchRouter.post('/:id/confirmations', operationsLimiter, asyncHandler(upsertConfirmation));
matchRouter.post('/:id/deposits', operationsLimiter, asyncHandler(reserveDeposit));
matchRouter.put('/:id/result', operationsLimiter, asyncHandler(upsertResult));
matchRouter.post('/:id/reviews', operationsLimiter, asyncHandler(createReview));
