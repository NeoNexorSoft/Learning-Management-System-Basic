import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { userService } from '../services/user.service';

export const userController = {
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = req.query.role as string | undefined;
      const is_banned = req.query.is_banned as string | undefined;
      const email_verified = req.query.email_verified as string | undefined;
      const search = req.query.search as string | undefined;
      const page = req.query.page as string | undefined;
      const limit = req.query.limit as string | undefined;

      if (role && !Object.values(Role).includes(role as Role)) {
        res.status(400).json({ status: 'error', message: 'Invalid role value' });
        return;
      }

      const result = await userService.getUsers({
        role: role as Role | undefined,
        is_banned: is_banned !== undefined ? is_banned === 'true' : undefined,
        email_verified: email_verified !== undefined ? email_verified === 'true' : undefined,
        search,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? Math.min(parseInt(limit, 10), 100) : 20,
      });

      res.json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async getUserStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await userService.getUserStats();
      res.json({ status: 'success', data: stats });
    } catch (err) {
      next(err);
    }
  },

  async toggleBan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.toggleBan(req.params.id as string);
      res.json({ status: 'success', data: { user } });
    } catch (err) {
      next(err);
    }
  },

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await userService.deleteUser(req.params.id as string);
      res.json({ status: 'success', message: 'User deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  async getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserProfile(req.params.id as string);
      res.json({ status: 'success', data: { user } });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, mobile, bio, country, social_links } = req.body;
      const user = await userService.updateProfile(req.user!.userId, {
        name,
        mobile,
        bio,
        country,
        social_links,
      });
      res.json({ status: 'success', data: { user } });
    } catch (err) {
      next(err);
    }
  },

  async updatePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({ status: 'error', message: 'currentPassword and newPassword are required' });
        return;
      }
      if (newPassword.length < 6) {
        res.status(400).json({ status: 'error', message: 'New password must be at least 6 characters' });
        return;
      }

      await userService.updatePassword(req.user!.userId, currentPassword, newPassword);
      res.json({ status: 'success', message: 'Password updated successfully' });
    } catch (err) {
      next(err);
    }
  },

  async getLoginHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const history = await userService.getLoginHistory(req.user!.userId);
      res.json({ status: 'success', data: { history } });
    } catch (err) {
      next(err);
    }
  },

  async getTeacherStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await userService.getTeacherStats(req.user!.userId);
      res.json({ status: 'success', data: stats });
    } catch (err) {
      next(err);
    }
  },

  async getStudentStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await userService.getStudentStats(req.user!.userId);
      res.json({ status: 'success', data: stats });
    } catch (err) {
      next(err);
    }
  },
};
