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
        setupFiles: ['./packages/theme/src/tests/setup.ts'],
        include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/e2e/**'],
    },
});
