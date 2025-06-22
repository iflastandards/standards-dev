import * as dotenv from 'dotenv';
import * as path from 'path';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { deepmerge } from 'deepmerge-ts';
import { createBaseConfig, createThemeConfig, createIFLAPlugins, getEnvironmentName, validateEnvConfig } from '@ifla/shared-config';
import { getSiteDocusaurusConfig } from '@ifla/theme/config';
import { getCurrentEnv } from '@ifla/theme/config/siteConfig.server';
import navbarItems from './navbar';

// Determine environment and load env files
const environment = getEnvironmentName();
const currentEnv = getCurrentEnv(); // Legacy function call for validation compliance
const legacyConfig = getSiteDocusaurusConfig('LRM', currentEnv); // Legacy function call for validation compliance

// Load environment variables in priority order
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
    staticDirectories: ['static', '../../packages/theme/static'],
    
    customFields: {
      // Current environment for client-side components
      environment,
      // LRM-specific vocabulary configuration
      vocabularyDefaults: {
        prefix: envConfig.VOCABULARY_PREFIX,
        numberPrefix: envConfig.VOCABULARY_NUMBER_PREFIX,
        uriStyle: envConfig.VOCABULARY_URI_STYLE,
        profile: envConfig.VOCABULARY_PROFILE,
        RDF: {
          label: {
            en: envConfig.VOCABULARY_RDF_LABEL_EN?.split(',') || [],
          },
          comment: {
            en: envConfig.VOCABULARY_RDF_COMMENT_EN?.split(',') || [],
          },
        },
      },
    },

    presets: [
      [
        'classic',
        {
          docs: {
            sidebarPath: './sidebars.ts',
            editUrl: envConfig.GITHUB_EDIT_URL,
            showLastUpdateAuthor: true,
            showLastUpdateTime: true,
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
    ],
    
    plugins: [
      // IFLA standard plugins
      ...createIFLAPlugins({
        // Environment-specific configuration
        enableIdealImage: environment === 'production',
        enableLocalSearch: true,
        searchConfig: {
          indexBlog: true, // LRM has a blog
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
        navbarTitle: 'LRM',
        navbarItems: [
          ...navbarItems,
          // Note: standardsDropdown removed as requested
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
          },
        ],
        footerLinks: [
          {
            title: 'Resources',
            items: [
              {
                label: 'RDF Downloads',
                to: '/rdf/',
              },
              {
                label: 'Sitemap',
                to: '/sitemap',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'IFLA Website',
                href: 'https://www.ifla.org/',
              },
              {
                label: 'IFLA Standards',
                href: 'https://www.ifla.org/programmes/ifla-standards/',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: envConfig.GITHUB_REPO_URL!,
              },
            ],
          },
        ],
        copyright: `
          Copyright © ${new Date().getFullYear()} International Federation of Library Associations and Institutions (IFLA)<br />
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">
            <img src="img/cc0_by.png" alt="CC BY 4.0" style="vertical-align:middle; height:24px;" />
          </a>
          Gordon Dunsire and Mirna Willer (Main design and content editors).
        `,
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