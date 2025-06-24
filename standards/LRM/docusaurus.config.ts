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
const siteKey: SiteKey = 'LRM';
const siteConfig = getSiteConfig(siteKey, currentEnv);

// Site metadata that was previously in .env files
const SITE_TITLE = 'IFLA LRM';
const SITE_TAGLINE = 'Library Reference Model';
const GITHUB_REPO_URL = 'https://github.com/iflastandards/standards-dev';
const GITHUB_EDIT_URL = 'https://github.com/iflastandards/LRM/tree/main/';

// Vocabulary configuration
const VOCABULARY_PREFIX = 'lrm';
const VOCABULARY_NUMBER_PREFIX = 'E';
const VOCABULARY_URI_STYLE = 'numeric';
const VOCABULARY_PROFILE = 'lrm-profile-revised.csv';
const VOCABULARY_RDF_LABEL_EN = ['http://www.w3.org/2000/01/rdf-schema#label', 'http://www.w3.org/2004/02/skos/core#prefLabel'];
const VOCABULARY_RDF_COMMENT_EN = ['http://www.w3.org/2000/01/rdf-schema#comment'];

const config: Config = deepmerge(
  createBaseConfig({
    title: SITE_TITLE,
    tagline: SITE_TAGLINE,
    url: siteConfig.url,
    baseUrl: siteConfig.baseUrl,
    projectName: 'LRM',
  }),
  {
    // LRM-specific overrides
    onBrokenLinks: 'warn' as const, // LRM uses default warn setting

    // Add future config block for compliance with regression tests
    future: {
      experimental_faster: false,
      v4: true,
    },

    // Shared static directories for all standards sites
    staticDirectories: createStaticDirectories('standard'),

    customFields: {
      // Function to get site config for any site in current environment
      siteConfig: (toSiteKey: SiteKey) => getSiteConfig(toSiteKey, currentEnv),
      // LRM-specific vocabulary configuration
      vocabularyDefaults: createVocabularyConfig({
        prefix: VOCABULARY_PREFIX,
        numberPrefix: VOCABULARY_NUMBER_PREFIX,
        uriStyle: VOCABULARY_URI_STYLE,
        profile: VOCABULARY_PROFILE,
        rdfLabelMappings: {
          en: VOCABULARY_RDF_LABEL_EN,
        },
        rdfCommentMappings: {
          en: VOCABULARY_RDF_COMMENT_EN,
        },
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
          indexBlog: true, // LRM has a blog
          language: ['en'],
        },
        // imageConfig defaults are now environment-aware in the factory
      }),
    ],

    themeConfig: deepmerge(
      createThemeConfig({
        navbarTitle: 'LRM',
        navbarItems: createStandardsNavbar({
          title: 'LRM',
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
        // LRM-specific theme overrides
        metadata: [
          { name: 'keywords', content: 'ifla, library, standards, lrm, reference model, cataloging' },
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
