import { Router } from 'express';
import { clearNotifications, listNotifications, markNotificationsRead } from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const notificationRouter = Router();

notificationRouter.use(requireAuth);
notificationRouter.get('/', listNotifications);
notificationRouter.post('/read', markNotificationsRead);
notificationRouter.delete('/', clearNotifications);
