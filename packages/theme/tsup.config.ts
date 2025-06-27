import { defineConfig } from 'tsup';
import { sassPlugin, postcssModules } from 'esbuild-sass-plugin';

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
  dts: true,
  splitting: false, // Disable code splitting to avoid bundling issues
  sourcemap: true,
  clean: true, // Clean output directory before build
  outDir: 'dist',
  target: 'es2020', // Or your desired target
  platform: 'neutral', // Use neutral to avoid bundling platform-specific modules
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
  ],
  esbuildPlugins: [
    // Type assertion to work around version mismatch between tsup and esbuild
    sassPlugin({ transform: postcssModules({}) }) as any,
  ],
});
