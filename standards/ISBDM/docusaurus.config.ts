import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type { SidebarItemsGeneratorArgs, NormalizedSidebarItem } from '@docusaurus/plugin-content-docs/lib/sidebars/types';
import { themes as prismThemes } from 'prism-react-renderer';
import { getSiteDocusaurusConfig } from '@ifla/theme/config';
import { getCurrentEnv } from '@ifla/theme/config/siteConfig.server';
import { standardsDropdown } from '@ifla/theme/config/docusaurus';
import navbarItems from './navbar';

// Create a custom type that includes the undocumented `defaultSidebarItemsGenerator`
type CustomSidebarItemsGeneratorArgs = SidebarItemsGeneratorArgs & {
  defaultSidebarItemsGenerator: (args: SidebarItemsGeneratorArgs) => Promise<NormalizedSidebarItem[]> | NormalizedSidebarItem[];
};

const siteKey = 'ISBDM';
const currentEnv = getCurrentEnv();
const { url, baseUrl } = getSiteDocusaurusConfig(siteKey, currentEnv);

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

const config: Config = {
  title: 'ISBD for Manifestation',
  tagline: 'International Standard Bibliographic Description for Manifestation',
  url,
  baseUrl,
  projectName: 'ISBDM',
  
  // Deployment settings
  organizationName: 'iflastandards',
  trailingSlash: false,
  onBrokenLinks: 'ignore', // ISBDM-specific: ignore generated element links
  onBrokenAnchors: 'ignore', // ISBDM-specific: ignore generated anchor links
  onBrokenMarkdownLinks: 'warn',
  onDuplicateRoutes: 'warn',

  favicon: 'img/favicon.ico',
  
  // Shared static directories for all standards sites
  staticDirectories: ['static', '../../packages/theme/static'],
  
  customFields: {
    vocabularyDefaults: {
      prefix: "isbdm",
      numberPrefix: "T",
      profile: "isbdm-values-profile-revised.csv",
      elementDefaults: {
        uri: "https://www.iflastandards.info/ISBDM/elements",
        profile: "isbdm-elements-profile.csv",
      }
    }
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/iflastandards/ISBDM/tree/main/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          sidebarItemsGenerator: isbdmSidebarGenerator,
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/iflastandards/ISBDM/tree/main/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
    '@ifla/preset-ifla', // Adds shared plugins
  ],

  plugins: [
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

  themeConfig: {
    // Theme components configuration
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    
    // Navigation
    navbar: {
      title: 'ISBDM',
      logo: {
        alt: 'IFLA Logo',
        src: 'img/logo-ifla_black.png',
      },
      items: [
        ...navbarItems,
        standardsDropdown(currentEnv),
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
    },
    
    // Footer
    footer: {
      style: 'dark',
      links: [
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
              href: 'https://github.com/iflastandards/standards-dev',
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
    },
  } satisfies Preset.ThemeConfig,
};

export default config;