import { randomUUID } from 'node:crypto';

import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import Fastify, { type FastifyInstance } from 'fastify';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { z } from 'zod';

import { errorHandler } from './common/middleware/error-handler.js';
import { env } from './config/env.js';
import { registerCertificationRoutes } from './modules/certifications/certification.routes.js';
import { registerProgressRoutes } from './modules/progress/progress.routes.js';
import { registerQuestionRoutes } from './modules/questions/question.routes.js';
import { registerQuizSessionRoutes } from './modules/quiz-sessions/quiz-session.routes.js';
import { registerTopicRoutes } from './modules/topics/topic.routes.js';
import { registerWikiRoutes } from './modules/wiki/wiki.routes.js';

/**
 * Build a fully-configured Fastify instance. Pure factory — no listening, no
 * Mongo connection. Tests call this directly and use `app.inject(...)` for
 * HTTP simulation. The runtime entry point (server.ts) is the only place that
 * connects to Mongo and calls `app.listen(...)`.
 */
export async function buildApp(): Promise<FastifyInstance> {
  const isDev = env.NODE_ENV === 'development';

  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      ...(isDev
        ? {
            transport: {
              target: 'pino-pretty',
              options: { translateTime: 'HH:MM:ss.l', ignore: 'pid,hostname' },
            },
          }
        : {}),
    },
    genReqId: () => randomUUID(),
    disableRequestLogging: false,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler(errorHandler);

  await app.register(fastifyCors, { origin: env.CORS_ORIGIN });

  await app.register(fastifySwagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Azure Certification Practice API',
        description: 'REST API powering the Azure cert study tool.',
        version: '0.0.0',
      },
      servers: [{ url: `http://localhost:${String(env.PORT)}/api/v1` }],
    },
    transform: jsonSchemaTransform,
  });

  await app.register(fastifySwaggerUi, { routePrefix: '/docs' });

  app.get(
    '/healthz',
    {
      schema: {
        tags: ['health'],
        summary: 'Liveness probe',
        response: {
          200: z.object({ status: z.literal('ok') }),
        },
      },
    },
    () => ({ status: 'ok' as const }),
  );

  await app.register(
    (v1, _opts, done) => {
      registerCertificationRoutes(v1);
      registerTopicRoutes(v1);
      registerWikiRoutes(v1);
      registerQuestionRoutes(v1);
      registerQuizSessionRoutes(v1);
      registerProgressRoutes(v1);
      done();
    },
    { prefix: '/api/v1' },
  );

  await app.ready();
  return app;
}
