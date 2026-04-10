// Expo Metro config tuned for a pnpm monorepo.
// - watchFolders includes the workspace root so Metro tracks @acpt/shared changes
// - nodeModulesPaths includes both the local and root node_modules so resolution
//   walks both pnpm-strict locations
// - resolveRequest rewrites relative `.js` imports inside packages/shared/src
//   to their `.ts` source. @acpt/shared's package.json points exports at
//   ./src/index.ts (no build step), and the api consumes it via NodeNext module
//   resolution — which REQUIRES .js extensions in source even though the files
//   on disk are .ts. Metro doesn't do that rewrite, so without this hook it
//   fails to find ./schemas/index.js.
const { getDefaultConfig } = require('expo/metro-config');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');
const sharedSrcPath = path.resolve(workspaceRoot, 'packages/shared/src');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isRelativeJs =
    moduleName.endsWith('.js') && (moduleName.startsWith('./') || moduleName.startsWith('../'));

  if (isRelativeJs && context.originModulePath.startsWith(sharedSrcPath)) {
    const tsCandidate = moduleName.replace(/\.js$/, '.ts');
    const absoluteTs = path.resolve(path.dirname(context.originModulePath), tsCandidate);
    if (fs.existsSync(absoluteTs)) {
      return context.resolveRequest(context, tsCandidate, platform);
    }
  }

  return originalResolveRequest
    ? originalResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
