import { defineConfig } from 'vitest/config';
import baseConfig from './vite.config';

/**
 * CI-specific Vitest configuration
 * Only runs tests critical for deployment functionality
 * Excludes development tool tests that are already validated locally
 */
export default defineConfig({
  ...baseConfig,
  test: {
    ...(baseConfig.test || {}),
    // Only include deployment-critical tests
    include: [
      // Component tests - these ensure UI functionality works in production
      'packages/theme/src/tests/components/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      
      // Configuration tests - critical for proper site behavior
      'packages/theme/src/tests/config/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      
      // Deployment tests - external service connectivity for CI environments
      'packages/theme/src/tests/deployment/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      ...(baseConfig.test?.exclude || []),
      // Exclude all development tool tests
      'packages/theme/src/tests/scripts/**',
      
      // Exclude any tests that require external services in development
      '**/vocabulary-comparison*.test.{js,ts}',
      '**/google-sheets*.test.{js,ts}',
      '**/create-vocabulary*.test.{js,ts}',
      '**/detect-language*.test.{js,ts}',
    ],
    // Faster CI execution
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      }
    },
    // More aggressive timeout for CI
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});