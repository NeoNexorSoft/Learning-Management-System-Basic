import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { notificationController } from '../controllers/notification.controller';

export const notificationRouter = Router();

notificationRouter.use(authenticate);

// Static routes before /:id
notificationRouter.get('/my',           notificationController.getMyNotifications);
notificationRouter.patch('/read-all',   notificationController.markAllRead);
notificationRouter.patch('/:id/read',   notificationController.markOneRead);
