import type { CertIdParams, QuestionListQuery, QuestionListResponse } from '@acpt/shared';
import type { FastifyRequest } from 'fastify';

import { listQuestionsForCertification } from './question.service.js';

export async function listQuestionsHandler(
  req: FastifyRequest<{ Params: CertIdParams; Querystring: QuestionListQuery }>,
): Promise<QuestionListResponse> {
  const items = await listQuestionsForCertification(req.params.certId, req.query.topicId);
  return { items };
}
