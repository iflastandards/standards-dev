import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type { SidebarItemsGeneratorArgs, NormalizedSidebarItem } from '@docusaurus/plugin-content-docs/lib/sidebars/types';
import { type SiteKey, type DocsEnv } from './siteConfigCore';
import { getSiteDocusaurusConfig, getSiteUrl } from './siteConfig';
import { getCurrentEnv } from './siteConfig.server';
import {
  sharedPlugins,
  sharedThemes,
  baseDocusaurusConfig,
  standardsDropdown,
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
 * Creates a customized standards dropdown that can hide the current site
 */
function createCustomStandardsDropdown(currentEnv: DocsEnv, currentSiteKey: SiteKey, position: 'left' | 'right' = 'left', hideCurrentSite: boolean = false) {
  const allItems = [
    { label: 'Portal Home', href: getSiteUrl('portal', '/', currentEnv), siteKey: 'portal' },
    { label: 'ISBD', href: getSiteUrl('isbd', '/', currentEnv), siteKey: 'isbd' },
    { label: 'LRM', href: getSiteUrl('LRM', '/', currentEnv), siteKey: 'LRM' },
    { label: 'UNIMARC', href: getSiteUrl('unimarc', '/', currentEnv), siteKey: 'unimarc' },
    { label: 'ISBDM', href: getSiteUrl('ISBDM', '/', currentEnv), siteKey: 'ISBDM' },
    { label: 'FRBR', href: getSiteUrl('fr', '/', currentEnv), siteKey: 'fr' },
    { label: 'Muldicat', href: getSiteUrl('muldicat', '/', currentEnv), siteKey: 'muldicat' },
  ];

  const items = hideCurrentSite
    ? allItems.filter(item => item.siteKey !== currentSiteKey)
    : allItems;

  return {
    type: 'dropdown',
    label: 'Standards',
    position,
    items: items.map(({ siteKey, ...item }) => item), // Remove siteKey from final items
  };
}

/**
 * Creates a customized footer resources section
 */
function createCustomFooterResources(currentEnv: DocsEnv, additionalLinks: Array<{ label: string; href: string }> = []) {
  return [
    {
      label: 'RDF Downloads',
      href: './rdf/',
    },
    {
      label: 'Sitemap',
      to: '/sitemap',
    },
    ...additionalLinks,
  ];
}

/**
 * Creates a standardized Docusaurus configuration for IFLA standards sites
 */
export function createStandardSiteConfig(options: StandardSiteOptions): Config {
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
  
  const currentEnv: DocsEnv = getCurrentEnv();
  const currentSiteConfig = getSiteDocusaurusConfig(siteKey, currentEnv);
  const portalUrl = getSiteUrl('portal', '/', currentEnv);
  
  // Get vocabulary defaults for this site type
  const defaultVocabulary = VOCABULARY_DEFAULTS[siteKey as keyof typeof VOCABULARY_DEFAULTS] || VOCABULARY_DEFAULTS.GENERIC;
  const mergedVocabularyDefaults = {
    ...defaultVocabulary,
    ...vocabularyDefaults
  };
  
  // Build navbar items based on configuration
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

  // Add custom navbar items (if any)
  if (navbar?.items) {
    navbarItems.push(...navbar.items);
  }

  // Add standards dropdown (customizable position and content)
  navbarItems.push(
    createCustomStandardsDropdown(
      currentEnv,
      siteKey,
      standardsDropdownPosition,
      hideCurrentSiteFromStandardsDropdown
    )
  );

  // Add resources dropdown (if enabled)
  if (includeResourcesDropdown) {
    navbarItems.push({
      label: 'Resources',
      position: 'right',
      type: 'dropdown',
      items: [
        {
          label: 'RDF Downloads',
          href: './rdf/',
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

  
  // Standard plugins with optional redirects
  const plugins = [
    ...sharedPlugins,
    ...additionalPlugins,
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
  
  const config: Config = {
    ...baseDocusaurusConfig(currentEnv),
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
      ...i18n,
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
    themes: sharedThemes,

    // Site-specific theme config with shared elements
    themeConfig: useResourcesInsteadOfSites ? {
      // For sites using custom resources, build theme config from scratch to avoid contamination
      ...sharedThemeConfig,

      // Site-specific docs config
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
        versionPersistence: 'localStorage',
      },

      // Site-specific navbar
      navbar: {
        ...sharedThemeConfig.navbar,
        title,
        items: navbarItems,
      },

      // Custom footer with resources
      footer: {
        ...sharedThemeConfig.footer,
        links: [
          {
            title: 'Resources',
            items: createCustomFooterResources(currentEnv, additionalResourceLinks),
          },
          // Add the static footer sections (Community, More) from sharedThemeConfig
          ...sharedThemeConfig.footer.links,
        ],
      },
    } : {
      // For sites using standard footer, use base config
      ...(baseDocusaurusConfig(currentEnv).themeConfig as any),

      // Site-specific docs config
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
        versionPersistence: 'localStorage',
      },

      // Site-specific navbar
      navbar: {
        ...(baseDocusaurusConfig(currentEnv).themeConfig as any)?.navbar,
        title,
        items: navbarItems,
      },
    } satisfies Preset.ThemeConfig,
  };

  return config;
}
