import type { PluginConfigOptions } from './types';

/**
 * Factory function to create plugin configuration
 * This is a pure function that returns a consistent plugin configuration
 */
export function createPluginConfig(options: PluginConfigOptions) {
  const { docsPath = './docs', editUrl, showReadingTime = true, customCss = './src/css/custom.css' } = options;
  
  return {
    docs: {
      path: docsPath,
      sidebarPath: './sidebars.ts',
      editUrl,
      remarkPlugins: [],
    },
    blog: showReadingTime ? {
      showReadingTime: true,
      editUrl,
    } : false,
    theme: {
      customCss,
    },
  };
}