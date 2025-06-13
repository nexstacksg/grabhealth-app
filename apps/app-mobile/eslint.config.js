// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    rules: {
      // Enforce single quotes (as warning to match Prettier)
      quotes: ['warn', 'single', { avoidEscape: true }],
      // Warn on unused variables
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-unused-vars': 'warn',
    },
  },
]);
