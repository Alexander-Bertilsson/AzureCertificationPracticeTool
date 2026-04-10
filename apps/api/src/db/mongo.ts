import mongoose from 'mongoose';

import { env } from '../config/env.js';

/**
 * Connect to MongoDB. Called from server.ts at startup. Tests use
 * mongodb-memory-server and call mongoose.connect directly with the in-memory
 * URL, so this module is not invoked from inside the test runner.
 */
export async function connectMongo(): Promise<typeof mongoose> {
  return mongoose.connect(env.MONGO_URL);
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}
