/**
 * @ifla/preset-ifla
 * 
 * Official IFLA Docusaurus preset for standards sites.
 * Provides standardized configuration, navigation, and theme setup
 * for all IFLA standards documentation sites.
 */

import type { LoadContext } from '@docusaurus/types';
import type { IFLAPresetOptions, IFLAPresetFunction } from './types';
import { getCurrentEnv, mergeVocabularyDefaults } from './utils';
import { buildThemeConfig } from './theme';
import { getPlugins, getThemes, createWebpackConfig, createSidebarGenerator } from './plugins';

/**
 * IFLA Docusaurus Preset
 * 
 * This preset provides:
 * - Complete site configuration with cross-site navigation
 * - Vocabulary defaults for shared components 
 * - Standard theme configuration and plugins
 * - Proper customFields setup for component compatibility
 * 
 * @param context Docusaurus LoadContext
 * @param options IFLAPresetOptions
 * @returns Complete Docusaurus configuration
 */
const preset: IFLAPresetFunction = function (
  context: LoadContext,
  options: IFLAPresetOptions
) {
  const {
    siteKey,
    title,
    tagline,
    url,
    baseUrl,
    projectName = siteKey,
    env,
    vocabularyDefaults,
    // customNavbarItems, navigation, footer - DEPRECATED: ignored, use docusaurus.config.factory.ts
    editUrl,
    // additionalPlugins = [], // TODO: implement when needed
    // redirects, // TODO: implement when needed  
    overrides = {},
    customSidebarGenerator = false,
    i18n,
    webpackConfig,
    // enableIdealImage, // TODO: implement when needed
    // enableLiveCodeblock, // TODO: implement when needed
    // enableLocalSearch, // TODO: implement when needed
    enableMermaid,
    docsPluginOptions = {},
    blogPluginOptions = {},
    prismTheme,
    prismDarkTheme,
  } = options;

  // Resolve environment (still needed for navigation links)
  const resolvedEnv = env ?? getCurrentEnv();

  // Merge vocabulary defaults with user overrides
  const mergedVocabularyDefaults = mergeVocabularyDefaults(vocabularyDefaults);

  // Build base theme configuration (no navbar/footer - those are built in individual site configs)
  const themeConfig = buildThemeConfig(
    prismTheme,
    prismDarkTheme,
    enableMermaid
  );

  // Build docs plugin options
  const docsOptions = {
    sidebarPath: './sidebars.ts',
    editUrl: editUrl || `https://github.com/iflastandards/standards-dev/tree/main/`,
    showLastUpdateAuthor: docsPluginOptions.showLastUpdateAuthor ?? true,
    showLastUpdateTime: docsPluginOptions.showLastUpdateTime ?? true,
    sidebarItemsGenerator: createSidebarGenerator(customSidebarGenerator),
    versions: docsPluginOptions.versions || {
      current: {
        label: 'Latest',
      },
    },
  };

  // Build blog plugin options
  const blogOptions = {
    showReadingTime: true,
    feedOptions: {
      type: blogPluginOptions.feedOptions?.type || 'all',
      xslt: blogPluginOptions.feedOptions?.xslt ?? true,
      copyright: blogPluginOptions.feedOptions?.copyright || `Copyright © ${new Date().getFullYear()} IFLA`,
    },
    onInlineAuthors: 'ignore',
    onInlineTags: 'warn',
    onUntruncatedBlogPosts: 'ignore',
  };

  // Base configuration
  const baseConfig = {
    title,
    tagline,
    url,
    baseUrl,
    projectName,
    organizationName: 'iflastandards',
    staticDirectories: ['static', '../../packages/theme/static'],
    
    // Future flags
    future: {
      experimental_faster: false,
      experimental_storage: {
        type: 'localStorage',
        namespace: true,
      },
      experimental_router: 'browser',
    },
    
    // Error handling
    onBrokenLinks: overrides?.onBrokenLinks || 'warn',
    onBrokenAnchors: overrides?.onBrokenAnchors || 'warn',
    onBrokenMarkdownLinks: overrides?.onBrokenMarkdownLinks || 'warn',
    onDuplicateRoutes: 'warn',
    
    // Markdown configuration
    markdown: {
      format: 'mdx',
      mermaid: enableMermaid || false,
      preprocessor: ({ fileContent }: { filePath: string; fileContent: string }) => {
        return fileContent;
      },
      mdx1Compat: {
        comments: true,
        admonitions: true,
        headingIds: true,
      },
    },
    
    // i18n configuration
    i18n: i18n || {
      defaultLocale: 'en',
      locales: ['en'],
    },
  };

  // Build complete configuration
  return {
    ...baseConfig,
    presets: [
      [
        '@docusaurus/preset-classic',
        {
          docs: docsOptions,
          blog: blogOptions,
          theme: {
            customCss: './src/css/custom.css',
          },
        },
      ],
    ],
    plugins: getPlugins(options),
    themes: getThemes(options),
    themeConfig,
    customFields: {
      vocabularyDefaults: mergedVocabularyDefaults,
      elementDefaults: mergedVocabularyDefaults.elementDefaults,
      docsEnv: resolvedEnv,
    },
    ...overrides,
    // Apply webpack config if provided
    ...(webpackConfig && {
      configureWebpack: createWebpackConfig(webpackConfig),
    }),
  };
};

export default preset;

// Export helper functions for consumer use
export { getSiteConfig } from './utils';

// Export types for consumer use
export type { IFLAPresetOptions } from './types';