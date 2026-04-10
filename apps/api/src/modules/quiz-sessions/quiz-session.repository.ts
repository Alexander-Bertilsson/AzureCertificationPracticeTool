import {
  QuizSessionSchema,
  type CertificationId,
  type FeedbackMode,
  type PerTopicScore,
  type QuestionId,
  type QuizMode,
  type QuizScore,
  type QuizSession,
  type QuizSessionId,
  type QuizStatus,
  type TopicId,
} from '@acpt/shared';
import { Types } from 'mongoose';

import { QuizSessionModel } from './quiz-session.model.js';

interface QuizSessionLean {
  _id: Types.ObjectId;
  userId: string;
  certificationId: Types.ObjectId;
  mode: string;
  feedbackMode: string;
  topicId?: Types.ObjectId;
  length: number;
  questionIds: Types.ObjectId[];
  status: string;
  startedAt: Date;
  completedAt?: Date;
  score?: {
    correct: number;
    total: number;
    perTopic: PerTopicScore;
  };
  createdAt: Date;
  updatedAt: Date;
}

function toDto(lean: QuizSessionLean): QuizSession {
  return QuizSessionSchema.parse({
    id: lean._id.toHexString(),
    userId: lean.userId,
    certificationId: lean.certificationId.toHexString(),
    mode: lean.mode,
    feedbackMode: lean.feedbackMode,
    topicId: lean.topicId?.toHexString(),
    length: lean.length,
    questionIds: lean.questionIds.map((id) => id.toHexString()),
    status: lean.status,
    startedAt: lean.startedAt.toISOString(),
    completedAt: lean.completedAt?.toISOString(),
    score: lean.score,
    createdAt: lean.createdAt.toISOString(),
    updatedAt: lean.updatedAt.toISOString(),
  });
}

export interface CreateSessionInput {
  userId: string;
  certificationId: CertificationId;
  mode: QuizMode;
  feedbackMode: FeedbackMode;
  topicId?: TopicId;
  length: 25 | 50;
  questionIds: QuestionId[];
}

export async function createSession(input: CreateSessionInput): Promise<QuizSession> {
  const created = await QuizSessionModel.create({
    userId: input.userId,
    certificationId: new Types.ObjectId(input.certificationId),
    mode: input.mode,
    feedbackMode: input.feedbackMode,
    topicId: input.topicId !== undefined ? new Types.ObjectId(input.topicId) : undefined,
    length: input.length,
    questionIds: input.questionIds.map((id) => new Types.ObjectId(id)),
    status: 'in-progress',
    startedAt: new Date(),
  });

  const lean = await QuizSessionModel.findById(created._id).lean<QuizSessionLean | null>().exec();
  if (lean === null) {
    throw new Error('createSession: failed to read back the inserted session');
  }
  return toDto(lean);
}

export async function findSessionById(id: QuizSessionId): Promise<QuizSession | null> {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }
  const doc = await QuizSessionModel.findById(id).lean<QuizSessionLean | null>().exec();
  return doc === null ? null : toDto(doc);
}

export async function updateSessionStatus(
  id: QuizSessionId,
  status: QuizStatus,
  score?: QuizScore,
): Promise<QuizSession> {
  const update: {
    status: QuizStatus;
    completedAt?: Date;
    score?: QuizScore;
  } = { status };
  if (status === 'completed') {
    update.completedAt = new Date();
    if (score !== undefined) {
      update.score = score;
    }
  }
  const doc = await QuizSessionModel.findByIdAndUpdate(id, { $set: update }, { new: true })
    .lean<QuizSessionLean | null>()
    .exec();
  if (doc === null) {
    throw new Error(`updateSessionStatus: session ${id} not found`);
  }
  return toDto(doc);
}
