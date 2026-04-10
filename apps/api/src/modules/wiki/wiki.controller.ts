import type {
  CertIdParams,
  WikiArticle,
  WikiArticleIdParams,
  WikiArticleListResponse,
  WikiListQuery,
} from '@acpt/shared';
import type { FastifyRequest } from 'fastify';

import { listArticles, requireArticle } from './wiki.service.js';

export async function listArticlesHandler(
  req: FastifyRequest<{ Params: CertIdParams; Querystring: WikiListQuery }>,
): Promise<WikiArticleListResponse> {
  const items = await listArticles(req.params.certId, req.query.topicId);
  return { items };
}

export async function getArticleHandler(
  req: FastifyRequest<{ Params: WikiArticleIdParams }>,
): Promise<WikiArticle> {
  return requireArticle(req.params.articleId);
}
