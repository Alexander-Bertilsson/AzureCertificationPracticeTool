import { z } from 'zod';

/**
 * A 24-character hexadecimal ObjectId string, validated at the wire boundary.
 * Every entity ID schema brands this to create a nominally-typed ID.
 */
export const ObjectIdHexSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId hex string');

/**
 * Standard timestamps present on every entity. Transported as ISO 8601 strings.
 */
export const TimestampsSchema = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Standard error envelope returned by the API on any non-2xx response.
 * Documented in the OpenAPI spec and consumed by the frontend fetch client.
 */
export const ErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string(),
    details: z.unknown().optional(),
  }),
});
export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;
