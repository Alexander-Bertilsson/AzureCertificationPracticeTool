import {
  QuestionSchema,
  type CertificationId,
  type Question,
  type QuestionId,
  type QuestionInput,
  type TopicId,
} from '@acpt/shared';
import { Types } from 'mongoose';

import { QuestionModel } from './question.model.js';

interface QuestionLean {
  _id: Types.ObjectId;
  certificationId: Types.ObjectId;
  topicId: Types.ObjectId;
  externalId: string;
  prompt: string;
  choices: { id: string; text: string }[];
  correctChoiceIds: string[];
  explanation: string;
  sourceUrl: string;
  difficulty: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

function toDto(lean: QuestionLean): Question {
  return QuestionSchema.parse({
    id: lean._id.toHexString(),
    certificationId: lean.certificationId.toHexString(),
    topicId: lean.topicId.toHexString(),
    externalId: lean.externalId,
    prompt: lean.prompt,
    choices: lean.choices,
    correctChoiceIds: lean.correctChoiceIds,
    explanation: lean.explanation,
    sourceUrl: lean.sourceUrl,
    difficulty: lean.difficulty,
    tags: lean.tags,
    createdAt: lean.createdAt.toISOString(),
    updatedAt: lean.updatedAt.toISOString(),
  });
}

export async function findQuestionsByCertification(
  certId: CertificationId,
  topicId?: TopicId,
): Promise<Question[]> {
  if (!Types.ObjectId.isValid(certId)) {
    return [];
  }
  const filter: { certificationId: Types.ObjectId; topicId?: Types.ObjectId } = {
    certificationId: new Types.ObjectId(certId),
  };
  if (topicId !== undefined && Types.ObjectId.isValid(topicId)) {
    filter.topicId = new Types.ObjectId(topicId);
  }

  const docs = await QuestionModel.find(filter).lean<QuestionLean[]>().exec();
  return docs.map(toDto);
}

export async function findQuestionById(id: QuestionId): Promise<Question | null> {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }
  const doc = await QuestionModel.findById(id).lean<QuestionLean | null>().exec();
  return doc === null ? null : toDto(doc);
}

export async function findQuestionsByIds(ids: QuestionId[]): Promise<Question[]> {
  const validIds = ids
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));
  if (validIds.length === 0) {
    return [];
  }
  const docs = await QuestionModel.find({ _id: { $in: validIds } })
    .lean<QuestionLean[]>()
    .exec();
  return docs.map(toDto);
}

/**
 * Sample N random questions from a certification, optionally restricted to a
 * single topic. Used by the quiz-sessions module to build a quiz. Returns the
 * full set if fewer than N questions are available.
 */
export async function sampleQuestions(
  certId: CertificationId,
  count: number,
  topicId?: TopicId,
): Promise<Question[]> {
  if (!Types.ObjectId.isValid(certId)) {
    return [];
  }
  const match: { certificationId: Types.ObjectId; topicId?: Types.ObjectId } = {
    certificationId: new Types.ObjectId(certId),
  };
  if (topicId !== undefined && Types.ObjectId.isValid(topicId)) {
    match.topicId = new Types.ObjectId(topicId);
  }

  const docs = await QuestionModel.aggregate<QuestionLean>([
    { $match: match },
    { $sample: { size: count } },
  ]).exec();
  return docs.map(toDto);
}

export async function upsertQuestionByExternalId(input: QuestionInput): Promise<Question> {
  const doc = await QuestionModel.findOneAndUpdate(
    { externalId: input.externalId },
    {
      $set: {
        certificationId: new Types.ObjectId(input.certificationId),
        topicId: new Types.ObjectId(input.topicId),
        externalId: input.externalId,
        prompt: input.prompt,
        choices: input.choices,
        correctChoiceIds: input.correctChoiceIds,
        explanation: input.explanation,
        sourceUrl: input.sourceUrl,
        difficulty: input.difficulty,
        tags: input.tags,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )
    .lean<QuestionLean | null>()
    .exec();

  if (doc === null) {
    throw new Error('upsertQuestionByExternalId: Mongoose returned null after upsert');
  }
  return toDto(doc);
}
