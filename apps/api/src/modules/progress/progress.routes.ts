import { CertIdParamsSchema, ProgressResponseSchema } from '@acpt/shared';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

import { getProgressHandler } from './progress.controller.js';

export function registerProgressRoutes(app: FastifyInstance): void {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  typed.get(
    '/progress/:certId',
    {
      schema: {
        tags: ['progress'],
        summary: 'Overall progress + weak-area stats for one certification',
        description:
          "Aggregates this user's entire attempt history for the certification: total accuracy, per-topic accuracy (sorted weakest first), and a summary of the most recent quiz sessions.",
        params: CertIdParamsSchema,
        response: {
          200: ProgressResponseSchema,
        },
      },
    },
    getProgressHandler,
  );
}
