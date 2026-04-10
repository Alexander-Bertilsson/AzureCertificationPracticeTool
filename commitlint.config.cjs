/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allow longer subjects for scaffold/codegen commits; we already keep the
    // first line short by convention in the body.
    'header-max-length': [2, 'always', 100],
  },
};
