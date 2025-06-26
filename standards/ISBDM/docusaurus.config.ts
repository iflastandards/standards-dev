import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type { SidebarItemsGeneratorArgs, NormalizedSidebarItem } from '@docusaurus/plugin-content-docs/lib/sidebars/types';
import { deepmerge } from 'deepmerge-ts';
import { 
  createBaseConfig, 
  createThemeConfig, 
  createIFLAPlugins, 
  createStandardsPresetConfig,
  createStandardsFooter,
  createVocabularyConfig,
  createStaticDirectories,
  createStandardsNavbar,
  getSiteConfigMap,
  SITE_CONFIG,
  type SiteKey,
  type Environment,
  type SiteConfigEntry
} from '@ifla/shared-config';
import navbarItems from './navbar';

// Create a custom type that includes the undocumented `defaultSidebarItemsGenerator`
type CustomSidebarItemsGeneratorArgs = SidebarItemsGeneratorArgs & {
  defaultSidebarItemsGenerator: (args: SidebarItemsGeneratorArgs) => Promise<NormalizedSidebarItem[]> | NormalizedSidebarItem[];
};

// Determine environment from DOCS_ENV
const docsEnv = process.env['DOCS_ENV'];
if (!docsEnv) {
  throw new Error(
    `❌ FATAL: DOCS_ENV environment variable is required but not set.\n` +
    `✅ Valid values: local, preview, development, production\n` +
    `💡 NX builds should load DOCS_ENV from root .env file automatically.\n` +
    `💡 CI/production workflows must set DOCS_ENV explicitly.`
  );
}

// Get configuration for this site
const currentEnv = docsEnv as Environment;
const siteKey: SiteKey = 'ISBDM';

// Local function to retrieve site config directly from the complete array
function getLocalSiteConfig(site: SiteKey, env: Environment): SiteConfigEntry {
  const config = SITE_CONFIG[site]?.[env];
  if (!config) {
    throw new Error(`Configuration missing for ${site} in ${env}`);
  }
  // Return a new object to avoid shared references
  return { ...config };
}

// Use the local function to get configuration
const siteConfig = getLocalSiteConfig(siteKey, currentEnv);

// Site metadata that was previously in .env files
const SITE_TITLE = 'ISBD for Manifestation';
const SITE_TAGLINE = 'International Standard Bibliographic Description for Manifestation';
const GITHUB_REPO_URL = 'https://github.com/iflastandards/standards-dev';
const GITHUB_EDIT_URL = 'https://github.com/iflastandards/ISBDM/tree/main/';

// Vocabulary configuration
const VOCABULARY_PREFIX = 'isbdm';
const VOCABULARY_NUMBER_PREFIX = 'T';
const VOCABULARY_PROFILE = 'isbdm-values-profile-revised.csv';
const VOCABULARY_ELEMENT_URI = 'https://www.iflastandards.info/ISBDM/elements';
const VOCABULARY_ELEMENT_PROFILE = 'isbdm-elements-profile.csv';

// Custom sidebar generator for ISBDM
const isbdmSidebarGenerator = async (generatorArgs: SidebarItemsGeneratorArgs) => {
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

const config: Config = deepmerge(
  createBaseConfig({
    title: SITE_TITLE,
    tagline: SITE_TAGLINE,
    url: siteConfig.url,
    baseUrl: siteConfig.baseUrl,
    projectName: 'ISBDM',
  }),
  {
    // ISBDM-specific overrides
    onBrokenLinks: 'ignore' as const, // ISBDM-specific: ignore generated element links
    onBrokenAnchors: 'ignore' as const, // ISBDM-specific: ignore generated anchor links

    // Add future config block for compliance with regression tests
    future: {
      v4: true,
    },

    // Shared static directories for standards sites
    staticDirectories: createStaticDirectories('standard'),

    customFields: {
      // Site configurations for all sites in current environment (SSG-compatible)
      siteConfigs: getSiteConfigMap(currentEnv),
      // ISBDM-specific vocabulary configuration using factory
      vocabularyDefaults: createVocabularyConfig({
        prefix: VOCABULARY_PREFIX,
        numberPrefix: VOCABULARY_NUMBER_PREFIX,
        profile: VOCABULARY_PROFILE,
        elementUri: VOCABULARY_ELEMENT_URI,
        elementProfile: VOCABULARY_ELEMENT_PROFILE,
      }),
    },

    presets: [
      [
        'classic',
        createStandardsPresetConfig({
          editUrl: GITHUB_EDIT_URL,
          enableBlog: true,
          sidebarItemsGenerator: isbdmSidebarGenerator,
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        }),
      ],
    ],

    plugins: [
      // IFLA standard plugins
      ...createIFLAPlugins({
        environment: currentEnv, // Pass environment for pure function
        enableLocalSearch: true,
        searchConfig: {
          indexBlog: true, // ISBDM has a blog
          language: ['en'],
        },
        // imageConfig defaults are now environment-aware in the factory
      }),

      // ISBDM-specific plugins
      [
        '@docusaurus/plugin-client-redirects',
        {
          redirects: [],
          createRedirects: (existingPath: string) => {
            // Only process element paths - be very specific to avoid interfering with other routes
            // This regex specifically matches element paths with numeric IDs only
            const elementMatch = existingPath.match(/^\/docs\/(attributes|statements|notes|relationships)\/(\d+)$/);
            if (elementMatch) {
              const elementId = elementMatch[2];
              // Only create redirect if it's a valid numeric element ID
              if (/^\d+$/.test(elementId)) {
                return [`/docs/elements/${elementId}`];
              }
            }
            // Don't redirect anything else - this prevents interference with other routes
            return undefined;
          },
        },
      ],
    ],

    themeConfig: deepmerge(
      createThemeConfig({
        navbarTitle: 'ISBDM',
        navbarItems: createStandardsNavbar({
          title: 'ISBDM',
          customItems: navbarItems,
          includeBlog: true,
          includeVersionDropdown: true,
          includeLocaleDropdown: true,
          includeSearch: true,
        }),
        footerLinks: createStandardsFooter({
          githubUrl: GITHUB_REPO_URL,
          includeRdfDownloads: true,
          includeSitemap: true,
          includeBlog: true,
        }).links,
        copyright: createStandardsFooter({
          githubUrl: GITHUB_REPO_URL,
        }).copyright,
      }),
      {
        // ISBDM-specific theme overrides
        metadata: [
          { name: 'keywords', content: 'ifla, library, standards, isbd, manifestation, cataloging' },
        ],
        tableOfContents: {
          minHeadingLevel: 2,
          maxHeadingLevel: 6,
        },
      } satisfies Partial<Preset.ThemeConfig>,
    ),
  }
);

export default config;
