/**
 * Plugin configuration for the IFLA preset
 */

import type { Plugin } from '@docusaurus/types';
import type { IFLAPresetOptions } from './types';

/**
 * Create webpack configuration for Node.js polyfills
 */
export function createWebpackConfig(webpackConfig?: IFLAPresetOptions['webpackConfig']) {
  return function configureWebpack(config: any, isServer: boolean, utils: any) {
    // Apply custom webpack config if provided
    if (webpackConfig) {
      return webpackConfig(config, isServer, utils);
    }

    // Default webpack configuration for Node.js polyfills
    return {
      resolve: {
        fallback: {
          fs: false,
          path: 'path-browserify',
          crypto: 'crypto-browserify',
          stream: 'stream-browserify',
          util: 'util',
          child_process: false,
          os: 'os-browserify/browser',
        },
        alias: {
          // Disable problematic module that causes build issues
          '../../../config/lang': false,
        },
      },
      ignoreWarnings: [
        // Suppress specific warnings
        /Failed to parse source map/,
        /require\.resolve/,
      ],
    };
  };
}

/**
 * Create sidebar generator that filters out index.mdx files
 */
export function createSidebarGenerator(customSidebarGenerator?: boolean) {
  if (customSidebarGenerator) {
    // User wants to use their own sidebar generator
    return undefined;
  }

  // Default sidebar generator that filters out index.mdx
  return async function sidebarItemsGenerator({
    defaultSidebarItemsGenerator,
    ...args
  }: any) {
    const sidebarItems = await defaultSidebarItemsGenerator(args);

    // Helper function to recursively filter out index.mdx files
    function filterIndexFiles(items: any[]): any[] {
      return items
        .filter((item) => {
          // Filter out direct index.mdx references
          if (item.type === 'doc' && item.id?.endsWith('/index')) {
            return false;
          }
          return true;
        })
        .map((item) => {
          // Recursively filter categories
          if (item.type === 'category' && item.items) {
            return {
              ...item,
              items: filterIndexFiles(item.items),
            };
          }
          return item;
        })
        .filter((item) => {
          // Remove empty categories
          if (item.type === 'category' && item.items?.length === 0) {
            return false;
          }
          return true;
        });
    }

    return filterIndexFiles(sidebarItems);
  };
}

/**
 * Configure redirect plugin
 */
export function configureRedirectPlugin(
  redirects?: IFLAPresetOptions['redirects']
): Plugin | null {
  if (!redirects || (!redirects.redirects?.length && !redirects.createRedirects)) {
    return null;
  }

  return [
    '@docusaurus/plugin-client-redirects',
    {
      redirects: redirects.redirects || [],
      createRedirects: redirects.createRedirects,
    },
  ];
}

/**
 * Configure ideal image plugin
 */
export function configureIdealImagePlugin(
  enableIdealImage?: boolean
): Plugin | null {
  if (!enableIdealImage) {
    return null;
  }

  return '@docusaurus/plugin-ideal-image';
}

/**
 * Configure local search plugin
 */
export function configureLocalSearchPlugin(
  enableLocalSearch?: boolean
): Plugin | null {
  if (!enableLocalSearch) {
    return null;
  }

  return [
    '@easyops-cn/docusaurus-search-local',
    {
      hashed: true,
      language: ['en'],
      docsRouteBasePath: '/docs',
      blogRouteBasePath: '/blog',
      docsDir: 'docs',
      blogDir: 'blog',
      removeDefaultStopWordFilter: false,
      removeDefaultStemmer: false,
      highlightSearchTermsOnTargetPage: true,
      searchResultLimits: 8,
      searchResultContextMaxLength: 50,
      translations: {
        search_placeholder: 'Search',
        see_all_results: 'See all results',
        no_results: 'No results.',
        search_results_for: 'Search results for "{{ keyword }}"',
        search_the_documentation: 'Search the documentation',
        count_documents_found: '{{ count }} document found',
        count_documents_found_plural: '{{ count }} documents found',
        no_documents_were_found: 'No documents were found',
      },
    },
  ];
}

/**
 * Configure live codeblock theme
 */
export function configureLiveCodeblockTheme(
  enableLiveCodeblock?: boolean
): string | null {
  if (!enableLiveCodeblock) {
    return null;
  }

  return '@docusaurus/theme-live-codeblock';
}

/**
 * Configure mermaid theme
 */
export function configureMermaidTheme(
  enableMermaid?: boolean
): string | null {
  if (!enableMermaid) {
    return null;
  }

  return '@docusaurus/theme-mermaid';
}

/**
 * Get all configured plugins
 */
export function getPlugins(options: IFLAPresetOptions): Plugin[] {
  const plugins: Plugin[] = [
    'docusaurus-plugin-sass',
    ...options.additionalPlugins || [],
  ];

  // Add redirect plugin if configured
  const redirectPlugin = configureRedirectPlugin(options.redirects);
  if (redirectPlugin) {
    plugins.push(redirectPlugin);
  }

  // Add ideal image plugin if enabled
  const idealImagePlugin = configureIdealImagePlugin(options.enableIdealImage);
  if (idealImagePlugin) {
    plugins.push(idealImagePlugin);
  }

  // Add local search plugin if enabled
  const localSearchPlugin = configureLocalSearchPlugin(options.enableLocalSearch);
  if (localSearchPlugin) {
    plugins.push(localSearchPlugin);
  }

  return plugins;
}

/**
 * Get all configured themes
 */
export function getThemes(options: IFLAPresetOptions): string[] {
  const themes: string[] = [];

  // Add live codeblock theme if enabled
  const liveCodeblockTheme = configureLiveCodeblockTheme(options.enableLiveCodeblock);
  if (liveCodeblockTheme) {
    themes.push(liveCodeblockTheme);
  }

  // Add mermaid theme if enabled
  const mermaidTheme = configureMermaidTheme(options.enableMermaid);
  if (mermaidTheme) {
    themes.push(mermaidTheme);
  }

  return themes;
}