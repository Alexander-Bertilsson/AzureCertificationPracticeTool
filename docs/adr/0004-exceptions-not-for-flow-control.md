# ADR-0004: Throw exceptions, never use errors for flow control

## Status

Accepted — 2026-04-10.

## Context

There's a long-running debate in the JS / TS community about error handling:

1. **Exceptions everywhere** — anything that can fail throws, callers catch what they care about. Idiomatic Node.
2. **Result types** — functions return `Result<Ok, Err>` (or a discriminated union), callers pattern-match. Idiomatic Rust. Popular in fp-ts / Effect ecosystems.

We had to pick one for the API.

## Decision

**Throw exceptions for contract violations, but never use exceptions as flow control.** Return values (`T | null`, `boolean`, discriminated unions) handle expected outcomes; exceptions handle unexpected ones.

Concretely:

| Operation                                      | Returns                           | Why                                                                   |
| ---------------------------------------------- | --------------------------------- | --------------------------------------------------------------------- |
| `repository.findById(id)`                      | `T \| null`                       | Absence is a valid outcome the caller may want to handle              |
| `service.requireCertification(id)`             | `T` (throws `NotFoundError`)      | The name `require*` asserts presence; absence is a contract violation |
| `service.isSlugTaken(slug)`                    | `boolean`                         | It's a yes/no question, not an error                                  |
| `controller` validating a zod body             | throws `ZodError` at the boundary | Malformed request is a contract violation from the client             |
| Unknown runtime failure (Mongo down, bad JSON) | throws                            | Truly unexpected                                                      |

**Controllers do not try/catch.** A single Fastify global error handler (`errorHandler` in `apps/api/src/common/middleware/error-handler.ts`) catches everything, maps `AppError` subclasses and `ZodError` to the standard JSON envelope, and logs unknown errors at `error` level with the request ID.

## Rationale

- **Exceptions are idiomatic in the Node / Fastify / Mongoose ecosystem.** Every library we depend on throws. Wrapping every call in a Result adapter is friction we'd pay on every file.
- **"Never use errors for flow control" is the key discipline.** It stops the most common anti-pattern: throwing `NotFoundError` from a repository because it's "one fewer `if (!x)` at the call site". That pattern pollutes stack traces, makes call sites non-obvious, and turns every query into a branching point for the catch machinery.
- **Naming encodes the contract.** `findById` is explicitly nullable. `requireById` is explicitly throwing. Call sites read cleanly, and the author's intent is visible in the function name.
- **Type safety is preserved.** With `useUnknownInCatchVariables: true`, `catch (e)` types `e` as `unknown` — we narrow via `instanceof AppError` or `instanceof ZodError` before touching it.

## Tradeoffs

- **Callers can forget to handle `null`.** `findById` returns `T | null`, and a careless caller who uses `.name` on the result gets a runtime TypeError. Mitigated by `strictNullChecks` — TypeScript forces the null check.
- **Exceptions break function purity.** A linter can't tell you which functions throw. We accept that.
- **Cross-cutting logging requires discipline.** Since controllers don't catch, the global handler is the single log site. We set `req.log.error({ err, requestId })` there for any non-`AppError` — if we ever need structured logging at a finer grain, we'll add it per-module.

## Alternatives considered

- **Full Result types everywhere** — rejected. The boilerplate cost across every repository and service method is large, fights Mongoose (which throws), and most future contributors will be unfamiliar with the pattern.
- **Result on the frontend, exceptions on the backend** — reasonable; considered. Not adopted for phase 1 — our frontend's TanStack Query already normalizes thrown errors via `onError` / `error` states, so a Result wrapper would be redundant. Leaving the door open if a future frontend interaction demands exhaustive error matching.
- **No error handling philosophy, case by case** — the default if you don't decide. Guaranteed to produce inconsistency. Rejected.

## Related

- `docs/conventions.md` — Error handling section.
- `apps/api/src/common/errors/app-error.ts` — `AppError` base class.
- `apps/api/src/common/middleware/error-handler.ts` — global handler.
