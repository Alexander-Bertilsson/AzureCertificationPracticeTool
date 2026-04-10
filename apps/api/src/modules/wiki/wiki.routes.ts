import {
  CertIdParamsSchema,
  WikiArticleIdParamsSchema,
  WikiArticleListResponseSchema,
  WikiArticleResponseSchema,
  WikiListQuerySchema,
} from '@acpt/shared';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

import { getArticleHandler, listArticlesHandler } from './wiki.controller.js';

export function registerWikiRoutes(app: FastifyInstance): void {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  typed.get(
    '/certifications/:certId/wiki',
    {
      schema: {
        tags: ['wiki'],
        summary: 'List wiki articles for a certification (optionally filtered by topic)',
        params: CertIdParamsSchema,
        querystring: WikiListQuerySchema,
        response: {
          200: WikiArticleListResponseSchema,
        },
      },
    },
    listArticlesHandler,
  );

  typed.get(
    '/wiki/:articleId',
    {
      schema: {
        tags: ['wiki'],
        summary: 'Get a wiki article by id (includes the markdown body)',
        params: WikiArticleIdParamsSchema,
        response: {
          200: WikiArticleResponseSchema,
        },
      },
    },
    getArticleHandler,
  );
}
