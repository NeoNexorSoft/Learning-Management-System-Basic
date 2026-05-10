// ===================================================
// ENV CONFIG — Environment Variable Loader
// ===================================================
// This file loads and validates all environment
// variables in one place for the entire application.
// Instead of using process.env directly across the
// codebase, import from here to avoid typos and
// keep the code clean and maintainable.
// ===================================================

import dotenv from 'dotenv';

// Loads all variables from the .env file into process.env.
// Must be called before anything else — otherwise the
// variables below won't be available yet.
dotenv.config();

// ─────────────────────────────────────────────
// Helper Function: requireEnv
// ─────────────────────────────────────────────
// Throws an error immediately if a required variable
// is missing from .env. This "fail-fast" approach
// surfaces missing config at startup rather than
// causing a mysterious crash deep in the app later.
//
// @param key   - The process.env variable name (e.g. 'DATABASE_URL')
// @returns     - The string value of that variable
// @throws      - Error if the variable is not set
// ─────────────────────────────────────────────
const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

// ─────────────────────────────────────────────
// Main Config Object: env
// ─────────────────────────────────────────────
// Import this object anywhere in the app to access
// config values. There are two kinds of variables:
//   1. Required  → loaded via requireEnv(), crashes if missing
//   2. Optional  → has a fallback default via ??
// ─────────────────────────────────────────────
export const env = {
  // ── Database ───────────────────────────────
  // PostgreSQL / MySQL connection string.
  // Required — the app cannot connect to DB without this.
  // Example: postgresql://user:pass@localhost:5432/mydb
  DATABASE_URL: requireEnv('DATABASE_URL'),

  // ── JWT Authentication ─────────────────────
  // Secret key used to sign access tokens.
  // Required — never expose this to the client side.
  JWT_ACCESS_SECRET: requireEnv('JWT_ACCESS_SECRET'),

  // Secret key used to sign refresh tokens.
  // Required — must be different from the access secret.
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET'),

  // How long an access token stays valid.
  // Optional — defaults to 15 minutes (kept short on purpose).
  JWT_ACCESS_EXPIRES: (process.env.JWT_ACCESS_EXPIRES ?? '15m') as string,

  // How long a refresh token stays valid.
  // Optional — defaults to 7 days (used to issue new access tokens).
  JWT_REFRESH_EXPIRES: (process.env.JWT_REFRESH_EXPIRES ?? '7d') as string,

  // ── Server ─────────────────────────────────
  // The port the Express server listens on.
  // Optional — defaults to 5000.
  // parseInt() converts the string from process.env to a number.
  PORT: parseInt(process.env.PORT ?? '5000', 10),

  // ── App Environment ────────────────────────
  // Indicates which environment the app is running in.
  // Optional — defaults to 'development'.
  // The TypeScript union type restricts it to only valid values.
  NODE_ENV: (process.env.NODE_ENV ?? 'development') as 'development' | 'production' | 'test',

  // ── Cloudinary (Image Uploads) ─────────────
  // Credentials for uploading images to Cloudinary.
  // Optional — leave empty if the image feature is not used.
  // Find these at: https://cloudinary.com/console
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? '',

  // ── CORS / Client ──────────────────────────
  // The frontend URL — needed to allow it through CORS policy.
  // Optional — defaults to localhost:3000 for local development.
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:3000',
};