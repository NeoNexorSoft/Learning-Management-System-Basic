import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
  role: string;
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
