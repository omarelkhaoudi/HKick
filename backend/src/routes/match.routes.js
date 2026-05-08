import { Router } from 'express';
import { createMatch, getMatch, getMatchmaking, instantMatch, joinMatch, leaveMatch, listMatches, sendMessage } from '../controllers/match.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const matchRouter = Router();

matchRouter.use(requireAuth);
matchRouter.get('/', listMatches);
matchRouter.post('/', createMatch);
matchRouter.get('/matchmaking', getMatchmaking);
matchRouter.post('/matchmaking/instant', instantMatch);
matchRouter.get('/:id', getMatch);
matchRouter.post('/:id/join', joinMatch);
matchRouter.post('/:id/leave', leaveMatch);
matchRouter.post('/:id/messages', sendMessage);
