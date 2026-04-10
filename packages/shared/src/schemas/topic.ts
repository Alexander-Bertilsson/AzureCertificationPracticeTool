import { z } from 'zod';

import { CertificationIdSchema } from './certification.js';
import { ObjectIdHexSchema, TimestampsSchema } from './common.js';

export const TopicIdSchema = ObjectIdHexSchema.brand<'TopicId'>();
export type TopicId = z.infer<typeof TopicIdSchema>;

export const TopicSchema = z
  .object({
    id: TopicIdSchema,
    certificationId: CertificationIdSchema,
    slug: z.string().min(1),
    title: z.string().min(1),
    order: z.number().int().nonnegative(),
    description: z.string(),
  })
  .merge(TimestampsSchema);
export type Topic = z.infer<typeof TopicSchema>;

/**
 * Shape used by the seed script and repository upserts — no id, no timestamps.
 */
export const TopicInputSchema = z.object({
  certificationId: CertificationIdSchema,
  slug: z.string().min(1),
  title: z.string().min(1),
  order: z.number().int().nonnegative(),
  description: z.string(),
});
export type TopicInput = z.infer<typeof TopicInputSchema>;

export const TopicListResponseSchema = z.object({
  items: z.array(TopicSchema),
});
export type TopicListResponse = z.infer<typeof TopicListResponseSchema>;

export const TopicIdParamsSchema = z.object({
  topicId: TopicIdSchema,
});
export type TopicIdParams = z.infer<typeof TopicIdParamsSchema>;
