import { z } from 'zod';

import { CertificationIdSchema } from './certification.js';
import { ObjectIdHexSchema, TimestampsSchema } from './common.js';
import { TopicIdSchema } from './topic.js';

export const QuestionIdSchema = ObjectIdHexSchema.brand<'QuestionId'>();
export type QuestionId = z.infer<typeof QuestionIdSchema>;

export const ChoiceIdSchema = z.enum(['A', 'B', 'C', 'D', 'E']);
export type ChoiceId = z.infer<typeof ChoiceIdSchema>;

export const QuestionDifficultySchema = z.enum(['easy', 'medium', 'hard']);
export type QuestionDifficulty = z.infer<typeof QuestionDifficultySchema>;

/**
 * Whether a question expects exactly one answer (render as radio buttons) or
 * may have more than one correct answer (render as checkboxes). Derived from
 * `correctChoiceIds.length` on the server so the field is always correct, but
 * exposed on `PresentedQuestion` so the quiz runner can pick the right input
 * affordance without needing the answer key.
 */
export const QuestionTypeSchema = z.enum(['single', 'multiple']);
export type QuestionType = z.infer<typeof QuestionTypeSchema>;

export const QuestionChoiceSchema = z.object({
  id: ChoiceIdSchema,
  text: z.string().min(1),
});
export type QuestionChoice = z.infer<typeof QuestionChoiceSchema>;

/**
 * Full question record. Includes the answer key — only the API and the seed
 * script see this shape. The quiz runner uses a "presented" view that omits
 * `correctChoiceIds` and `explanation` until the user has submitted an answer.
 */
export const QuestionSchema = z
  .object({
    id: QuestionIdSchema,
    certificationId: CertificationIdSchema,
    topicId: TopicIdSchema,
    externalId: z.string().min(1),
    prompt: z.string().min(1),
    choices: z.array(QuestionChoiceSchema).min(2),
    correctChoiceIds: z.array(ChoiceIdSchema).min(1),
    explanation: z.string(),
    sourceUrl: z.string().url(),
    difficulty: QuestionDifficultySchema,
    tags: z.array(z.string()),
  })
  .merge(TimestampsSchema);
export type Question = z.infer<typeof QuestionSchema>;

/**
 * Shape used by the seed script and repository upserts. `externalId` is the
 * stable id from the JSON content file — same id across reseeds.
 */
export const QuestionInputSchema = z.object({
  certificationId: CertificationIdSchema,
  topicId: TopicIdSchema,
  externalId: z.string().min(1),
  prompt: z.string().min(1),
  choices: z.array(QuestionChoiceSchema).min(2),
  correctChoiceIds: z.array(ChoiceIdSchema).min(1),
  explanation: z.string(),
  sourceUrl: z.string().url(),
  difficulty: QuestionDifficultySchema,
  tags: z.array(z.string()),
});
export type QuestionInput = z.infer<typeof QuestionInputSchema>;

/**
 * "Presented" question — what the quiz runner shows the user before they
 * answer. The answer key (`correctChoiceIds`) and `explanation` are NOT
 * included; they're only revealed via the attempt response.
 */
export const PresentedQuestionSchema = z.object({
  id: QuestionIdSchema,
  certificationId: CertificationIdSchema,
  topicId: TopicIdSchema,
  prompt: z.string(),
  choices: z.array(QuestionChoiceSchema),
  questionType: QuestionTypeSchema,
  difficulty: QuestionDifficultySchema,
  tags: z.array(z.string()),
});
export type PresentedQuestion = z.infer<typeof PresentedQuestionSchema>;

export const QuestionListResponseSchema = z.object({
  items: z.array(QuestionSchema),
});
export type QuestionListResponse = z.infer<typeof QuestionListResponseSchema>;

export const QuestionListQuerySchema = z.object({
  topicId: TopicIdSchema.optional(),
});
export type QuestionListQuery = z.infer<typeof QuestionListQuerySchema>;
