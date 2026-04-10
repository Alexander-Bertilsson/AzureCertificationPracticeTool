# ADR-0005: pnpm node-linker=hoisted for Expo + Metro compatibility

## Status

Accepted — 2026-04-10.

## Context

We chose pnpm workspaces for the monorepo because of pnpm's strict dependency layout — a package can't import anything that isn't declared in its `package.json`, which catches "phantom dependency" bugs at install time. This is a real safety win for the API.

But pnpm's strict layout uses a content-addressed store at `node_modules/.pnpm/` with symlinks into each package's `node_modules`. **Metro** (the bundler Expo uses) does not follow this layout correctly:

- When Metro resolves an `import` from inside one of Expo's own source files, it uses plain Node-style resolution (walk up `node_modules/`).
- The walk hits pnpm's `.pnpm/` virtual store and fails to find transitive dependencies that are reachable via pnpm symlinks but not via Node's default walk.
- Concrete symptom we hit: `Unable to resolve "@babel/runtime/helpers/interopRequireDefault" from "node_modules/.pnpm/expo@52.0.49_.../node_modules/expo/src/Expo.ts"`.

The API (Fastify) has no such problem — Node's built-in resolver handles pnpm's layout fine, and the bundler-shaped tools in that tree (tsc, jest, swc) also cope. The problem is Expo / Metro specifically.

## Decision

Set `node-linker=hoisted` in the root `.npmrc`:

```ini
# .npmrc (root)
auto-install-peers=true
shared-workspace-lockfile=true
link-workspace-packages=deep
node-linker=hoisted
```

This makes pnpm install a flat, npm-style `node_modules` layout for the entire workspace instead of the content-addressed `.pnpm/` layout. Metro is happy. The API is unaffected. Workspace symlinks for `@acpt/*` still work.

## Rationale

- **We can't fix Metro.** It's a vendored resolver inside React Native and Expo ships it as-is. Partial workarounds (`public-hoist-pattern`, `metro.config.js` watchFolders + nodeModulesPaths hacks) are brittle — they work until the next SDK release exposes a different transitive import.
- **The loss is smaller than it looks.** Strict-deps protection was most valuable for the API, and the API still has:
  - Strict TypeScript (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, etc.)
  - Full type-aware ESLint (`strictTypeChecked`)
  - `import/no-cycle` and import-ordering rules
  - `no-restricted-imports` rules that keep Mongoose out of non-repository files
    These catch the same class of bugs (accidental imports from packages we don't own) at build time, not install time.
- **Hoisted is a supported pnpm mode.** `node-linker=hoisted` is documented and stable. We're not hacking around pnpm; we're using its npm-compat switch.

## Tradeoffs

- **Phantom dependencies are now possible.** A package could import from a transitive dep that happens to be hoisted. The lint rules and the TS strict config catch _most_ of this, but not all.
- **Slightly larger `node_modules` on disk.** Hoisted layout uses hardlinks across the workspace so the actual disk usage is similar, but the directory tree is much larger than pnpm's `.pnpm/` layout.
- **Slower installs from scratch** compared to the default pnpm layout (roughly 1.5x longer on a cold cache).
- **Lost "it won't install if your deps lie" safety net** for library-style packages. For app-style packages (`apps/api`, `apps/web`), the build gates catch the same class of bugs.

## Alternatives considered

- **pnpm strict + Metro config hacks** (`public-hoist-pattern[]=*@babel/runtime*`, nodeModulesPaths tweaks): brittle, different failure on every Expo SDK upgrade. Rejected.
- **npm workspaces** instead of pnpm: loses pnpm's speed and workspace tooling. The hoisted mode gives us the best of both — pnpm workspace UX with npm layout.
- **Two separate package managers** (pnpm for `apps/api` + `packages/*`, npm for `apps/web`): infrastructure complexity outweighs the safety benefit. Rejected.

## Revisit if

- Metro ships native support for pnpm's strict layout (watch the `@react-native-community/cli-config-metro` and `expo/metro-config` changelogs).
- Expo or React Native adopt a different bundler (Re.Pack, Rspack, or similar) whose resolver handles pnpm correctly.
