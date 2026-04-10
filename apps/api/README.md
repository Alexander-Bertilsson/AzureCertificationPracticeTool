# @acpt/api

REST API for the Azure Certification Practice Tool. Built with Fastify, Mongoose, and zod.

## Scripts

| Script               | Description                                               |
| -------------------- | --------------------------------------------------------- |
| `pnpm dev`           | Start the api in watch mode via `tsx`.                    |
| `pnpm build`         | Compile to `dist/` via `tsc -b`.                          |
| `pnpm typecheck`     | Type-check without emit.                                  |
| `pnpm lint`          | ESLint flat config (Node preset).                         |
| `pnpm test`          | Run Jest unit + integration tests.                        |
| `pnpm test:coverage` | Same with `--coverage`.                                   |
| `pnpm seed`          | Run the content seed script against the configured Mongo. |

## Environment

Copy `.env.example` to `.env.local` (gitignored) and adjust:

```
NODE_ENV=development
HOST=0.0.0.0
PORT=3000
MONGO_URL=mongodb://localhost:27017/azure-cert-practice
CORS_ORIGIN=http://localhost:8081
LOG_LEVEL=info
```

`env.ts` validates `process.env` with zod at startup; the process exits if any required value is missing or malformed.

## Architecture

- **Controllers** (`*.controller.ts`): thin HTTP layer. Parse params, call service, format response.
- **Services** (`*.service.ts`): business logic. Compose repositories. No HTTP types, no Mongoose.
- **Repositories** (`*.repository.ts`): the only files that import Mongoose models. Return plain objects.
- **Errors**: throw `AppError` subclasses; the global handler maps them to the standard JSON envelope.
- **Logging**: pino structured logs only. `pino-pretty` in dev, JSON in production.
