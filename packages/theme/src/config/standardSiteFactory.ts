import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type { SidebarItemsGeneratorArgs, NormalizedSidebarItem } from '@docusaurus/plugin-content-docs/lib/sidebars/types';
import { type SiteKey, type DocsEnv } from './siteConfigCore';
import { getSiteDocusaurusConfig, getSiteUrl } from './siteConfig';
import { getCurrentEnv } from './siteConfig.server';
import {
  sharedPlugins,
  sharedThemes,
  sharedThemeConfig
} from './docusaurus';
import { VOCABULARY_DEFAULTS } from './docusaurus.base';

// Create a custom type that includes the undocumented `defaultSidebarItemsGenerator`
type CustomSidebarItemsGeneratorArgs = SidebarItemsGeneratorArgs & {
  defaultSidebarItemsGenerator: (args: SidebarItemsGeneratorArgs) => Promise<NormalizedSidebarItem[]> | NormalizedSidebarItem[];
};

export interface StandardSiteOptions {
  siteKey: SiteKey;
  title: string;
  tagline: string;
  projectName?: string;

  // Vocabulary configuration
  vocabularyDefaults?: {
    prefix?: string;
    startCounter?: number;
    uriStyle?: "numeric" | "kebab-case";
    numberPrefix?: string;
    caseStyle?: "kebab-case" | "camelCase";
    showFilter?: boolean;
    filterPlaceholder?: string;
    showTitle?: boolean;
    showURIs?: boolean;
    showCSVErrors?: boolean;
    profile?: string;
    profileShapeId?: string;
    RDF?: Record<string, any>;
    elementDefaults?: {
      uri?: string;
      classPrefix?: string;
      propertyPrefix?: string;
      profile?: string;
      profileShapeId?: string;
    };
  };

  // i18n configuration
  i18n?: {
    defaultLocale?: string;
    locales?: string[];
    localeConfigs?: Record<string, { label: string }>;
  };

  // GitHub configuration
  editUrl?: string;

  // Navbar configuration
  navbar?: {
    items?: any[];
  };

  // Navigation customization
  navigation?: {
    hideCurrentSiteFromStandardsDropdown?: boolean;
    standardsDropdownPosition?: 'left' | 'right';
    includeResourcesDropdown?: boolean;
    includeDocumentationItem?: boolean;
  };

  // Footer customization
  footer?: {
    useResourcesInsteadOfSites?: boolean;
    additionalResourceLinks?: Array<{
      label: string;
      href: string;
    }>;
  };

  // Additional plugins
  additionalPlugins?: any[];

  // Custom redirects
  redirects?: {
    redirects?: any[];
    createRedirects?: (existingPath: string) => string[] | undefined;
  };

  // Override settings
  overrides?: {
    onBrokenLinks?: 'ignore' | 'warn' | 'throw';
    onBrokenAnchors?: 'ignore' | 'warn' | 'throw';
    trailingSlash?: boolean;
  };

  // Custom sidebar generator
  customSidebarGenerator?: boolean;
}

/**
 * Creates a factory function that generates site configuration with proper isolation.
 * This ensures that each site gets its own configuration object without any shared references.
 */
