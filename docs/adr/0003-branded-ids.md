# ADR-0003: Branded types for entity IDs

## Status

Accepted — 2026-04-10.

## Context

Our domain has several entity types with string-shaped IDs: `Certification`, `Topic`, `WikiArticle`, `Question`, `QuizSession`, `Attempt`. All of them are serialized as MongoDB ObjectId hex strings on the wire.

If every ID type is just `string`, nothing stops us from passing a `TopicId` where a `CertificationId` is expected:

```ts
async function getQuestionsForTopic(topicId: string) { ... }

// Silent bug — passes the cert ID but the function expected a topic ID:
await getQuestionsForTopic(cert.id);
```

TypeScript can't catch this because both are `string`. Tests might catch it eventually, but the error message ("no questions found") is misleading and the debugging loop is expensive.

## Decision

Every entity ID in `@acpt/shared` is a **branded type**:

```ts
// packages/shared/src/schemas/certification.ts
export const CertificationIdSchema = z.string().brand<'CertificationId'>();
export type CertificationId = z.infer<typeof CertificationIdSchema>;
```

The same pattern for `TopicId`, `WikiArticleId`, `QuestionId`, `QuizSessionId`, `AttemptId`.

Functions that take IDs use the branded type in their signature:

```ts
async function getQuestionsForTopic(topicId: TopicId): Promise<Question[]> { ... }

// Compile error — cert.id is CertificationId, not TopicId:
await getQuestionsForTopic(cert.id); // ERROR
```

The brand lives purely at the type level — at runtime, the value is still a plain string. No overhead, no wire-format changes.

## Rationale

- **Catches a real bug class.** Cross-entity ID mix-ups are a common source of "mysterious empty result" bugs in CRUD APIs. Branding makes them compile errors.
- **Free at runtime.** zod's `.brand()` is a type-system-only operation. No code runs.
- **Consistent with the rest of our strict TypeScript posture.** We enabled `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and `useUnknownInCatchVariables` for the same reason: surface more bugs at compile time.

## Tradeoffs

- **Minor ergonomic cost.** In tests and factories, you construct IDs via the schema (`CertificationIdSchema.parse(objectId.toHexString())`) or via a small helper, not via a raw string literal. The helper lives in `__tests__/factories/` and is a one-liner.
- **Third-party functions that take `string` still work** — TypeScript structurally unbrands on assignment to `string`, so passing a `CertificationId` to `console.log` or `JSON.stringify` is fine.
- **Readers unfamiliar with the pattern** may initially wonder where `CertificationId` comes from. Documented here and in the conventions file.

## Implementation notes

- **Brand at the schema layer, not at the type layer.** We use `z.string().brand<'X'>()` rather than a hand-rolled `type X = string & { __brand: 'X' }`. Keeps validation and type in sync automatically.
- **Repositories are the conversion boundary.** Mongo ObjectIds come in as `ObjectId` instances and leave the repository as branded strings via `.toHexString()` + the schema.
- **The API `userId` stays unbranded** for now because there's only one hardcoded user. When real auth lands and there are actual user records, we'll brand `UserId` too.
