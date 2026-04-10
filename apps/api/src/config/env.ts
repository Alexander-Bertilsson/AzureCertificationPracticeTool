import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGO_URL: z.string().url().default('mongodb://localhost:27017/azure-cert-practice'),
  CORS_ORIGIN: z.string().default('http://localhost:8081'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Logger is not yet constructed at this point — using console.error is the
  // only option for surfacing the failure before the process exits.

  console.error('Invalid environment configuration:', parsed.error.flatten());
  process.exit(1);
}

export const env: Env = parsed.data;
