/**
 * Theme configuration builder for IFLA preset
 */

import { themes as prismThemes } from 'prism-react-renderer';

// NOTE: All navbar/footer building functions removed - they should only exist in site configs
// All navbar/footer building must happen in docusaurus.config or docusaurus.config.factory
// to prevent caching contamination between sites

/**
 * Build complete theme configuration
 * NOTE: This only provides base theme config - navbar/footer are built in site configs
 */
export function buildThemeConfig(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prismTheme?: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prismDarkTheme?: any,
  enableMermaid?: boolean = false
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const themeConfig: any = {
    // Color mode configuration
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },

    // Docs configuration
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
      versionPersistence: 'localStorage',
    },

    // Table of contents
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 5,
    },

    // Social card
    image: 'img/docusaurus-social-card.jpg',

    // Announcement bar
    announcementBar: {
      id: 'support_us',
      content: '⭐️ This is an active development site for IFLA standards ⭐️',
      backgroundColor: '#fafbfc',
      textColor: '#091E42',
      isCloseable: false,
    },

    // Prism configuration for code highlighting
    prism: {
      theme: prismTheme || prismThemes.github,
      darkTheme: prismDarkTheme || prismThemes.dracula,
      additionalLanguages: ['bash', 'diff', 'json', 'turtle'],
    },

    // NOTE: navbar and footer are intentionally NOT built here to prevent caching contamination
    // They should be built dynamically in individual site configs using SiteConfigBuilder
    // navbar: undefined, // Let sites define their own
    // footer: undefined, // Let sites define their own
  };

  // Add mermaid configuration if enabled
  if (enableMermaid) {
    themeConfig.mermaid = {
      theme: { light: 'default', dark: 'dark' },
      options: {
        maxTextSize: 50000,
      },
    };
  }

  return themeConfig;
}

/**
 * Build complete theme configuration with provided navbar and footer
 * This is used when sites provide their own pre-built navbar/footer
 */
export function buildThemeConfigWithProvided(
  title: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navbar?: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  footerConfig?: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prismTheme?: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prismDarkTheme?: any,
  enableMermaid?: boolean = false
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const baseConfig = buildThemeConfig(prismTheme, prismDarkTheme, enableMermaid);
  
  return {
    ...baseConfig,
    ...(navbar && { navbar }),
    ...(footerConfig && { footer: footerConfig }),
  };
}