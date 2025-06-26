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
  getSiteConfigMap,
  SITE_CONFIG,
  type SiteKey,
  type Environment,
  type SiteConfigEntry
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
const siteKey: SiteKey = 'portal';

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
const SITE_TITLE = 'IFLA Standards Portal';
const SITE_TAGLINE = 'International Federation of Library Associations and Institutions';
const GITHUB_REPO_URL = 'https://github.com/iflastandards/standards-dev';
const GITHUB_EDIT_URL = 'https://github.com/iflastandards/standards-dev/tree/main/portal/';

const config: Config = deepmerge(
  createBaseConfig({
    title: SITE_TITLE,
    tagline: SITE_TAGLINE,
    url: siteConfig.url,
    baseUrl: siteConfig.baseUrl,
    projectName: 'portal',
  }),
  {
    // Site-specific overrides
    onBrokenAnchors: 'ignore' as const, // Portal-specific: ignore broken anchors for management interface
    
    // Add future config block for compliance
    future: {
      v4: true,
    },
    
    // Shared static directories for portal site
    staticDirectories: createStaticDirectories('portal'),
    
    customFields: {
      // Site configurations for all sites in current environment (SSG-compatible)
      siteConfigs: getSiteConfigMap(currentEnv),
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
          editUrl: GITHUB_EDIT_URL,
          enableBlog: true,
          docsPath: 'docs',
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
        }),
      ],
    ],
    
    plugins: [
      ...createIFLAPlugins({
        environment: currentEnv, // Pass environment for pure function
        enableLocalSearch: true,
        searchConfig: {
          indexBlog: true, // Portal has a blog
          language: ['en'],
        },
        // imageConfig defaults are now environment-aware in the factory
      }),
    ],
    
    themeConfig: deepmerge(
      createThemeConfig({
        navbarTitle: SITE_TITLE,
        navbarItems: createStandardsNavbar({
          title: 'Portal',
          customItems: navbarItems,
          includeBlog: false,
          includeVersionDropdown: true,
          includeLocaleDropdown: true,
          includeSearch: true,
        }),
        footerLinks: createStandardsFooter({
          githubUrl: GITHUB_REPO_URL,
          includeRdfDownloads: false,
          includeSitemap: false,
          includeBlog: false,
        }).links,
        copyright: createStandardsFooter({
          githubUrl: GITHUB_REPO_URL,
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