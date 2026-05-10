import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import { redisConnection as redisClient } from '../config/redis';

export interface TokenPayload {
  userId: string;
  role: string;
}

export interface EmailVerificationPayload { 
  name: string; 
  email: string; 
  password: string; 
  role: string 
}

export const signAccessToken = (payload: TokenPayload): string =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES } as SignOptions);

export const signRefreshToken = (payload: TokenPayload): string =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES } as SignOptions);

export const verifyAccessToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload & TokenPayload;
  return { userId: decoded.userId, role: decoded.role };
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload & TokenPayload;
  return { userId: decoded.userId, role: decoded.role };
};

export const signEmailVerificationToken = (
  payload: EmailVerificationPayload
): string => jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES } as SignOptions);

export const verifyEmailVerificationToken = (token: string): EmailVerificationPayload => {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload & EmailVerificationPayload;
  return { name: decoded.name, email: decoded.email, password: decoded.password, role: decoded.role };
};

export const blacklistRefreshToken = async (token: string): Promise<void> => {
  try {
    const decoded = jwt.decode(token) as JwtPayload | null;
    const exp = decoded?.exp;
    const ttl = exp ? exp - Math.floor(Date.now() / 1000) : 60 * 60 * 24 * 7;
    if (ttl > 0) {
      await redisClient.set(`blacklist:${token}`, '1', 'EX', ttl);
    }
  } catch {
    // Non-fatal — if Redis is down, token will expire naturally
  }
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  try {
    const result = await redisClient.get(`blacklist:${token}`);
    return result !== null;
  } catch {
    return false;
  }
};