// Expo Metro config tuned for a pnpm monorepo.
// - watchFolders includes the workspace root so Metro tracks @acpt/shared changes
// - nodeModulesPaths includes both the local and root node_modules so resolution
//   walks both pnpm-strict locations
const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
