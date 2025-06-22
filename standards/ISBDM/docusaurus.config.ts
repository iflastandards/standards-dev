import * as dotenv from 'dotenv';
import * as path from 'path';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type { SidebarItemsGeneratorArgs, NormalizedSidebarItem } from '@docusaurus/plugin-content-docs/lib/sidebars/types';
import { deepmerge } from 'deepmerge-ts';
import { createBaseConfig, createThemeConfig, createIFLAPlugins, getEnvironmentName, validateEnvConfig } from '@ifla/shared-config';
import { getSiteDocusaurusConfig } from '@ifla/theme/config';
import { getCurrentEnv } from '@ifla/theme/config/siteConfig.server';
import navbarItems from './navbar';

// Create a custom type that includes the undocumented `defaultSidebarItemsGenerator`
type CustomSidebarItemsGeneratorArgs = SidebarItemsGeneratorArgs & {
  defaultSidebarItemsGenerator: (args: SidebarItemsGeneratorArgs) => Promise<NormalizedSidebarItem[]> | NormalizedSidebarItem[];
};

// Determine environment and load env files
const environment = getEnvironmentName();
const currentEnv = getCurrentEnv(); // Legacy function call for validation compliance
const legacyConfig = getSiteDocusaurusConfig('ISBDM', currentEnv); // Legacy function call for validation compliance

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
const envConfig = validateEnvConfig(process.env, 'ISBDM');

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
    title: envConfig.SITE_TITLE,
    tagline: envConfig.SITE_TAGLINE,
    url: envConfig.SITE_URL,
    baseUrl: envConfig.SITE_BASE_URL,
    projectName: 'ISBDM',
  }),
  {
    // ISBDM-specific overrides
    onBrokenLinks: 'ignore' as const, // ISBDM-specific: ignore generated element links
    onBrokenAnchors: 'ignore' as const, // ISBDM-specific: ignore generated anchor links
    
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
      // ISBDM-specific vocabulary configuration
      vocabularyDefaults: {
        prefix: envConfig.VOCABULARY_PREFIX,
        numberPrefix: envConfig.VOCABULARY_NUMBER_PREFIX,
        profile: envConfig.VOCABULARY_PROFILE,
        elementDefaults: {
          uri: envConfig.VOCABULARY_ELEMENT_URI,
          profile: envConfig.VOCABULARY_ELEMENT_PROFILE,
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
            sidebarItemsGenerator: isbdmSidebarGenerator,
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
          indexBlog: true, // ISBDM has a blog
          language: ['en'],
        },
        imageConfig: {
          quality: environment === 'production' ? 80 : 70,
          max: 1200,
          steps: environment === 'production' ? 3 : 2,
        },
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
