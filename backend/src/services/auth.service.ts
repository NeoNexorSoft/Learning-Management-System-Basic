import { Role } from '@prisma/client';
import { prisma } from '../config/db';
import { hashPassword, comparePassword } from '../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { v4 as uuidv4 } from 'uuid';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'TEACHER';
}

interface LoginInput {
  email: string;
  password: string;
  ip?: string;
  browser?: string;
  os?: string;
}

const SAFE_USER_SELECT = {
  id: true,
  name: true,
  username: true,
  email: true,
  role: true,
  avatar: true,
  mobile: true,
  bio: true,
  country: true,
  balance: true,
  email_verified: true,
  is_banned: true,
  social_links: true,
  created_at: true,
  updated_at: true,
} as const;

const generateUsername = async (name: string): Promise<string> => {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || 'user';
  let username = base;
  let attempt = 0;
  while (await prisma.user.findUnique({ where: { username } })) {
    attempt++;
    username = `${base}${attempt}`;
  }
  return username;
};

const issueTokens = (userId: string, role: string) => ({
  accessToken: signAccessToken({ userId, role }),
  refreshToken: signRefreshToken({ userId, role }),
});

export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw Object.assign(new Error('Email already in use'), { statusCode: 409 });

    const username = await generateUsername(input.name);
    const password_hash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: { id: uuidv4(), name: input.name, username, email: input.email, password_hash, role: input.role },
      select: SAFE_USER_SELECT,
    });

    return { user, ...issueTokens(user.id, user.role) };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    if (user.is_banned) throw Object.assign(new Error('Your account has been banned'), { statusCode: 403 });

    const valid = await comparePassword(input.password, user.password_hash);
    if (!valid) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });

    // Fire-and-forget login history
    prisma.loginHistory.create({
      data: { id: uuidv4(), user_id: user.id, ip_address: input.ip, browser: input.browser, os: input.os },
    }).catch(() => {});

    const { password_hash: _, ...safeUser } = user;
    return { user: safeUser, ...issueTokens(user.id, user.role) };
  },

  async refreshToken(token: string) {
    let payload: { userId: string; role: string };
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    if (user.is_banned) throw Object.assign(new Error('Your account has been banned'), { statusCode: 403 });

    return { accessToken: signAccessToken({ userId: user.id, role: user.role }) };
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: SAFE_USER_SELECT });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    return user;
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    const valid = await comparePassword(currentPassword, user.password_hash);
    if (!valid) throw Object.assign(new Error('Current password is incorrect'), { statusCode: 400 });

    const password_hash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: userId }, data: { password_hash } });
  },
};
