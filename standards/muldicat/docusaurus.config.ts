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
  getSiteConfigMap,
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
const siteKey: SiteKey = 'muldicat';
const siteConfig = getSiteConfig(siteKey, currentEnv);

// Site metadata that was previously in .env files
const SITE_TITLE = 'MulDiCat';
const SITE_TAGLINE = 'Multilingual Dictionary of Cataloguing Terms and Concepts';
const GITHUB_REPO_URL = 'https://github.com/iflastandards/standards-dev';
const GITHUB_EDIT_URL = 'https://github.com/iflastandards/muldicat/tree/main/';

// Vocabulary configuration
const VOCABULARY_PREFIX = 'ifla';
const VOCABULARY_NUMBER_PREFIX = 'T';
const VOCABULARY_PROFILE = 'vocabulary-profile.csv';
const VOCABULARY_ELEMENT_URI = 'https://www.iflastandards.info/elements';
const VOCABULARY_ELEMENT_PROFILE = 'elements-profile.csv';

const config: Config = deepmerge(
  createBaseConfig({
    title: SITE_TITLE,
    tagline: SITE_TAGLINE,
    url: siteConfig.url,
    baseUrl: siteConfig.baseUrl,
    projectName: 'muldicat',
  }),
  {
    // Add future config block for compliance with regression tests
    future: {
      experimental_faster: false,
      v4: true,
    },

    // Shared static directories for standards sites
    staticDirectories: createStaticDirectories('standard'),

    customFields: {
      // Site configurations for all sites in current environment (SSG-compatible)
      siteConfigs: getSiteConfigMap(currentEnv),
      // MulDiCat-specific vocabulary configuration using factory
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
          indexBlog: true, // MulDiCat has a blog
          language: ['en'],
        },
        // imageConfig defaults are now environment-aware in the factory
      }),
    ],

    themeConfig: deepmerge(
      createThemeConfig({
        navbarTitle: 'MulDiCat',
        navbarItems: createStandardsNavbar({
          title: 'MulDiCat',
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
        // MulDiCat-specific theme overrides
        metadata: [
          { name: 'keywords', content: 'ifla, library, standards, multilingual, dictionary, cataloguing, terms, concepts' },
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
