import { z } from 'zod';

import { CertificationIdSchema } from './certification.js';
import { QuizScoreSchema, QuizSessionIdSchema, QuizStatusSchema } from './quiz-session.js';
import { TopicIdSchema } from './topic.js';

/**
 * Per-topic accuracy across the user's entire history for one certification.
 * `accuracy` is `correct / total` (0 when there are no attempts on that topic
 * — but in that case the row shouldn't appear at all).
 */
export const TopicAccuracySchema = z.object({
  topicId: TopicIdSchema,
  topicSlug: z.string(),
  topicTitle: z.string(),
  correct: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  accuracy: z.number().min(0).max(1),
});
export type TopicAccuracy = z.infer<typeof TopicAccuracySchema>;

/**
 * Lightweight summary of a recent quiz session, returned as part of the
 * progress payload so the dashboard can show "your last few quizzes".
 */
export const RecentSessionSummarySchema = z.object({
  sessionId: QuizSessionIdSchema,
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  status: QuizStatusSchema,
  length: z.number().int().positive(),
  score: QuizScoreSchema.optional(),
});
export type RecentSessionSummary = z.infer<typeof RecentSessionSummarySchema>;

export const ProgressResponseSchema = z.object({
  certificationId: CertificationIdSchema,
  totalAttempts: z.number().int().nonnegative(),
  totalCorrect: z.number().int().nonnegative(),
  overallAccuracy: z.number().min(0).max(1),
  perTopic: z.array(TopicAccuracySchema),
  recentSessions: z.array(RecentSessionSummarySchema),
});
export type ProgressResponse = z.infer<typeof ProgressResponseSchema>;
