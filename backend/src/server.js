import env, { assertRequiredEnv } from './config/env.js';
import connectDB from './config/db.js';
import app from './app.js';

assertRequiredEnv();

const start = async () => {
  await connectDB();
  const server = app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] Chitram API running on port ${env.port} (${env.nodeEnv})`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n[server] ${signal} received, shutting down...`);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => {
    console.error('[server] Unhandled rejection:', reason);
    server.close(() => process.exit(1));
  });
};

start();
