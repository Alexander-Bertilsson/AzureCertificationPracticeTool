import { z } from 'zod';

import { CertificationIdSchema } from './certification.js';
import { ObjectIdHexSchema, TimestampsSchema } from './common.js';
import { TopicIdSchema } from './topic.js';

export const WikiArticleIdSchema = ObjectIdHexSchema.brand<'WikiArticleId'>();
export type WikiArticleId = z.infer<typeof WikiArticleIdSchema>;

export const WikiArticleSchema = z
  .object({
    id: WikiArticleIdSchema,
    certificationId: CertificationIdSchema,
    topicId: TopicIdSchema,
    slug: z.string().min(1),
    title: z.string().min(1),
    summary: z.string(),
    body: z.string(),
    sourceUrl: z.string().url(),
    tags: z.array(z.string()),
    readingTimeMinutes: z.number().int().nonnegative(),
  })
  .merge(TimestampsSchema);
export type WikiArticle = z.infer<typeof WikiArticleSchema>;

/**
 * Shape used by the seed script and repository upserts — no id, no timestamps.
 */
export const WikiArticleInputSchema = z.object({
  certificationId: CertificationIdSchema,
  topicId: TopicIdSchema,
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string(),
  body: z.string(),
  sourceUrl: z.string().url(),
  tags: z.array(z.string()),
  readingTimeMinutes: z.number().int().nonnegative(),
});
export type WikiArticleInput = z.infer<typeof WikiArticleInputSchema>;

export const WikiArticleListResponseSchema = z.object({
  items: z.array(WikiArticleSchema),
});
export type WikiArticleListResponse = z.infer<typeof WikiArticleListResponseSchema>;

export const WikiArticleResponseSchema = WikiArticleSchema;
export type WikiArticleResponse = z.infer<typeof WikiArticleResponseSchema>;

export const WikiArticleIdParamsSchema = z.object({
  articleId: WikiArticleIdSchema,
});
export type WikiArticleIdParams = z.infer<typeof WikiArticleIdParamsSchema>;

/**
 * Optional `?topicId=...` query for filtering the wiki list within a cert.
 */
export const WikiListQuerySchema = z.object({
  topicId: TopicIdSchema.optional(),
});
export type WikiListQuery = z.infer<typeof WikiListQuerySchema>;
