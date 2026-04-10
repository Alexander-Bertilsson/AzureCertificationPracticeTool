import type { CertificationId, ProgressResponse } from '@acpt/shared';

import { requireCertification } from '../certifications/certification.service.js';

import {
  aggregateAttemptsByTopic,
  countAttemptsForCertification,
  findRecentSessions,
} from './progress.repository.js';

const RECENT_SESSIONS_LIMIT = 10;

/**
 * Build the progress dashboard payload for one certification:
 *   - overall accuracy (across all attempts ever)
 *   - per-topic accuracy, sorted weakest first (lowest accuracy at index 0)
 *   - the N most recent quiz sessions
 *
 * Validates the cert exists first so a bogus certId yields a clean 404
 * instead of returning all-zeros silently.
 */
export async function getProgressForCertification(
  userId: string,
  certId: CertificationId,
): Promise<ProgressResponse> {
  await requireCertification(certId);

  const [{ total, correct }, perTopicRaw, recentSessions] = await Promise.all([
    countAttemptsForCertification(userId, certId),
    aggregateAttemptsByTopic(userId, certId),
    findRecentSessions(userId, certId, RECENT_SESSIONS_LIMIT),
  ]);

  // Sort weakest topic first. When two topics have identical accuracy, the
  // one with more total attempts comes first (more confident weakness signal).
  const perTopic = [...perTopicRaw].sort((a, b) => {
    if (a.accuracy !== b.accuracy) {
      return a.accuracy - b.accuracy;
    }
    return b.total - a.total;
  });

  return {
    certificationId: certId,
    totalAttempts: total,
    totalCorrect: correct,
    overallAccuracy: total === 0 ? 0 : correct / total,
    perTopic,
    recentSessions,
  };
}
