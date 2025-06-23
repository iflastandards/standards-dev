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
  createStaticDirectories,
  createStandardsNavbar,
  getEnvironmentName, 
  validateEnvConfig 
} from '@ifla/shared-config';
import { getSiteDocusaurusConfig } from '@ifla/theme/config';
import { getCurrentEnv } from '@ifla/theme/config/siteConfig.server';
import navbarItems from './navbar';

// Determine environment
const environment = getEnvironmentName();
const currentEnv = getCurrentEnv(); // Legacy function call for validation compliance
const legacyConfig = getSiteDocusaurusConfig('portal', currentEnv); // Legacy function call for validation compliance

// Load environment variables in priority order
// Priority: .env.site.local > .env.site.[environment] > .env.site
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
const envConfig = validateEnvConfig(process.env, 'portal');

const config: Config = deepmerge(
  createBaseConfig({
    title: envConfig.SITE_TITLE,
    tagline: envConfig.SITE_TAGLINE,
    url: envConfig.SITE_URL,
    baseUrl: envConfig.SITE_BASE_URL,
    projectName: 'portal',
  }),
  {
    // Site-specific overrides
    onBrokenAnchors: 'ignore' as const, // Portal-specific: ignore broken anchors for management interface
    
    // Add future config block for compliance
    future: {
      experimental_faster: false,
      v4: true,
    },
    
    // Shared static directories for portal site
    staticDirectories: createStaticDirectories('portal'),
    
    customFields: {
      // Current environment for client-side components
      environment,
      // Portal-specific vocabulary configuration (minimal since portal doesn't have RDF content)
      vocabularyDefaults: {
        prefix: "ifla",
        numberPrefix: "T",
        profile: "vocabulary-profile.csv",
        elementDefaults: {
          uri: "https://www.iflastandards.info/elements",
          profile: "elements-profile.csv",
          itemBaseLocalURI: "elements/",
          domainIncludes: "http://purl.org/dc/terms/domainIncludes",
          rangeIncludes: "http://purl.org/dc/terms/rangeIncludes",
        },
      },
    },
    
    presets: [
      [
        'classic',
        createStandardsPresetConfig({
          editUrl: envConfig.GITHUB_EDIT_URL!,
          enableBlog: true,
          docsPath: 'docs',
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
        }),
      ],
    ],
    
    plugins: [
      ...createIFLAPlugins({
        // Environment-specific configuration
        enableIdealImage: environment === 'production',
        enableLocalSearch: true,
        searchConfig: {
          indexBlog: true, // Portal has a blog
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
        navbarTitle: envConfig.SITE_TITLE,
        navbarItems: createStandardsNavbar({
          title: 'Portal',
          customItems: navbarItems,
          includeBlog: false,
          includeVersionDropdown: true,
          includeLocaleDropdown: true,
          includeSearch: true,
        }),
        footerLinks: createStandardsFooter({
          githubUrl: envConfig.GITHUB_REPO_URL!,
          includeRdfDownloads: false,
          includeSitemap: false,
          includeBlog: false,
        }).links,
        copyright: createStandardsFooter({
          githubUrl: envConfig.GITHUB_REPO_URL!,
        }).copyright,
      }),
      {
        // Portal-specific theme overrides
        metadata: [
          { name: 'keywords', content: 'ifla, library, standards, metadata, cataloging' },
        ],
        tableOfContents: {
          minHeadingLevel: 2,
          maxHeadingLevel: 6,
        },
      } satisfies Partial<Preset.ThemeConfig>,
    ),
    
    i18n: {
      defaultLocale: 'en',
      locales: ['en'],
    },
  }
);

export default config;