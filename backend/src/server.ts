import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

const startServer = async () => {
  try {
    await prisma.$connect();

    app.listen(env.PORT, () => {
      console.log(`Backend server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
