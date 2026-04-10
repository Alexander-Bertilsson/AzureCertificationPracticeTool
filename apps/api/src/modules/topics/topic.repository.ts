import {
  TopicSchema,
  type CertificationId,
  type Topic,
  type TopicId,
  type TopicInput,
} from '@acpt/shared';
import { Types } from 'mongoose';

import { TopicModel } from './topic.model.js';

interface TopicLean {
  _id: Types.ObjectId;
  certificationId: Types.ObjectId;
  slug: string;
  title: string;
  order: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

function toDto(lean: TopicLean): Topic {
  return TopicSchema.parse({
    id: lean._id.toHexString(),
    certificationId: lean.certificationId.toHexString(),
    slug: lean.slug,
    title: lean.title,
    order: lean.order,
    description: lean.description,
    createdAt: lean.createdAt.toISOString(),
    updatedAt: lean.updatedAt.toISOString(),
  });
}

export async function findTopicsByCertification(certId: CertificationId): Promise<Topic[]> {
  if (!Types.ObjectId.isValid(certId)) {
    return [];
  }
  const docs = await TopicModel.find({ certificationId: new Types.ObjectId(certId) })
    .sort({ order: 1 })
    .lean<TopicLean[]>()
    .exec();
  return docs.map(toDto);
}

export async function findTopicById(id: TopicId): Promise<Topic | null> {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }
  const doc = await TopicModel.findById(id).lean<TopicLean | null>().exec();
  return doc === null ? null : toDto(doc);
}

export async function findTopicBySlug(
  certId: CertificationId,
  slug: string,
): Promise<Topic | null> {
  if (!Types.ObjectId.isValid(certId)) {
    return null;
  }
  const doc = await TopicModel.findOne({
    certificationId: new Types.ObjectId(certId),
    slug,
  })
    .lean<TopicLean | null>()
    .exec();
  return doc === null ? null : toDto(doc);
}

export async function upsertTopicBySlug(input: TopicInput): Promise<Topic> {
  const doc = await TopicModel.findOneAndUpdate(
    {
      certificationId: new Types.ObjectId(input.certificationId),
      slug: input.slug,
    },
    {
      $set: {
        certificationId: new Types.ObjectId(input.certificationId),
        slug: input.slug,
        title: input.title,
        order: input.order,
        description: input.description,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )
    .lean<TopicLean | null>()
    .exec();

  if (doc === null) {
    throw new Error('upsertTopicBySlug: Mongoose returned null after upsert');
  }
  return toDto(doc);
}
