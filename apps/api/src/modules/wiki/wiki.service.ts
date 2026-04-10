import type { CertificationId, TopicId, WikiArticle, WikiArticleId } from '@acpt/shared';

import { NotFoundError } from '../../common/errors/not-found-error.js';
import { requireCertification } from '../certifications/certification.service.js';
import { requireTopic } from '../topics/topic.service.js';

import { findArticleById, findArticlesByCertification } from './wiki.repository.js';

/**
 * List wiki articles for a certification, optionally filtered by topic.
 * Validates the cert (and topic, if supplied) exist first so the client gets
 * a clean 404 instead of an empty list when ids are bogus.
 */
export async function listArticles(
  certId: CertificationId,
  topicId?: TopicId,
): Promise<WikiArticle[]> {
  await requireCertification(certId);
  if (topicId !== undefined) {
    await requireTopic(topicId);
  }
  return findArticlesByCertification(certId, topicId);
}

export async function requireArticle(id: WikiArticleId): Promise<WikiArticle> {
  const article = await findArticleById(id);
  if (article === null) {
    throw new NotFoundError(`Wiki article not found: ${id}`);
  }
  return article;
}
