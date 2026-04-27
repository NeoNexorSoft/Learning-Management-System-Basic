import { Role } from '@prisma/client';
import { prisma } from '../config/db';
import { hashPassword, comparePassword } from '../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken, signEmailVerificationToken, verifyEmailVerificationToken } from '../utils/jwt';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '../utils/sendEmail';
import { verifyEmailTemplate } from '../templates/verifyEmailTemplate';
import { emailQueue } from '../queues/emailQueue';
import QueueConfig from '../config/queue';

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

    // create vefirification token and send email here, user will be created after they click the link in email
    // create token with name, email, password_hash, role and other info, and set a short expiration time (e.g. 15 minutes)
    const tokenPayload = { name: input.name, email: input.email, password: password_hash, role: input.role };
    const token = signEmailVerificationToken(tokenPayload);

    // send email with link to frontend, frontend will call verify email api with the token, and then we will create the user in that api
    const verificationLink = `${process.env.CLIENT_URL}/auth/verify-email?token=${token}`;

    await emailQueue.add("send-email", {
      to: input.email,
      subject: "Verify your email",
      html: verifyEmailTemplate(verificationLink)
    }, QueueConfig);
    
    // send response to frontend that a verification link has been sent to their email, and they need to click the link to complete registration
    return { message: 'Verification email sent. Please check your inbox and click the link to complete registration.' };
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

  async verifyEmail(token: string) {
    const payload = verifyEmailVerificationToken(token);
    if (!payload) throw Object.assign(new Error('Invalid or expired token'), { statusCode: 400 });

    const existing = await prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) throw Object.assign(new Error('Email already in use'), { statusCode: 409 });

    // this user create part will be moved to verify email api
    const username = await generateUsername(payload.name);
    const user = await prisma.user.create({
      data: { id: uuidv4(), name: payload.name, username: username, email: payload.email, password_hash: payload.password, role: payload.role === 'teacher' ? Role.TEACHER : Role.STUDENT, email_verified: true },
      select: SAFE_USER_SELECT,
    });

    return { user, ...issueTokens(user.id, user.role) };
  },
};
