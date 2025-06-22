import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      // Note: @nx/dependency-checks rule temporarily disabled due to missing plugin configuration
      // TODO: Add proper @nx/eslint-plugin configuration to re-enable this rule
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
];
