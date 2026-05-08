import { Router } from 'express';
import { listTerrains } from '../controllers/terrain.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const terrainRouter = Router();

terrainRouter.get('/', requireAuth, listTerrains);
