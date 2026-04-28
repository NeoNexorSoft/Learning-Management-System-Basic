import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { authService } from '../services/auth.service';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: Role;
  };
}

const parseUserAgent = (req: Request) => {
  const ua = req.headers['user-agent'] ?? '';
  const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edge|Opera|MSIE)[\/\s](\d+)/);
  const osMatch = ua.match(/(Windows NT|Mac OS X|Linux|Android|iOS)[\/\s]?([\d._]+)?/);
  return {
    ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.socket.remoteAddress ?? undefined,
    browser: browserMatch ? `${browserMatch[1]} ${browserMatch[2]}` : undefined,
    os: osMatch ? osMatch[1] : undefined,
  };
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role) {
        res.status(400).json({ status: 'error', message: 'name, email, password and role are required' });
        return;
      }
      if (![Role.STUDENT, Role.TEACHER].includes(role)) {
        res.status(400).json({ status: 'error', message: 'role must be STUDENT or TEACHER' });
        return;
      }
      if (password.length < 6) {
        res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters' });
        return;
      }

      const result = await authService.register({ name, email, password, role });
      res.status(201).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ status: 'error', message: 'email and password are required' });
        return;
      }

      const result = await authService.login({ email, password, ...parseUserAgent(req) });
      res.json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ status: 'error', message: 'refreshToken is required' });
        return;
      }
      const result = await authService.refreshToken(refreshToken);
      res.json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getMe(req.user!.userId);
      res.json({ status: 'success', data: { user } });
    } catch (err) {
      next(err);
    }
  },

  logout(_req: Request, res: Response): void {
    res.json({ status: 'success', message: 'Logged out successfully' });
  },

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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

      await authService.changePassword(req.user!.userId, currentPassword, newPassword);
      res.json({ status: 'success', message: 'Password changed successfully' });
    } catch (err) {
      next(err);
    }
  },
  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ status: 'error', message: 'Token is required' });
        return;
      }

      const result = await authService.verifyEmail(token);
      res.json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  }
};
