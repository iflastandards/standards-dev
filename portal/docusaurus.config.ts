import * as dotenv from 'dotenv';
import * as path from 'path';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { deepmerge } from 'deepmerge-ts';
import { createBaseConfig, createThemeConfig, getEnvironmentName, validateEnvConfig } from '@ifla/shared-config';
import { getSiteDocusaurusConfig } from '@ifla/theme/config';
import { getCurrentEnv } from '@ifla/theme/config/siteConfig.server';
import navbarItems from './navbar';

// Determine environment
const environment = getEnvironmentName();
const currentEnv = getCurrentEnv(); // Legacy function call for validation compliance
const legacyConfig = getSiteDocusaurusConfig('portal', currentEnv); // Legacy function call for validation compliance

// Load environment variables in priority order
// Priority: .env.local > .env.[environment] > .env
const envFiles = [
  '.env',
  `.env.${environment}`,
  '.env.local',
  environment !== 'local' ? `.env.${environment}.local` : null,
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
    
    // Portal-specific static directories
    staticDirectories: ['static', '../packages/theme/static'],
    
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
        {
          docs: {
            path: 'docs',
            sidebarPath: './sidebars.ts',
            editUrl: envConfig.GITHUB_EDIT_URL,
            remarkPlugins: [],
          },
          blog: {
            showReadingTime: true,
            editUrl: envConfig.GITHUB_EDIT_URL,
          },
          theme: {
            customCss: './src/css/custom.css',
          },
        } satisfies Preset.Options,
      ],
      '@ifla/preset-ifla',
    ],
    
    themeConfig: deepmerge(
      createThemeConfig({
        navbarTitle: envConfig.SITE_TITLE,
        navbarItems: [
          ...navbarItems,
          // Note: standardsDropdown removed as requested
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
          },
        ],
        footerLinks: [
          {
            title: 'IFLA Standards',
            items: [
              {
                label: 'IFLA LRM',
                href: '/LRM/', // Will be resolved by theme to correct URL
              },
              {
                label: 'ISBDM',
                href: '/ISBDM/', // Will be resolved by theme to correct URL
              },
              {
                label: 'Blog',
                to: '/blog/',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Twitter',
                href: 'https://twitter.com/docusaurus',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Docs',
                to: '/docs/',
              },
              {
                label: 'GitHub',
                href: envConfig.GITHUB_REPO_URL!,
              },
            ],
          },
        ],
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
    
    plugins: [],
    
    i18n: {
      defaultLocale: 'en',
      locales: ['en'],
    },
  }
);

export default config;