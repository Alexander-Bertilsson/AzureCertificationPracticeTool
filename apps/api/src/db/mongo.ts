import mongoose from 'mongoose';

import { env } from '../config/env.js';

/**
 * Connect to MongoDB. Called from server.ts at startup, but fire-and-forget —
 * the api process must come up even if Mongo is down so /healthz (a liveness
 * probe) keeps working. Routes that actually need the DB will fail at request
 * time if the connection isn't established.
 *
 * Tests use mongodb-memory-server and call mongoose.connect directly with the
 * in-memory URL, so this module is not invoked from inside the test runner.
 */
export async function connectMongo(): Promise<typeof mongoose> {
  return mongoose.connect(env.MONGO_URL, {
    // Fail fast in dev — default is 30s which makes "is the DB up?" feedback
    // painful when you forget to run `pnpm db:up`.
    serverSelectionTimeoutMS: 5000,
  });
}

export async function disconnectMongo(): Promise<void> {
  // Safe to call even if connection was never established.
  await mongoose.disconnect();
}
