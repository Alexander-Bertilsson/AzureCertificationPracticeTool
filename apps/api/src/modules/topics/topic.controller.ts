import type { CertIdParams, TopicListResponse } from '@acpt/shared';
import type { FastifyRequest } from 'fastify';

import { listTopicsForCertification } from './topic.service.js';

export async function listTopicsHandler(
  req: FastifyRequest<{ Params: CertIdParams }>,
): Promise<TopicListResponse> {
  const items = await listTopicsForCertification(req.params.certId);
  return { items };
}
