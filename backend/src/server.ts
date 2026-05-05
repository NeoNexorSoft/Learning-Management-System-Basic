import app from './app';
import { env } from './config/env';
import { prisma } from './config/db';

const start = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('Database connected');

    const server = app.listen(env.PORT, () => {
      console.log(`NeoNexor server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });

    // Disable socket timeout so large file uploads (videos, documents) don't get cut off
    server.timeout = 0;
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();
