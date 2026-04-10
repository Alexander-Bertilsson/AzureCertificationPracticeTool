import {
  AttemptSchema,
  type Attempt,
  type CertificationId,
  type ChoiceId,
  type QuestionId,
  type QuizSessionId,
  type TopicId,
} from '@acpt/shared';
import { Types } from 'mongoose';

import { AttemptModel } from './attempt.model.js';

interface AttemptLean {
  _id: Types.ObjectId;
  userId: string;
  quizSessionId: Types.ObjectId;
  certificationId: Types.ObjectId;
  topicId: Types.ObjectId;
  questionId: Types.ObjectId;
  selectedChoiceIds: string[];
  isCorrect: boolean;
  answeredAt: Date;
}

function toDto(lean: AttemptLean): Attempt {
  return AttemptSchema.parse({
    id: lean._id.toHexString(),
    userId: lean.userId,
    quizSessionId: lean.quizSessionId.toHexString(),
    certificationId: lean.certificationId.toHexString(),
    topicId: lean.topicId.toHexString(),
    questionId: lean.questionId.toHexString(),
    selectedChoiceIds: lean.selectedChoiceIds,
    isCorrect: lean.isCorrect,
    answeredAt: lean.answeredAt.toISOString(),
  });
}

export interface CreateAttemptInput {
  userId: string;
  quizSessionId: QuizSessionId;
  certificationId: CertificationId;
  topicId: TopicId;
  questionId: QuestionId;
  selectedChoiceIds: ChoiceId[];
  isCorrect: boolean;
}

export async function createAttempt(input: CreateAttemptInput): Promise<Attempt> {
  const created = await AttemptModel.create({
    userId: input.userId,
    quizSessionId: new Types.ObjectId(input.quizSessionId),
    certificationId: new Types.ObjectId(input.certificationId),
    topicId: new Types.ObjectId(input.topicId),
    questionId: new Types.ObjectId(input.questionId),
    selectedChoiceIds: input.selectedChoiceIds,
    isCorrect: input.isCorrect,
    answeredAt: new Date(),
  });

  const lean = await AttemptModel.findById(created._id).lean<AttemptLean | null>().exec();
  if (lean === null) {
    throw new Error('createAttempt: failed to read back the inserted attempt');
  }
  return toDto(lean);
}

export async function findAttemptsBySession(
  userId: string,
  sessionId: QuizSessionId,
): Promise<Attempt[]> {
  if (!Types.ObjectId.isValid(sessionId)) {
    return [];
  }
  const docs = await AttemptModel.find({
    userId,
    quizSessionId: new Types.ObjectId(sessionId),
  })
    .sort({ answeredAt: 1 })
    .lean<AttemptLean[]>()
    .exec();
  return docs.map(toDto);
}
