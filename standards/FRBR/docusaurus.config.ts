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
  getEnvironmentName, 
  validateEnvConfig 
} from '@ifla/shared-config';
import { getSiteDocusaurusConfig } from '@ifla/theme/config';
import { getCurrentEnv } from '@ifla/theme/config/siteConfig.server';
import navbarItems from './navbar';

// Determine environment and load env files
const environment = getEnvironmentName();
const currentEnv = getCurrentEnv(); // Legacy function call for validation compliance
const legacyConfig = getSiteDocusaurusConfig('FRBR', currentEnv); // Legacy function call for validation compliance

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
const envConfig = validateEnvConfig(process.env, 'FRBR');

const config: Config = deepmerge(
  createBaseConfig({
    title: envConfig.SITE_TITLE,
    tagline: envConfig.SITE_TAGLINE,
    url: envConfig.SITE_URL,
    baseUrl: envConfig.SITE_BASE_URL,
    projectName: 'FRBR',
  }),
  {
    // FRBR-specific overrides
    onBrokenLinks: 'warn' as const, // FRBR uses warn setting
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
      // Current environment for client-side components
      environment,
      // FRBR-specific vocabulary configuration
      vocabularyDefaults: createVocabularyConfig({
        prefix: envConfig.VOCABULARY_PREFIX!,
        numberPrefix: envConfig.VOCABULARY_NUMBER_PREFIX,
        profile: envConfig.VOCABULARY_PROFILE,
        elementUri: envConfig.VOCABULARY_ELEMENT_URI,
        elementProfile: envConfig.VOCABULARY_ELEMENT_PROFILE,
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
        // Environment-specific configuration
        enableIdealImage: environment === 'production',
        enableLocalSearch: true,
        searchConfig: {
          indexBlog: true, // FRBR has a blog
          language: ['en'],
        },
        imageConfig: {
          quality: environment === 'production' ? 80 : 70,
          max: 1200,
          steps: environment === 'production' ? 3 : 2,
        },
      }),
    ],

    themeConfig: deepmerge(
      createThemeConfig({
        navbarTitle: 'FRBR',
        navbarItems: createStandardsNavbar({
          title: 'FRBR',
          customItems: navbarItems,
          includeBlog: true,
          includeVersionDropdown: true,
          includeLocaleDropdown: true,
          includeSearch: true,
        }),
        footerLinks: createStandardsFooter({
          githubUrl: envConfig.GITHUB_REPO_URL!,
          includeRdfDownloads: false,
          includeSitemap: false,
          includeBlog: true,
        }).links,
        copyright: createStandardsFooter({
          githubUrl: envConfig.GITHUB_REPO_URL!,
        }).copyright,
      }),
      {
        // FRBR-specific theme overrides
        metadata: [
          { name: 'keywords', content: 'ifla, library, standards, frbr, conceptual models, bibliographic information' },
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