function createConfigurationFactory() {
  /**
   * Creates fresh navigation items for each site to prevent contamination
   */
  function createFreshStandardsDropdown(currentEnv: DocsEnv, currentSiteKey: SiteKey, position: 'left' | 'right' = 'left', hideCurrentSite: boolean = false) {
    const allItems = [
      { label: 'Portal Home', href: getSiteUrl('portal', '/', currentEnv), siteKey: 'portal' },
      { label: 'ISBD', href: getSiteUrl('isbd', '/', currentEnv), siteKey: 'isbd' },
      { label: 'LRM', href: getSiteUrl('LRM', '/', currentEnv), siteKey: 'LRM' },
      { label: 'UNIMARC', href: getSiteUrl('unimarc', '/', currentEnv), siteKey: 'unimarc' },
      { label: 'ISBDM', href: getSiteUrl('ISBDM', '/', currentEnv), siteKey: 'ISBDM' },
      { label: 'FR Family', href: getSiteUrl('FRBR', '/', currentEnv), siteKey: 'FR' }, // FR family of models
      { label: 'Muldicat', href: getSiteUrl('muldicat', '/', currentEnv), siteKey: 'muldicat' },
    ];

    const items = hideCurrentSite
      ? allItems.filter(item => item.siteKey !== currentSiteKey)
      : allItems;

    return {
      type: 'dropdown',
      label: 'Standards',
      position,
      items: items.map(({ siteKey: _siteKey, ...item }) => item), // Remove siteKey from final items
    };
  }

  /**
   * Creates fresh footer resources section
   */
  function createFreshFooterResources(currentEnv: DocsEnv, additionalLinks: Array<{ label: string; href: string }> = []) {
    return [
      {
        label: 'RDF Downloads',
        to: '/rdf/', // Changed from href to 'to' for internal link
      },
      {
        label: 'Sitemap',
        to: '/sitemap',
      },
      ...additionalLinks.map(link => ({ ...link })), // Create fresh copies
    ];
  }

  /**
   * Creates fresh footer site links
   */
  function createFreshFooterSiteLinks(currentEnv: DocsEnv) {
    return [
      {
        label: 'Homepage',
        href: getSiteUrl('portal', '/', currentEnv),
      },
      {
        label: 'ISBD',
        href: getSiteUrl('isbd', '/', currentEnv),
      },
      {
        label: 'LRM',
        href: getSiteUrl('LRM', '/', currentEnv),
      },
      {
        label: 'UNIMARC',
        href: getSiteUrl('unimarc', '/', currentEnv),
      },
      { label: 'ISBDM', href: getSiteUrl('ISBDM', '/', currentEnv) },
      { label: 'FR Family', href: getSiteUrl('FRBR', '/', currentEnv) }, // FR family of models
      { label: 'Muldicat', href: getSiteUrl('muldicat', '/', currentEnv) },
    ];
  }

  /**
   * The main factory function that creates a fresh configuration for each site
   */
  return function createStandardSiteConfig(options: StandardSiteOptions): Config {
    const {
      siteKey,
      title,
      tagline,
      projectName = siteKey,
      vocabularyDefaults,
      i18n,
      editUrl,
      navbar,
      navigation = {},
      footer = {},
      additionalPlugins = [],
      redirects,
      overrides = {},
      customSidebarGenerator = false
    } = options;

    // Navigation defaults
    const {
      hideCurrentSiteFromStandardsDropdown = false,
      standardsDropdownPosition = 'left',
      includeResourcesDropdown = true,
      includeDocumentationItem = true
    } = navigation;

    // Footer defaults
    const {
      useResourcesInsteadOfSites = false,
      additionalResourceLinks = []
    } = footer;

    // Get current environment and site configuration
    const currentEnv: DocsEnv = getCurrentEnv();
    const currentSiteConfig = getSiteDocusaurusConfig(siteKey, currentEnv);
    const portalUrl = getSiteUrl('portal', '/', currentEnv);

    // Get vocabulary defaults for this site type - create a fresh copy
    const defaultVocabulary = VOCABULARY_DEFAULTS[siteKey as keyof typeof VOCABULARY_DEFAULTS] || VOCABULARY_DEFAULTS.GENERIC;
    const mergedVocabularyDefaults = {
      ...defaultVocabulary,
      ...(vocabularyDefaults || {})
    };

    // Build navbar items from scratch for each site
    const navbarItems: any[] = [];

    // Add default Documentation item (if enabled)
    if (includeDocumentationItem) {
      navbarItems.push({
        type: 'doc',
        position: 'left',
        docId: 'index',
        label: 'Documentation',
      });
    }

    // Add custom navbar items (if any) - create fresh copies
    if (navbar?.items) {
      navbarItems.push(...navbar.items.map(item => ({ ...item })));
    }

    // Add standards dropdown with fresh configuration
    navbarItems.push(
      createFreshStandardsDropdown(
        currentEnv,
        siteKey,
        standardsDropdownPosition,
        hideCurrentSiteFromStandardsDropdown
      )
    );

    // Add resources dropdown (if enabled) with fresh items
    if (includeResourcesDropdown) {
      navbarItems.push({
        label: 'Resources',
        position: 'right',
        type: 'dropdown',
        items: [
          {
            label: 'RDF Downloads',
            to: '/rdf/', // Changed from href to 'to' for internal link
          },
          {
            label: 'Vocabulary Server',
            href: 'https://iflastandards.info/',
          },
          {
            label: 'IFLA Website',
            href: 'https://www.ifla.org/',
          },
          {
            label: 'GitHub Repository',
            href: 'https://github.com/iflastandards/standards-dev',
            'aria-label': 'GitHub repository',
          },
          {
            label: 'Portal',
            href: portalUrl,
          },
        ],
      });
    }

    // Add standard right-side items
    navbarItems.push(
      { to: '/blog', label: 'Blog', position: 'right' },
      {
        type: 'docsVersionDropdown',
        position: 'right',
      },
      {
        type: 'localeDropdown',
        position: 'right',
      },
      {
        type: 'search',
        position: 'right',
      }
    );

    // Create fresh plugins array
    const plugins = [
      ...sharedPlugins.map(plugin => Array.isArray(plugin) ? [...plugin] : plugin),
      ...additionalPlugins.map(plugin => Array.isArray(plugin) ? [...plugin] : plugin),
    ];

    if (redirects) {
      plugins.push([
        '@docusaurus/plugin-client-redirects',
        {
          redirects: redirects.redirects || [],
          createRedirects: redirects.createRedirects || (() => undefined),
        },
      ]);
    }

    // Default sidebar generator that filters index.mdx files
    const defaultSidebarItemsGenerator = async (generatorArgs: SidebarItemsGeneratorArgs) => {
      const { defaultSidebarItemsGenerator, ...args } = generatorArgs as CustomSidebarItemsGeneratorArgs;
      const sidebarItems: NormalizedSidebarItem[] = await defaultSidebarItemsGenerator(args);

      function filterIndexMdx(items: NormalizedSidebarItem[]): NormalizedSidebarItem[] {
        return items
          .filter((item: NormalizedSidebarItem) => {
            if (item.type === 'doc') {
              const docId = item.id || (item as any).docId || '';
              if (docId === 'index' ||
                docId.endsWith('/index') ||
                docId.split('/').pop() === 'index') {
                return false;
              }
            }
            return true;
          })
          .map((item: NormalizedSidebarItem) => {
            if (item.type === 'category' && item.items) {
              return {
                ...item,
                items: filterIndexMdx(item.items as NormalizedSidebarItem[]),
              };
            }
            return item;
          });
      }

      return filterIndexMdx(sidebarItems);
    };

    // Create fresh theme configuration
    const themeConfig = {
      // Copy shared theme config properties
      prism: { ...sharedThemeConfig.prism },
      tableOfContents: { ...sharedThemeConfig.tableOfContents },
      colorMode: {
        defaultMode: 'light' as 'light' | 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      image: sharedThemeConfig.image,
      announcementBar: { ...sharedThemeConfig.announcementBar },

      // Site-specific docs config
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
        versionPersistence: 'localStorage',
      },

      // Site-specific navbar with fresh configuration
      navbar: {
        logo: { ...sharedThemeConfig.navbar.logo },
        title,
        items: navbarItems,
      },

      // Site-specific footer with fresh configuration
      footer: {
        style: 'dark',
        links: useResourcesInsteadOfSites ? [
          {
            title: 'Resources',
            items: createFreshFooterResources(currentEnv, additionalResourceLinks),
          },
          {
            title: 'Community',
            items: [
              {
                label: 'IFLA Website',
                href: 'https://www.ifla.org/',
              },
              {
                label: 'IFLA Standards',
                href: 'https://www.ifla.org/programmes/ifla-standards/',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/iflastandards/standards-dev',
              },
            ],
          },
        ] : [
          {
            title: 'Sites',
            items: createFreshFooterSiteLinks(currentEnv),
          },
          {
            title: 'Community',
            items: [
              {
                label: 'IFLA Website',
                href: 'https://www.ifla.org/',
              },
              {
                label: 'IFLA Standards',
                href: 'https://www.ifla.org/programmes/ifla-standards/',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/iflastandards/standards-dev',
              },
            ],
          },
        ],
        copyright: sharedThemeConfig.footer.copyright,
      },
    } satisfies Preset.ThemeConfig;

    // Create the final configuration object
    const config: Config = {
      // Base settings
      future: {
        experimental_faster: false,
        v4: true,
      },
      favicon: 'img/favicon.ico',
      organizationName: 'iflastandards',
      trailingSlash: false,
      onBrokenLinks: 'warn',
      onBrokenMarkdownLinks: 'warn',
      onBrokenAnchors: 'warn',
      onDuplicateRoutes: 'warn',
      markdown: {
        mermaid: true,
      },
      staticDirectories: ['static', '../../packages/theme/static'],

      // Site-specific configuration
      url: currentSiteConfig.url,
      title,
      tagline,
      baseUrl: currentSiteConfig.baseUrl,
      projectName,

      // Apply overrides
      ...overrides,

      customFields: {
        vocabularyDefaults: mergedVocabularyDefaults,
      },

      // Site-specific i18n
      i18n: {
        defaultLocale: 'en',
        locales: ['en'],
        localeConfigs: {
          en: {
            label: 'English',
          },
        },
        // Explicitly disable locale detection to prevent 'fr' site from being treated as French locale
        path: 'i18n',
        ...(i18n || {}),
      },

      plugins,

      // Site-specific presets
      presets: [
        [
          'classic',
          {
            docs: {
              sidebarPath: './sidebars.ts',
              editUrl: editUrl || `https://github.com/iflastandards/${siteKey}/tree/main/`,
              showLastUpdateAuthor: true,
              showLastUpdateTime: true,
              versions: {
                current: {
                  label: 'Latest',
                  path: '',
                },
              },
              lastVersion: 'current',
              onlyIncludeVersions: ['current'],
              ...(customSidebarGenerator ? {} : { sidebarItemsGenerator: defaultSidebarItemsGenerator }),
            },
            blog: {
              showReadingTime: true,
              feedOptions: {
                type: ['rss', 'atom'],
                xslt: true,
              },
              editUrl: editUrl || `https://github.com/iflastandards/${siteKey}/tree/main/`,
              onInlineTags: 'warn',
              onInlineAuthors: 'warn',
              onUntruncatedBlogPosts: 'warn',
            },
            theme: {
              customCss: './src/css/custom.css',
            },
          } satisfies Preset.Options,
        ],
      ],

      // Shared themes
      themes: sharedThemes.map(theme => Array.isArray(theme) ? [...theme] : theme),

      themeConfig,
    };

    return config;
  };
}

// Export the factory function
export const createStandardSiteConfig = createConfigurationFactory();
