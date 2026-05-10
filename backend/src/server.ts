// ===================================================
// SERVER ENTRY POINT — Application Bootstrap
// ===================================================
// This is the first file Node.js executes when the app starts.
// Its only responsibilities are:
//   1. Connect to the database
//   2. Start the HTTP server
//   3. Configure request timeouts
//   4. Exit cleanly if anything goes wrong during startup
//
// All route and middleware setup lives in app.ts — not here.
// ===================================================

import app from './app';
import { env } from './config/env';
import { prisma } from './config/db';

// ─────────────────────────────────────────────
// Timeout Constants
// ─────────────────────────────────────────────
// Requests that exceed these limits are automatically
// terminated to free up server resources and prevent
// slow clients from hanging connections indefinitely.
//
// Two tiers are needed because file uploads are slow by
// nature — a blanket 30s would kill legitimate large uploads.

const SERVER_TIMEOUT_MS = 30_000;  // 30s  — default for all routes
const UPLOAD_TIMEOUT_MS = 120_000; // 120s — extended limit for /api/upload routes

// ─────────────────────────────────────────────
// Bootstrap Function
// ─────────────────────────────────────────────
// Wrapped in an async function so we can use await
// for the DB connection before starting the server.
// If anything throws, the catch block handles a clean exit.
const start = async (): Promise<void> => {
  try {
    // Step 1: Verify the database is reachable before accepting any traffic.
    // If this throws, the server never starts — fail fast rather than
    // starting up and crashing on the first DB query.
    await prisma.$connect();
    console.log('Database connected');

    // Step 2: Bind the Express app to the configured port.
    // env.PORT comes from .env (default: 5000 — see config/env.ts).
    // The callback fires once the port is successfully bound.
    const server = app.listen(env.PORT, () => {
      console.log(`NeoNexor server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });

    // Step 3: Apply the global 30s timeout to every HTTP connection.
    // server.timeout is a Node.js built-in — it closes the socket
    // automatically if a response hasn't been sent within the limit.
    server.timeout = SERVER_TIMEOUT_MS;

    // Step 4: Override the timeout for upload routes only.
    // This middleware must be registered after the server starts
    // but it intercepts matching requests before the body is parsed,
    // so the extended timeout is applied in time.
    //
    // Both req and res timeouts are set — req covers the incoming
    // upload stream; res covers the time to process and respond after.
    app.use('/api/upload', (req, res, next) => {
      req.setTimeout(UPLOAD_TIMEOUT_MS);
      res.setTimeout(UPLOAD_TIMEOUT_MS);
      next();
    });

  } catch (error) {
    // If DB connection or server binding fails, log the reason,
    // release the Prisma connection pool, and exit with code 1.
    // Exit code 1 signals to the OS / Docker / PM2 that this was
    // an abnormal exit — process managers can use this to auto-restart.
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Kick off the bootstrap sequence.
// No top-level await here — start() handles its own errors internally.
start();