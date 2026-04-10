import 'dotenv/config';

import { buildApp } from './app.js';
import { env } from './config/env.js';
import { connectMongo, disconnectMongo } from './db/mongo.js';

async function main(): Promise<void> {
  const app = await buildApp();

  // Mongo connection is non-blocking on purpose. /healthz is a liveness probe
  // and must work even if the DB is down — routes that need Mongo will fail
  // at request time. Run `pnpm db:up` to start the dev MongoDB container.
  void (async () => {
    try {
      await connectMongo();
      app.log.info('connected to MongoDB');
    } catch (err: unknown) {
      app.log.warn({ err }, 'MongoDB connection failed — run `pnpm db:up` to start the dev DB');
    }
  })();

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info({ signal }, 'shutting down');
    await app.close();
    await disconnectMongo();
    process.exit(0);
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  await app.listen({ host: env.HOST, port: env.PORT });
  app.log.info({ url: `http://${env.HOST}:${String(env.PORT)}/docs` }, 'Swagger UI ready');
}

main().catch((err: unknown) => {
  console.error('Failed to start API:', err);
  process.exit(1);
});
