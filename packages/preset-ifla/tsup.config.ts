import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true, // Generate .d.ts files
  sourcemap: true,
  clean: true, // Clean output directory before build
  outDir: 'dist',
  target: 'es2020',
  platform: 'node', // Presets run in Node.js environment
  external: [
    // External dependencies that should not be bundled
    'react',
    'react-dom',
    /^@docusaurus\/.*/,
    /^@ifla\/.*/,
    'docusaurus-plugin-sass',
    'prism-react-renderer',
  ],
});