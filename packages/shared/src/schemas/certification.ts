import { z } from 'zod';

import { ObjectIdHexSchema, TimestampsSchema } from './common.js';

/**
 * Branded ObjectId hex string for certifications. Compile-time guarantees
 * that a `TopicId` cannot be passed where a `CertificationId` is expected.
 */
export const CertificationIdSchema = ObjectIdHexSchema.brand<'CertificationId'>();
export type CertificationId = z.infer<typeof CertificationIdSchema>;

/**
 * Full certification record as transported on the wire.
 */
export const CertificationSchema = z
  .object({
    id: CertificationIdSchema,
    code: z.string().min(1),
    slug: z.string().min(1),
    title: z.string().min(1),
    description: z.string(),
    mslearnPathUrl: z.string().url(),
  })
  .merge(TimestampsSchema);
export type Certification = z.infer<typeof CertificationSchema>;

/**
 * Shape used by the seed script and repository upserts — no id, no timestamps
 * (Mongoose generates them). Used for data that originates in /content.
 */
export const CertificationInputSchema = z.object({
  code: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  mslearnPathUrl: z.string().url(),
});
export type CertificationInput = z.infer<typeof CertificationInputSchema>;

export const CertificationListResponseSchema = z.object({
  items: z.array(CertificationSchema),
});
export type CertificationListResponse = z.infer<typeof CertificationListResponseSchema>;

export const CertificationDetailResponseSchema = CertificationSchema;
export type CertificationDetailResponse = z.infer<typeof CertificationDetailResponseSchema>;

export const CertIdParamsSchema = z.object({
  certId: CertificationIdSchema,
});
export type CertIdParams = z.infer<typeof CertIdParamsSchema>;
