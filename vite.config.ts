// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths'; // Import the plugin
import { resolve } from 'path';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        tsconfigPaths() // Add the plugin here
    ],
    cacheDir: './.vitest-cache',
    resolve: {
        alias: {
            '@docusaurus/Link': resolve(__dirname, 'packages/theme/src/tests/__mocks__/DocusaurusLinkMock.tsx'),
            '@docusaurus/useBaseUrl': resolve(__dirname, 'packages/theme/src/tests/__mocks__/useBaseUrl.ts'),
            '@docusaurus/useDocusaurusContext': path.resolve(__dirname, 'packages/theme/src/tests/__mocks__/useDocusaurusContext.ts'),
            '@docusaurus/theme-common': path.resolve(__dirname, 'packages/theme/src/tests/__mocks__/theme-common.ts'),
            '@theme/Tabs': path.resolve(__dirname, 'packages/theme/src/tests/__mocks__/tabs.tsx'),
            '@theme/TabItem': path.resolve(__dirname, 'packages/theme/src/tests/__mocks__/TabItem.tsx'),
            '@theme/CodeBlock': path.resolve(__dirname, 'packages/theme/src/tests/__mocks__/CodeBlock.tsx'),
            '@theme/Heading': path.resolve(__dirname, 'packages/theme/src/tests/__mocks__/Heading.tsx'),
            '@ifla/theme': path.resolve(__dirname, 'packages/theme/src'),
       },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: [path.resolve(__dirname, 'packages/theme/src/tests/setup.ts')],
        include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/e2e/**', '**/tests/visual-regression.spec.ts'],
        // Enhanced CI stability and performance
        testTimeout: process.env.CI ? 60000 : 30000,
        hookTimeout: process.env.CI ? 30000 : 10000,
        maxConcurrency: process.env.CI ? 1 : 5,
        pool: 'threads', // Better than forks for CI performance
        poolOptions: {
            threads: { 
                singleThread: !!process.env.CI,
                isolate: true
            }
        },
        retry: process.env.CI ? 2 : 0,
        logHeapUsage: !!process.env.CI,
        // Enhanced reporting
        reporters: [
            'default',
            ['json', { outputFile: 'test-results/vitest-results.json' }],
            ['junit', { outputFile: 'test-results/vitest-junit.xml' }]
        ],
        // Coverage configuration with thresholds
        coverage: {
            reporter: ['text', 'json-summary', 'html', 'lcov'],
            reportsDirectory: './coverage',
            exclude: [
                '**/node_modules/**',
                '**/dist/**',
                '**/build/**',
                '**/e2e/**',
                '**/*.config.*',
                '**/tests/**',
                '**/__tests__/**',
                '**/__mocks__/**'
            ],
            thresholds: {
                global: {
                    branches: 75,
                    functions: 75,
                    lines: 80,
                    statements: 80
                }
            }
        }
    },
});
