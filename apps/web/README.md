# @acpt/web

Expo (managed) web + native app for the Azure Certification Practice Tool.

Web is the primary target during phase 1 (`pnpm web`). Native iOS/Android builds are available later via `pnpm android` / `pnpm ios` once EAS is configured.

## Scripts

| Script               | Description                                                       |
| -------------------- | ----------------------------------------------------------------- |
| `pnpm web`           | Start the Expo dev server with the web target.                    |
| `pnpm start`         | Start the Expo dev server (Metro) — picks platform interactively. |
| `pnpm typecheck`     | Type-check via `tsc -b --noEmit`.                                 |
| `pnpm lint`          | ESLint flat config (React Native preset).                         |
| `pnpm test`          | Run Jest with the `jest-expo` preset.                             |
| `pnpm test:coverage` | Same with `--coverage`.                                           |

## Environment

Copy `.env.example` to `.env.local` (gitignored) and adjust:

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
```

Only variables prefixed with `EXPO_PUBLIC_` are exposed to client code.

## Monorepo notes

- `metro.config.js` adds the workspace root as a `watchFolder` and includes both `apps/web/node_modules` and the root `node_modules` in `nodeModulesPaths`. This is the standard pnpm + Expo setup.
- `disableHierarchicalLookup: true` keeps Metro from walking outside our explicit paths and confusing pnpm-strict layouts.
- `@acpt/shared` is consumed via `workspace:*` and resolved through the Metro config above — no extra build step.
