import { Router } from 'express';
import { getOpsSummary } from '../controllers/ops.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const opsRouter = Router();

opsRouter.get('/summary', requireAuth, getOpsSummary);
