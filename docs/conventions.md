# Coding Conventions

These are picked once and not re-litigated. ESLint enforces what it can; the rest is convention. If you want to change one of these, open an ADR — don't just deviate in a PR.

## Naming

- **Files**: `kebab-case.ts` everywhere, **except** files exporting a single React component → match the component name (`QuestionCard.tsx`). Expo Router files follow Expo's conventions (`[id].tsx`, `_layout.tsx`).
- **Types / interfaces / classes**: `PascalCase`. Type names never end in `Type`, never start with `I` (no `IUser`).
- **Variables / functions**: `camelCase`. Booleans prefixed with `is` / `has` / `can` / `should`.
- **True constants**: `SCREAMING_SNAKE_CASE` only when frozen at module load and exported (e.g. `HARDCODED_USER_ID`, `QUIZ_LENGTHS`). Locals stay `camelCase` even if `const`.
- **Test files**: `*.test.ts` (not `.spec.`).
- **Mongoose**: collection names plural (`certifications`), Mongoose model names singular PascalCase (`Certification`).

## Type system

- **`type` over `interface`** by default. `interface` only when declaration merging is needed (Fastify request augmentation).
- **No `any`**. Use `unknown` and narrow.
- **No type assertions (`as`)** except: `as const` for literals, inside zod parsing helpers, or at well-documented FFI boundaries.
- **Type imports** must use `import type` (lint-enforced).
- **Inferred zod types are the source of truth** for shared types: `export type Certification = z.infer<typeof CertificationSchema>;`.
- **Branded ID types** for every entity: `type CertificationId = string & { __brand: 'CertificationId' }`. zod schemas use `.brand<'CertificationId'>()`. Catches mixed-up IDs at compile time.

## Module layout

- **Named exports only** — no `export default`. **Exception**: Expo Router files require default exports; lint allows it for `apps/web/app/**`.
- **No barrel files inside apps**. `index.ts` re-exports allowed only at the `packages/shared` boundary and per-domain schema barrels.
- **One entity per file**: one Mongoose model, one zod schema group, one React component.
- **Co-located unit tests** in `__tests__/` next to source. API integration tests in `apps/api/test/integration/`.

## API conventions

- **REST**: plural nouns, no verbs in paths. Verbs go in HTTP methods.
- **HTTP status codes**: 200 GET, 201 POST creates (with `Location` header), 204 no content, 400 validation, 401 unauthorized, 403 forbidden, 404 not found, 409 conflict, 422 semantic validation, 500 unexpected.
- **Error envelope** (single shape, validated by zod, documented in OpenAPI):
  ```ts
  { error: { code: string; message: string; details?: unknown; requestId: string } }
  ```
- **Dates**: stored as Mongo `Date`, transported as ISO 8601 strings. zod schemas use `.datetime()` and parse to `Date`.
- **IDs in responses**: ObjectId hex strings (branded), never raw `ObjectId` objects.
- **Pagination** (when needed later): cursor-based, response envelope `{ items, nextCursor }`. No offset pagination.
- **Request ID**: every request gets a UUID via Fastify's `genReqId`, threaded into pino logs and the error envelope.

## Error handling — strong opinions

- **Throw exceptions, but never use errors for flow control.** A thrown error means "the contract was violated"; it is not a return value. Concretely:
  - `repository.findById(id)` returns `Cert | null` — does _not_ throw `NotFoundError` just because the row was missing. The caller decides whether absence is an error.
  - `service.requireCertification(id)` is allowed to throw `NotFoundError`, because the name makes the contract explicit.
  - "Is this slug taken?" returns `boolean`, not throws.
  - Validation failures from zod throw at the boundary (the controller's parser), not deeper.
- **Custom error classes** all inherit from `AppError` with `code: string` and `httpStatus: number`. The global error hook maps them to the JSON envelope.
- **Throw early at the layer that detects the violation.** Controllers do not try/catch — the global handler catches.
- **Never swallow.** If you catch, you re-throw or log-and-translate.
- **`useUnknownInCatchVariables: true`** is on, so `catch (e: unknown)` requires narrowing.
- **Never map an unknown error to a generic 500 without logging the original** at `error` level with the request ID.

## Async

- **Always `await`**. No `.then()` chains. ESLint `no-floating-promises: error`.
- **`Promise.all` for parallel independent work**, sequential awaits for ordered work.
- **No `async` constructors or `async` getters.** Use factory functions.

## Testing

- **AAA pattern** (Arrange-Act-Assert) with blank lines between sections.
- **Test names**: sentence-style — `it('returns the cert when slug exists', …)`. No "should" prefix.
- **Test the public API**, not internal helpers. If it's hard to test through the public surface, refactor — don't export internals just to test them.
- **No snapshot tests.** They drift, nobody reads them, and they break for cosmetic reasons. Use explicit assertions.
- **Object-mother factories** for test data: `makeCertification({ slug: 'az-104' })`. Factories live in `__tests__/factories/`.
- **Mongoose tests use `mongodb-memory-server`** — never a mock. The repository layer is integration-tested against a real (in-memory) Mongo.
- **Coverage thresholds are a floor, not a goal.** 100% coverage of trivial code is a smell.

## Mongoose ↔ zod relationship

There are _two_ schemas per entity, with different jobs:

- **zod schema** in `@acpt/shared` is the contract for the wire — validates requests/responses, generates OpenAPI, gives the frontend its types.
- **Mongoose schema** in `apps/api/src/modules/<x>/<x>.model.ts` is the persistence schema — defines indexes, DB-level validation, Mongo options.
- The **repository** calls `.lean()` on every query (returning POJOs, not Mongoose Documents) and runs the result through the zod schema to get a typed branded DTO. Mongoose Documents never escape the repository layer.

## Logging

- **pino structured logs only.** No `console.log` (lint-enforced).
- **Levels**: `trace` (verbose dev only), `debug` (dev troubleshooting), `info` (request lifecycle, business events), `warn` (recoverable problems), `error` (errors with stack traces), `fatal` (process about to exit).
- **Every log line includes the request ID** when in a request context. Fastify's logger handles this automatically via `request.log`.

## Frontend state

- **TanStack Query for all server state.** No Redux, no Zustand, no Context for server data.
- **`useState` / `useReducer` for local UI state.**
- **Theme tokens for styling values.** Prefer `theme.spacing[4]` over hardcoded magic numbers like `style={{ marginTop: 17 }}`. Convention, not lint-enforced — there will be exceptions where a one-off value is genuinely the right answer.

## Git

- **Conventional Commits** (commitlint-enforced).
- **Branch naming**: `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, `test/` prefix + slug.
- **PRs are small**: aim for < 400 lines diff. Scaffold / codegen-heavy commits can be larger but are called out in the PR description.
- **No force-push to `main`.** Force-push to feature branches is fine.
- **Squash-merge to `main`** so history stays linear.

## Documentation

- **README per package** with: purpose, scripts, env vars, gotchas. Nothing more.
- **JSDoc only on exported functions in `@acpt/shared`** — that's the public API surface. Inside apps, code should be self-documenting; comments explain _why_ something non-obvious is the way it is, never _what_ it does.
- **ADRs (Architecture Decision Records)** in `docs/adr/` for decisions worth justifying later. Tiny markdown files, ~1 page each. Numbered: `ADR-0001-fastify.md`.
