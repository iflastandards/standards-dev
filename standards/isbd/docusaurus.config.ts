import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
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
  getSiteConfig,
  type SiteKey,
  type Environment
} from '@ifla/shared-config';
import navbarItems from './navbar';

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
const siteKey: SiteKey = 'isbd';
const siteConfig = getSiteConfig(siteKey, currentEnv);

// Site metadata that was previously in .env files
const SITE_TITLE = 'ISBD: International Standard Bibliographic Description';
const SITE_TAGLINE = 'Consolidated Edition';
const GITHUB_REPO_URL = 'https://github.com/iflastandards/standards-dev';
const GITHUB_EDIT_URL = 'https://github.com/iflastandards/standards-dev/tree/main/standards/isbd/';

// Vocabulary configuration
const VOCABULARY_PREFIX = 'isbd';
const VOCABULARY_NUMBER_PREFIX = 'T';
const VOCABULARY_PROFILE = 'isbd-values-profile.csv';
const VOCABULARY_ELEMENT_URI = 'https://www.iflastandards.info/ISBD/elements';
const VOCABULARY_ELEMENT_PROFILE = 'isbd-elements-profile.csv';

const config: Config = deepmerge(
  createBaseConfig({
    title: SITE_TITLE,
    tagline: SITE_TAGLINE,
    url: siteConfig.url,
    baseUrl: siteConfig.baseUrl,
    projectName: 'isbd',
  }),
  {
    // isbd-specific overrides
    onBrokenLinks: 'warn' as const,
    onBrokenMarkdownLinks: 'warn' as const,
    onBrokenAnchors: 'warn' as const,
    onDuplicateRoutes: 'warn' as const,

    // Add future config block for compliance with regression tests
    future: {
      experimental_faster: false,
      v4: true,
    },

    // Shared static directories for standards sites
    staticDirectories: createStaticDirectories('standard'),

    customFields: {
      // Function to get site config for any site in current environment
      siteConfig: (toSiteKey: SiteKey) => getSiteConfig(toSiteKey, currentEnv),
      // isbd-specific vocabulary configuration
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
          indexBlog: true, // isbd has a blog
          language: ['en'],
        },
        // imageConfig defaults are now environment-aware in the factory
      }),
    ],

    themeConfig: deepmerge(
      createThemeConfig({
        navbarTitle: 'ISBD',
        navbarItems: createStandardsNavbar({
          title: 'ISBD',
          customItems: [
            {
              type: 'doc',
              position: 'left',
              docId: 'intro',
              label: 'Introduction',
            },
            ...navbarItems,
          ],
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
        // isbd-specific theme overrides
        metadata: [
          { name: 'keywords', content: 'ifla, library, standards, isbd, bibliographic description, cataloging' },
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
