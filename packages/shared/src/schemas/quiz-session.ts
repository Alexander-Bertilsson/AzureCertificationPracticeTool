import { z } from 'zod';

import { CertificationIdSchema } from './certification.js';
import { ObjectIdHexSchema, TimestampsSchema } from './common.js';
import { ChoiceIdSchema, PresentedQuestionSchema, QuestionIdSchema } from './question.js';
import { TopicIdSchema } from './topic.js';

export const QuizSessionIdSchema = ObjectIdHexSchema.brand<'QuizSessionId'>();
export type QuizSessionId = z.infer<typeof QuizSessionIdSchema>;

export const AttemptIdSchema = ObjectIdHexSchema.brand<'AttemptId'>();
export type AttemptId = z.infer<typeof AttemptIdSchema>;

export const QuizModeSchema = z.enum(['single-topic', 'mixed']);
export type QuizMode = z.infer<typeof QuizModeSchema>;

export const QuizLengthSchema = z.union([z.literal(25), z.literal(50)]);
export type QuizLength = z.infer<typeof QuizLengthSchema>;

export const QuizStatusSchema = z.enum(['in-progress', 'completed', 'abandoned']);
export type QuizStatus = z.infer<typeof QuizStatusSchema>;

/**
 * Per-topic correct/total breakdown. Keys are topic id hex strings (not branded
 * because zod records can't use branded keys). Used inside QuizScore.
 */
export const PerTopicScoreSchema = z.record(
  z.string(),
  z.object({
    correct: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
  }),
);
export type PerTopicScore = z.infer<typeof PerTopicScoreSchema>;

export const QuizScoreSchema = z.object({
  correct: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  perTopic: PerTopicScoreSchema,
});
export type QuizScore = z.infer<typeof QuizScoreSchema>;

export const QuizSessionSchema = z
  .object({
    id: QuizSessionIdSchema,
    userId: z.string(),
    certificationId: CertificationIdSchema,
    mode: QuizModeSchema,
    topicId: TopicIdSchema.optional(),
    length: QuizLengthSchema,
    questionIds: z.array(QuestionIdSchema),
    status: QuizStatusSchema,
    startedAt: z.string().datetime(),
    completedAt: z.string().datetime().optional(),
    score: QuizScoreSchema.optional(),
  })
  .merge(TimestampsSchema);
export type QuizSession = z.infer<typeof QuizSessionSchema>;

export const AttemptSchema = z.object({
  id: AttemptIdSchema,
  userId: z.string(),
  quizSessionId: QuizSessionIdSchema,
  certificationId: CertificationIdSchema,
  topicId: TopicIdSchema,
  questionId: QuestionIdSchema,
  selectedChoiceIds: z.array(ChoiceIdSchema),
  isCorrect: z.boolean(),
  answeredAt: z.string().datetime(),
});
export type Attempt = z.infer<typeof AttemptSchema>;

/**
 * Request body for POST /quiz-sessions. The cross-field rule
 * (single-topic ⇔ topicId) is enforced by .superRefine.
 */
export const CreateQuizSessionRequestSchema = z
  .object({
    certificationId: CertificationIdSchema,
    mode: QuizModeSchema,
    topicId: TopicIdSchema.optional(),
    length: QuizLengthSchema,
  })
  .superRefine((data, ctx) => {
    if (data.mode === 'single-topic' && data.topicId === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'single-topic mode requires topicId',
        path: ['topicId'],
      });
    }
    if (data.mode === 'mixed' && data.topicId !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'mixed mode forbids topicId',
        path: ['topicId'],
      });
    }
  });
export type CreateQuizSessionRequest = z.infer<typeof CreateQuizSessionRequestSchema>;

/**
 * Response from POST /quiz-sessions and GET /quiz-sessions/:id. Includes the
 * session metadata plus the presented questions (answer key + explanation
 * stripped — see PresentedQuestion).
 */
export const QuizSessionResponseSchema = z.object({
  session: QuizSessionSchema,
  questions: z.array(PresentedQuestionSchema),
});
export type QuizSessionResponse = z.infer<typeof QuizSessionResponseSchema>;

export const SessionIdParamsSchema = z.object({
  sessionId: QuizSessionIdSchema,
});
export type SessionIdParams = z.infer<typeof SessionIdParamsSchema>;

/**
 * Body for POST /quiz-sessions/:sessionId/attempts.
 */
export const SubmitAttemptRequestSchema = z.object({
  questionId: QuestionIdSchema,
  selectedChoiceIds: z.array(ChoiceIdSchema).min(1),
});
export type SubmitAttemptRequest = z.infer<typeof SubmitAttemptRequestSchema>;

/**
 * Response for POST /quiz-sessions/:sessionId/attempts. Reveals the answer key
 * and explanation for the question that was just submitted.
 */
export const AttemptResultResponseSchema = z.object({
  questionId: QuestionIdSchema,
  isCorrect: z.boolean(),
  correctChoiceIds: z.array(ChoiceIdSchema),
  explanation: z.string(),
  sourceUrl: z.string().url(),
});
export type AttemptResultResponse = z.infer<typeof AttemptResultResponseSchema>;

/**
 * Response for POST /quiz-sessions/:sessionId/complete. The session payload
 * includes the populated `score` field with the per-topic breakdown.
 */
export const QuizSessionSummaryResponseSchema = z.object({
  session: QuizSessionSchema,
});
export type QuizSessionSummaryResponse = z.infer<typeof QuizSessionSummaryResponseSchema>;
