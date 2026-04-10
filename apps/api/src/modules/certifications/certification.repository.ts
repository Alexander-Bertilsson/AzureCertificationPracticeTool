import {
  CertificationSchema,
  type Certification,
  type CertificationId,
  type CertificationInput,
} from '@acpt/shared';
import { Types } from 'mongoose';

import { CertificationModel } from './certification.model.js';

/**
 * Shape of a .lean() result from CertificationModel. We destructure what we
 * need and run it through the zod schema so the returned DTO is branded and
 * never exposes Mongoose-specific types to callers.
 */
interface CertLean {
  _id: Types.ObjectId;
  code: string;
  slug: string;
  title: string;
  description: string;
  mslearnPathUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

function toDto(lean: CertLean): Certification {
  return CertificationSchema.parse({
    id: lean._id.toHexString(),
    code: lean.code,
    slug: lean.slug,
    title: lean.title,
    description: lean.description,
    mslearnPathUrl: lean.mslearnPathUrl,
    createdAt: lean.createdAt.toISOString(),
    updatedAt: lean.updatedAt.toISOString(),
  });
}

export async function findAllCertifications(): Promise<Certification[]> {
  const docs = await CertificationModel.find().sort({ slug: 1 }).lean<CertLean[]>().exec();
  return docs.map(toDto);
}

export async function findCertificationById(id: CertificationId): Promise<Certification | null> {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }
  const doc = await CertificationModel.findById(id).lean<CertLean | null>().exec();
  return doc === null ? null : toDto(doc);
}

export async function findCertificationBySlug(slug: string): Promise<Certification | null> {
  const doc = await CertificationModel.findOne({ slug }).lean<CertLean | null>().exec();
  return doc === null ? null : toDto(doc);
}

/**
 * Upsert a certification by slug. Used by the seed script and in tests.
 * Returns the full (post-upsert) record.
 */
export async function upsertCertificationBySlug(input: CertificationInput): Promise<Certification> {
  const doc = await CertificationModel.findOneAndUpdate(
    { slug: input.slug },
    { $set: input },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )
    .lean<CertLean | null>()
    .exec();

  if (doc === null) {
    // upsert with new: true always returns the doc, so this branch is unreachable
    // under normal Mongoose semantics. Kept for the type narrowing.
    throw new Error('upsertCertificationBySlug: Mongoose returned null after upsert');
  }

  return toDto(doc);
}
