import {
  WikiArticleSchema,
  type CertificationId,
  type TopicId,
  type WikiArticle,
  type WikiArticleId,
  type WikiArticleInput,
} from '@acpt/shared';
import { Types } from 'mongoose';

import { WikiArticleModel } from './wiki.model.js';

interface WikiLean {
  _id: Types.ObjectId;
  certificationId: Types.ObjectId;
  topicId: Types.ObjectId;
  slug: string;
  title: string;
  summary: string;
  body: string;
  sourceUrl: string;
  tags: string[];
  readingTimeMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

function toDto(lean: WikiLean): WikiArticle {
  return WikiArticleSchema.parse({
    id: lean._id.toHexString(),
    certificationId: lean.certificationId.toHexString(),
    topicId: lean.topicId.toHexString(),
    slug: lean.slug,
    title: lean.title,
    summary: lean.summary,
    body: lean.body,
    sourceUrl: lean.sourceUrl,
    tags: lean.tags,
    readingTimeMinutes: lean.readingTimeMinutes,
    createdAt: lean.createdAt.toISOString(),
    updatedAt: lean.updatedAt.toISOString(),
  });
}

export async function findArticlesByCertification(
  certId: CertificationId,
  topicId?: TopicId,
): Promise<WikiArticle[]> {
  if (!Types.ObjectId.isValid(certId)) {
    return [];
  }
  const filter: { certificationId: Types.ObjectId; topicId?: Types.ObjectId } = {
    certificationId: new Types.ObjectId(certId),
  };
  if (topicId !== undefined && Types.ObjectId.isValid(topicId)) {
    filter.topicId = new Types.ObjectId(topicId);
  }

  const docs = await WikiArticleModel.find(filter).sort({ slug: 1 }).lean<WikiLean[]>().exec();
  return docs.map(toDto);
}

export async function findArticleById(id: WikiArticleId): Promise<WikiArticle | null> {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }
  const doc = await WikiArticleModel.findById(id).lean<WikiLean | null>().exec();
  return doc === null ? null : toDto(doc);
}

export async function findArticleBySlug(
  certId: CertificationId,
  slug: string,
): Promise<WikiArticle | null> {
  if (!Types.ObjectId.isValid(certId)) {
    return null;
  }
  const doc = await WikiArticleModel.findOne({
    certificationId: new Types.ObjectId(certId),
    slug,
  })
    .lean<WikiLean | null>()
    .exec();
  return doc === null ? null : toDto(doc);
}

export async function upsertArticleBySlug(input: WikiArticleInput): Promise<WikiArticle> {
  const doc = await WikiArticleModel.findOneAndUpdate(
    {
      certificationId: new Types.ObjectId(input.certificationId),
      slug: input.slug,
    },
    {
      $set: {
        certificationId: new Types.ObjectId(input.certificationId),
        topicId: new Types.ObjectId(input.topicId),
        slug: input.slug,
        title: input.title,
        summary: input.summary,
        body: input.body,
        sourceUrl: input.sourceUrl,
        tags: input.tags,
        readingTimeMinutes: input.readingTimeMinutes,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )
    .lean<WikiLean | null>()
    .exec();

  if (doc === null) {
    throw new Error('upsertArticleBySlug: Mongoose returned null after upsert');
  }
  return toDto(doc);
}
