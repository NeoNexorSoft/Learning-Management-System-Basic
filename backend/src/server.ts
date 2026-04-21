import app from './app';
import { env } from './config/env';
import { prisma } from './config/db';

const start = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('Database connected');

    app.listen(env.PORT, () => {
      console.log(`NeoNexor server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();
