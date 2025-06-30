import { defineConfig } from 'tsup';
import { sassPlugin, postcssModules } from 'esbuild-sass-plugin';
import type { Plugin } from 'esbuild';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'components/SiteLink': 'src/components/SiteLink.tsx',
    'components/ElementReference': 'src/components/ElementReference/index.tsx',
    'hooks/usePrevious': 'src/hooks/usePrevious.ts',
    'utils/index': 'src/utils/index.ts',
    'config/index': 'src/config/index.ts',
    'config/siteConfig': 'src/config/siteConfig.ts',
  },
  format: ['esm', 'cjs'],
  // Disable built-in DTS generation due to TypeScript project conflicts
  dts: false,
  splitting: true, // Enable code splitting for better optimization
  sourcemap: true,
  clean: true, // Clean output directory before build
  outDir: 'dist',
  target: 'es2020', // Or your desired target
  platform: 'neutral', // Use neutral to avoid bundling platform-specific modules
  esbuildOptions(options) {
    options.jsx = 'automatic';
    options.treeShaking = true;
    options.minify = true;
    return options;
  },
  external: [
    'react',
    'react-dom',
    /^@docusaurus\/.*/,
    /^@theme\/.*/,
    'clsx',
    'prism-react-renderer',
  ],
  esbuildPlugins: [
    // Properly type the sass plugin
    sassPlugin({ transform: postcssModules({}) }) as Plugin,
  ],
});
