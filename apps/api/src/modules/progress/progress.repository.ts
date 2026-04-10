import { type CertificationId, type RecentSessionSummary, type TopicAccuracy } from '@acpt/shared';
import { Types } from 'mongoose';

import { AttemptModel } from '../quiz-sessions/attempt.model.js';
import { QuizSessionModel } from '../quiz-sessions/quiz-session.model.js';

/**
 * Aggregate this user's attempts for one certification, grouped by topic.
 * Joins to the `topics` collection so the response includes the topic slug
 * and title (the dashboard shows them as labels).
 *
 * The aggregation runs on the (userId, certificationId, topicId, answeredAt)
 * index defined in attempt.model.ts.
 */
export async function aggregateAttemptsByTopic(
  userId: string,
  certId: CertificationId,
): Promise<TopicAccuracy[]> {
  if (!Types.ObjectId.isValid(certId)) {
    return [];
  }
  interface AggregateRow {
    _id: Types.ObjectId;
    correct: number;
    total: number;
    topic: { slug: string; title: string };
  }

  const rows = await AttemptModel.aggregate<AggregateRow>([
    { $match: { userId, certificationId: new Types.ObjectId(certId) } },
    {
      $group: {
        _id: '$topicId',
        correct: { $sum: { $cond: ['$isCorrect', 1, 0] } },
        total: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'topics',
        localField: '_id',
        foreignField: '_id',
        as: 'topic',
      },
    },
    { $unwind: '$topic' },
    {
      $project: {
        _id: 1,
        correct: 1,
        total: 1,
        topic: { slug: '$topic.slug', title: '$topic.title' },
      },
    },
  ]).exec();

  return rows.map((row) => ({
    topicId: row._id.toHexString() as TopicAccuracy['topicId'],
    topicSlug: row.topic.slug,
    topicTitle: row.topic.title,
    correct: row.correct,
    total: row.total,
    accuracy: row.total === 0 ? 0 : row.correct / row.total,
  }));
}

/**
 * Total attempts and correct count across the user's entire history for
 * one certification, regardless of topic.
 */
export async function countAttemptsForCertification(
  userId: string,
  certId: CertificationId,
): Promise<{ total: number; correct: number }> {
  if (!Types.ObjectId.isValid(certId)) {
    return { total: 0, correct: 0 };
  }
  interface CountRow {
    _id: null;
    total: number;
    correct: number;
  }

  const rows = await AttemptModel.aggregate<CountRow>([
    { $match: { userId, certificationId: new Types.ObjectId(certId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        correct: { $sum: { $cond: ['$isCorrect', 1, 0] } },
      },
    },
  ]).exec();

  const row = rows[0];
  if (row === undefined) {
    return { total: 0, correct: 0 };
  }
  return { total: row.total, correct: row.correct };
}

/**
 * The N most-recently started quiz sessions for this user + certification.
 * Includes in-progress and completed sessions; the score field is only
 * populated on completed ones.
 */
export async function findRecentSessions(
  userId: string,
  certId: CertificationId,
  limit: number,
): Promise<RecentSessionSummary[]> {
  if (!Types.ObjectId.isValid(certId)) {
    return [];
  }

  interface SessionLean {
    _id: Types.ObjectId;
    startedAt: Date;
    completedAt?: Date;
    status: string;
    length: number;
    score?: {
      correct: number;
      total: number;
      perTopic: Record<string, { correct: number; total: number }>;
    };
  }

  const docs = await QuizSessionModel.find({
    userId,
    certificationId: new Types.ObjectId(certId),
  })
    .sort({ startedAt: -1 })
    .limit(limit)
    .lean<SessionLean[]>()
    .exec();

  return docs.map((doc) => ({
    sessionId: doc._id.toHexString() as RecentSessionSummary['sessionId'],
    startedAt: doc.startedAt.toISOString(),
    ...(doc.completedAt !== undefined ? { completedAt: doc.completedAt.toISOString() } : {}),
    status: doc.status as RecentSessionSummary['status'],
    length: doc.length,
    ...(doc.score !== undefined ? { score: doc.score } : {}),
  }));
}
