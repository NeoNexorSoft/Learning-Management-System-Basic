import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';

export const notificationController = {
  async getMyNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page  = req.query.page  as string | undefined;
      const limit = req.query.limit as string | undefined;

      const result = await notificationService.getMyNotifications(req.user!.userId, {
        page:  page  ? parseInt(page, 10) : 1,
        limit: limit ? Math.min(parseInt(limit, 10), 50) : 20,
      });
      res.json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationService.markAllRead(req.user!.userId);
      res.json({ status: 'success', message: 'All notifications marked as read' });
    } catch (err) {
      next(err);
    }
  },

  async markOneRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationService.markOneRead(req.params.id as string, req.user!.userId);
      res.json({ status: 'success', message: 'Notification marked as read' });
    } catch (err) {
      next(err);
    }
  },
};
