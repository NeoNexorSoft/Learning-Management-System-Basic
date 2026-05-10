import app from './app';
import { env } from './config/env';
import { prisma } from './config/db';

const SERVER_TIMEOUT_MS = 30_000;
const UPLOAD_TIMEOUT_MS = 120_000;

const start = async (): Promise<void> => {
  try {
    await prisma.$connect();

    console.log('Database connected');

    const server = app.listen(env.PORT, () => {
      console.log(
        `NeoNexor server running on port ${env.PORT} [${env.NODE_ENV}]`,
      );
    });

    server.timeout = SERVER_TIMEOUT_MS;

    app.use('/api/upload', (req, res, next) => {
      req.setTimeout(UPLOAD_TIMEOUT_MS);
      res.setTimeout(UPLOAD_TIMEOUT_MS);
      next();
    });

  } catch (error) {
    console.error(
      'Failed to start server:',
      error,
    );

    await prisma.$disconnect();

    process.exit(1);
  }
};

start();