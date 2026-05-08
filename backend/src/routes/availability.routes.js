import { Router } from 'express';
import { nearbyPlayers, setAvailability } from '../controllers/availability.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const availabilityRouter = Router();

availabilityRouter.get('/nearby', requireAuth, nearbyPlayers);
availabilityRouter.patch('/', requireAuth, setAvailability);
