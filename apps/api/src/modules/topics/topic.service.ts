import type { CertificationId, Topic, TopicId } from '@acpt/shared';

import { NotFoundError } from '../../common/errors/not-found-error.js';
import { requireCertification } from '../certifications/certification.service.js';

import { findTopicById, findTopicsByCertification } from './topic.repository.js';

/**
 * List topics for a certification. Validates the cert exists first so the
 * client gets a clean 404 instead of an empty array if they pass a bogus id.
 */
export async function listTopicsForCertification(certId: CertificationId): Promise<Topic[]> {
  await requireCertification(certId);
  return findTopicsByCertification(certId);
}

/**
 * Fetch a topic by id. Throws `NotFoundError` when absent — used by other
 * modules (wiki, questions) to validate that a topic reference is valid.
 */
export async function requireTopic(id: TopicId): Promise<Topic> {
  const topic = await findTopicById(id);
  if (topic === null) {
    throw new NotFoundError(`Topic not found: ${id}`);
  }
  return topic;
}
