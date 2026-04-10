import {
  CertIdParamsSchema,
  QuestionListQuerySchema,
  QuestionListResponseSchema,
} from '@acpt/shared';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

import { listQuestionsHandler } from './question.controller.js';

export function registerQuestionRoutes(app: FastifyInstance): void {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  typed.get(
    '/certifications/:certId/questions',
    {
      schema: {
        tags: ['questions'],
        summary:
          'List all questions for a certification (admin/test use; the quiz UI does not call this)',
        description:
          'Returns the full question records including the answer key. The quiz runner builds sessions via POST /quiz-sessions, which strips the answer key from the presented questions.',
        params: CertIdParamsSchema,
        querystring: QuestionListQuerySchema,
        response: {
          200: QuestionListResponseSchema,
        },
      },
    },
    listQuestionsHandler,
  );
}
