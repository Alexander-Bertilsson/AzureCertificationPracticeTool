#!/usr/bin/env node
// Launcher for `expo start --web` that disables @expo/cli's filesystem
// response cache.
//
// Why: @expo/cli caches the bundled-native-modules API response in
// ~/.expo/native-modules-cache, but serializes the original Cloudflare
// `content-encoding: br` header alongside the already-decoded body. On cache
// replay, undici's Response wrapper ends up in an unusable state and
// @expo/cli crashes during startup with `TypeError: Body is unusable`
// (somewhere in `getNativeModuleVersionsAsync`). Setting EXPO_NO_CACHE
// bypasses the broken FileSystemResponseCache entirely — the version check
// is a single small HTTP call, so skipping the cache is a no-op for dev UX.
//
// This launcher is cross-platform: setting the env var via a shell prefix
// (`EXPO_NO_CACHE=1 expo start --web`) doesn't work in Windows cmd.exe, so
// we set it in-process before spawning Expo.

'use strict';

process.env.EXPO_NO_CACHE = '1';

const { spawn } = require('node:child_process');

const child = spawn('expo', ['start', '--web', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
