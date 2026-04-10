/**
 * Phase 1 single-user placeholder. Every per-user collection (`quizSessions`,
 * `attempts`) writes this id. When real auth lands, the only change is the
 * Fastify decorator that populates `request.userId` — every repository call
 * site stays the same.
 */
export const HARDCODED_USER_ID = 'user-phase-1';

/**
 * The two quiz lengths the product supports. Used by the wire schema and the
 * frontend's quiz config screen.
 */
export const QUIZ_LENGTHS = [25, 50] as const;
