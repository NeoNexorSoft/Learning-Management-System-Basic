import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { authService } from '../services/auth.service';
import { blacklistRefreshToken, isTokenBlacklisted, verifyRefreshToken } from '../utils/jwt';

// ─────────────────────────────────────────────
// Extended Request Type
// ─────────────────────────────────────────────
// Express's default Request type has no `user` field.
// After the auth middleware verifies a JWT, it attaches
// the decoded user data here so downstream controllers can read it.
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: Role;
  };
}


const parseUserAgent = (req: Request) => {
  const ua = req.headers['user-agent'] ?? '';

  // Match the first recognizable browser name and major version
  const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edge|Opera|MSIE)[\/\s](\d+)/);

  // Match the operating system name and optional version
  const osMatch = ua.match(/(Windows NT|Mac OS X|Linux|Android|iOS)[\/\s]?([\d._]+)?/);

  return {
    // x-forwarded-for may contain a comma-separated list if behind a proxy — take only the first IP
    ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.socket.remoteAddress ?? undefined,
    browser: browserMatch ? `${browserMatch[1]} ${browserMatch[2]}` : undefined,
    os: osMatch ? osMatch[1] : undefined,
  };
};

// ─────────────────────────────────────────────
// Auth Controller
// ─────────────────────────────────────────────
// All methods follow the same pattern:
//   1. Extract data from req.body
//   2. Validate — return 400 immediately if anything is missing or wrong
//   3. Delegate to the service layer
//   4. Return a consistent JSON shape: { status, data | message }
//   5. Pass unexpected errors to Express's error handler via next(err)
export const authController = {

  // ── Register ───────────────────────────────
  // Accepts signup details, validates them, then triggers
  // the registration flow (typically sends a verification email).
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, role } = req.body;

      // All four fields are required — reject early with a clear message
      if (!name || !email || !password || !role) {
        res.status(400).json({ status: 'error', message: 'name, email, password and role are required' });
        return;
      }

      // Only allow STUDENT and TEACHER roles — block anything unexpected
      if (![Role.STUDENT, Role.TEACHER].includes(role)) {
        res.status(400).json({ status: 'error', message: 'role must be STUDENT or TEACHER' });
        return;
      }

      // Enforce a minimum password length before hitting the service or DB
      if (password.length < 6) {
        res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters' });
        return;
      }

      const result = await authService.register({ name, email, password, role });
      res.status(201).json({ status: 'success', data: result });
    } catch (err) {
      next(err); // Passes unhandled errors (e.g. DB failures) to the global error handler
    }
  },

  // ── Login ──────────────────────────────────
  // Validates credentials and returns access + refresh tokens on success.
  // Device info (IP, browser, OS) is extracted and passed along for logging.
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ status: 'error', message: 'email and password are required' });
        return;
      }

      // Spread device metadata alongside credentials into the service call
      const result = await authService.login({ email, password, ...parseUserAgent(req) });
      res.json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  // ── Refresh Token ──────────────────────────
  // Issues a new access token using a valid refresh token.
  // Checks the Redis blacklist first — if the token was revoked
  // (e.g. user already logged out), reject it immediately.
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ status: 'error', message: 'refreshToken is required' });
        return;
      }

      // Blacklisted tokens were explicitly revoked — treat them as unauthorized
      if (await isTokenBlacklisted(refreshToken)) {
        res.status(401).json({ status: 'error', message: 'Token has been revoked' });
        return;
      }

      const result = await authService.refreshToken(refreshToken);
      res.json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  // ── Get Current User ───────────────────────
  // Returns the profile of the currently authenticated user.
  // req.user is guaranteed to exist here because this route
  // sits behind the auth middleware which validates the JWT first.
  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getMe(req.user!.userId);
      res.json({ status: 'success', data: { user } });
    } catch (err) {
      next(err);
    }
  },

  // ── Logout ─────────────────────────────────
  // Invalidates the refresh token by adding it to the Redis blacklist.
  // No try/catch needed — blacklistRefreshToken handles its own errors
  // internally and is designed to be non-fatal (see jwt.ts).
  async logout(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Even if this fails silently, the token will expire naturally
      await blacklistRefreshToken(refreshToken);
    }

    res.json({ status: 'success', message: 'Logged out successfully' });
  },

  // ── Change Password ────────────────────────
  // Allows an authenticated user to update their password.
  // The service layer is responsible for verifying that
  // currentPassword matches before applying the change.
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

  // ── Verify Email ───────────────────────────
  // Completes the email verification step of the signup flow.
  // The token was sent via email during registration — it contains
  // the user's signup data and expires in 15 minutes (see jwt.ts).
  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ status: 'error', message: 'Token is required' });
        return;
      }

      // Service decodes the token, creates the user, and returns their profile
      const result = await authService.verifyEmail(token);
      res.json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },
};