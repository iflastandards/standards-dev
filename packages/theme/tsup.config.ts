import { defineConfig } from 'tsup';
import { sassPlugin, postcssModules } from 'esbuild-sass-plugin';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'components/SiteLink': 'src/components/SiteLink.tsx',
    'components/ElementReference': 'src/components/ElementReference/index.tsx',
    'hooks/usePrevious': 'src/hooks/usePrevious.ts',
    'utils/index': 'src/utils/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true, // Code splitting for better tree-shaking
  sourcemap: true,
  clean: true, // Clean output directory before build
  outDir: 'dist',
  target: 'es2020', // Or your desired target
  platform: 'browser', // 'node' or 'browser' if specific, 'neutral' for libraries
  esbuildOptions(options) {
    options.jsx = 'automatic';
    return options;
  },
  external: [
    'react',
    'react-dom',
    /^@docusaurus\/.*/,
    /^@theme\/.*/,
    'clsx',
    'prism-react-renderer',
    '@ifla/shared-config',
  ],
  esbuildPlugins: [
    // Type assertion to work around version mismatch between tsup and esbuild
    sassPlugin({ transform: postcssModules({}) }) as any,
  ],
});
