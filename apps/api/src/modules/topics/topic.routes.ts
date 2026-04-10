import { CertIdParamsSchema, TopicListResponseSchema } from '@acpt/shared';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

import { listTopicsHandler } from './topic.controller.js';

export function registerTopicRoutes(app: FastifyInstance): void {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  typed.get(
    '/certifications/:certId/topics',
    {
      schema: {
        tags: ['topics'],
        summary: 'List topics for a certification, ordered by `order` ascending',
        params: CertIdParamsSchema,
        response: {
          200: TopicListResponseSchema,
        },
      },
    },
    listTopicsHandler,
  );
}
