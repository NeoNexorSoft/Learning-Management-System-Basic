// ===================================================
// JWT UTILITIES — Token Sign, Verify & Blacklist
// ===================================================
// This file handles everything related to JWTs:
//   - Signing access & refresh tokens for auth
//   - Verifying tokens on protected routes
//   - Email verification tokens for new signups
//   - Blacklisting tokens in Redis on logout
// ===================================================

import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import { redisConnection } from '../config/redis';

// ─────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────

// The core payload embedded inside access & refresh tokens.
// Keep this minimal — it travels with every single API request.
export interface TokenPayload {
  userId: string; // Unique ID of the authenticated user
  role: string;   // User's role (e.g. 'admin', 'user') — used for authorization
}

// Payload stored inside the email verification token.
// Holds signup data temporarily until the user confirms their email.
// This prevents saving unverified users to the database prematurely.
export interface EmailVerificationPayload {
  name: string;
  email: string;
  password: string; // Still hashed before DB insertion — never stored as plain text
  role: string;
}

// ─────────────────────────────────────────────
// Access Token
// ─────────────────────────────────────────────
// Short-lived token (default: 15m) attached to every API request.
// Should be stored in memory on the client — NOT in localStorage.

// Signs and returns a new access token for the given payload.
export const signAccessToken = (payload: TokenPayload): string =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES } as SignOptions);

// Verifies an access token and returns the decoded payload.
// Throws JsonWebTokenError if the token is invalid or expired.
export const verifyAccessToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload & TokenPayload;
  return { userId: decoded.userId, role: decoded.role };
};

// ─────────────────────────────────────────────
// Refresh Token
// ─────────────────────────────────────────────
// Long-lived token (default: 7d) used only to issue new access tokens.
// Should be stored in an httpOnly cookie — never accessible via JS.

// Signs and returns a new refresh token for the given payload.
export const signRefreshToken = (payload: TokenPayload): string =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES } as SignOptions);

// Verifies a refresh token and returns the decoded payload.
// Throws JsonWebTokenError if the token is invalid or expired.
export const verifyRefreshToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload & TokenPayload;
  return { userId: decoded.userId, role: decoded.role };
};

// ─────────────────────────────────────────────
// Email Verification Token
// ─────────────────────────────────────────────
// A one-time token (expires in 15m) sent via email link on signup.
// The user clicks the link → token is verified → user is saved to DB.
// Avoids storing unverified accounts until email ownership is confirmed.

// Signs and returns an email verification token containing signup data.
export const signEmailVerificationToken = (
  payload: EmailVerificationPayload
): string => jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' } as SignOptions);

// Verifies the email verification token and extracts the original signup data.
// Throws if the token is expired (15m window) or has been tampered with.
export const verifyEmailVerificationToken = (token: string): EmailVerificationPayload => {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload & EmailVerificationPayload;
  return { name: decoded.name, email: decoded.email, password: decoded.password, role: decoded.role };
};

// ─────────────────────────────────────────────
// Token Blacklisting (Redis)
// ─────────────────────────────────────────────
// JWTs are stateless — once issued, they stay valid until expiry.
// On logout, we store the token in Redis with a TTL equal to its
// remaining lifetime. Middleware checks this before every request.
// When the TTL expires, Redis auto-deletes the entry — no cleanup needed.

/**
 * Adds a refresh token to the Redis blacklist on logout.
 * TTL is set to the token's remaining lifetime so the entry
 * self-destructs exactly when the token would have expired anyway.
 */
export const blacklistRefreshToken = async (token: string): Promise<void> => {
  try {
    const decoded = jwt.decode(token) as JwtPayload | null;
    if (!decoded?.exp) return; // No expiry claim — nothing to blacklist

    // Remaining seconds until the token naturally expires
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);

    if (ttl > 0) {
      // 'EX' sets an auto-expiring key in Redis (TTL in seconds)
      await redisConnection.set(`blacklist:${token}`, '1', 'EX', ttl);
    }
  } catch {
    // Non-fatal — if blacklisting fails, the token expires naturally.
    // Swallowing this error is intentional to avoid crashing the logout flow.
  }
};

/**
 * Returns true if the token exists in the Redis blacklist.
 * Called in auth middleware before every protected route.
 * Fails open (returns false) on Redis errors to prevent a full outage.
 */
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  try {
    const result = await redisConnection.get(`blacklist:${token}`);
    return result !== null; // null = key not found = token is clean
  } catch {
    // If Redis is unreachable, allow the request through (fail open).
    // Tradeoff: briefly allows logged-out tokens during a Redis outage.
    // For stricter security, return true here to block all requests instead.
    return false;
  }
};