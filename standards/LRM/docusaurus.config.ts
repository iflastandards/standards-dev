import * as dotenv from 'dotenv';
import * as path from 'path';
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
  normalizeEnvironmentName, 
  validateEnvConfig 
} from '@ifla/shared-config';
import navbarItems from './navbar';

// Determine environment and load env files - PURE APPROACH
const docsEnv = process.env['DOCS_ENV'];
if (!docsEnv) {
  throw new Error(
    `❌ FATAL: DOCS_ENV environment variable is required but not set.\n` +
    `✅ Valid values: local, localhost, preview, dev, production\n` +
    `💡 NX builds should load DOCS_ENV from root .env file automatically.\n` +
    `💡 CI/production workflows must set DOCS_ENV explicitly.`
  );
}
const environment = normalizeEnvironmentName(docsEnv);

// Load environment variables in priority order
const envFiles = [
  '.env.site',
  `.env.site.${environment}`,
  '.env.site.local',
  environment !== 'local' ? `.env.site.${environment}.local` : null,
].filter(Boolean);

// Load each env file, later files override earlier ones
for (const file of envFiles) {
  dotenv.config({ path: path.resolve(__dirname, file!) });
}

// Validate we have all required environment variables
const envConfig = validateEnvConfig(process.env, 'LRM');

const config: Config = deepmerge(
  createBaseConfig({
    title: envConfig.SITE_TITLE,
    tagline: envConfig.SITE_TAGLINE,
    url: envConfig.SITE_URL,
    baseUrl: envConfig.SITE_BASE_URL,
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
      // Current environment for client-side components
      environment,
      // LRM-specific vocabulary configuration
      vocabularyDefaults: createVocabularyConfig({
        prefix: envConfig.VOCABULARY_PREFIX!,
        numberPrefix: envConfig.VOCABULARY_NUMBER_PREFIX,
        uriStyle: envConfig.VOCABULARY_URI_STYLE,
        profile: envConfig.VOCABULARY_PROFILE,
        rdfLabelMappings: {
          en: envConfig.VOCABULARY_RDF_LABEL_EN?.split(',') || [],
        },
        rdfCommentMappings: {
          en: envConfig.VOCABULARY_RDF_COMMENT_EN?.split(',') || [],
        },
      }),
    },

    presets: [
      [
        'classic',
        createStandardsPresetConfig({
          editUrl: envConfig.GITHUB_EDIT_URL!,
          enableBlog: true,
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        }),
      ],
    ],
    
    plugins: [
      // IFLA standard plugins
      ...createIFLAPlugins({
        environment, // Pass environment for pure function
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
          githubUrl: envConfig.GITHUB_REPO_URL!,
          includeRdfDownloads: true,
          includeSitemap: true,
          includeBlog: true,
        }).links,
        copyright: createStandardsFooter({
          githubUrl: envConfig.GITHUB_REPO_URL!,
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