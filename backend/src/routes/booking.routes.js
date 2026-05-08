import { Router } from 'express';
import { createBooking } from '../controllers/booking.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const bookingRouter = Router();

bookingRouter.post('/', requireAuth, createBooking);
