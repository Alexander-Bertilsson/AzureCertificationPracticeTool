# ADR-0001: Fastify over Express for the REST API

## Status

Accepted — 2026-04-10.

## Context

The API needs a Node HTTP framework. The rest of the stack is zod-first:

- zod schemas are the contract for every request and response
- `@asteasolutions/zod-to-openapi` generates the OpenAPI spec
- Request/response types flow from the schemas into `@acpt/shared` for the frontend

The two realistic options were **Express** (most familiar, biggest ecosystem) and **Fastify** (newer, performance-oriented, first-class TypeScript).

## Decision

Use **Fastify 5** with `fastify-type-provider-zod`.

## Rationale

- **Native zod integration** via `fastify-type-provider-zod` — request/response schemas become route-level types automatically and feed straight into `@fastify/swagger`, which generates the OpenAPI document. With Express we would hand-wire validation middleware and type assertions on `req.body` / `req.params` / `req.query`.
- **One source of truth for route types, validation, and docs.** Define once in zod, get runtime validation, compile-time types, and Swagger UI for free.
- **Built-in pino logger** — Fastify's logger option takes pino config directly, so structured logging with request IDs works out of the box.
- **Async/await error handling is native** — `setErrorHandler` catches async throws without middleware gymnastics. Express needed `express-async-errors` or manual try/catch wrappers.
- **Performance** — Fastify's routing core is roughly 2x Express. Not a primary driver for this project but not a reason to pick the slower option either.

## Tradeoffs

- **Smaller ecosystem** than Express. Every piece of middleware we need has a Fastify equivalent (`@fastify/cors`, `@fastify/swagger`, etc.), but for niche things we might have to write our own wrapper. We accept that.
- **Less familiar to most Node devs.** Learning curve for future contributors. The plugin system is the main departure from Express's middleware model — worth reading the docs before adding custom behavior.
- **Fewer Stack Overflow answers.** Not a real blocker in 2026, but noted.

## Alternatives considered

- **Express + express-openapi-validator**: works but requires maintaining OpenAPI YAML by hand or running a separate zod → OpenAPI generator. Two sources of truth.
- **Hono**: impressive performance and DX, but the Node + MongoDB story is less proven than Fastify's, and we don't need edge-runtime portability.
- **NestJS**: full framework with DI, controllers, decorators. Overkill for the API surface we need and pulls in a heavy set of concepts.
