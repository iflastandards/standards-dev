import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { themes as prismThemes } from 'prism-react-renderer';
import { getSiteDocusaurusConfig } from '@ifla/theme/config';
import { getCurrentEnv } from '@ifla/theme/config/siteConfig.server';
import { standardsDropdown } from '@ifla/theme/config/docusaurus';
import navbarItems from './navbar';

const siteKey = 'portal';
const currentEnv = getCurrentEnv();
const { url, baseUrl } = getSiteDocusaurusConfig(siteKey, currentEnv);

const config: Config = {
  title: 'IFLA Standards Portal',
  tagline: 'International Federation of Library Associations and Institutions',
  url,
  baseUrl,
  projectName: 'portal',
  
  // Deployment settings
  organizationName: 'iflastandards',
  trailingSlash: false,
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  onBrokenAnchors: 'ignore', // Portal-specific: ignore broken anchors for management interface
  onDuplicateRoutes: 'warn',

  favicon: 'img/favicon.ico',
  
  // Portal-specific static directories
  staticDirectories: ['static', '../packages/theme/static'],
  
  customFields: {
    // Current environment for client-side components
    docsEnv: currentEnv,
    // Portal-specific vocabulary configuration (minimal since portal doesn't have RDF content)
    vocabularyDefaults: {
      prefix: "ifla",
      numberPrefix: "T",
      profile: "vocabulary-profile.csv",
      elementDefaults: {
        uri: "https://www.iflastandards.info/elements",
        profile: "elements-profile.csv",
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
          editUrl: 'https://github.com/iflastandards/standards-dev/tree/main/portal/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/iflastandards/standards-dev/tree/main/portal/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
    '@ifla/preset-ifla', // Adds shared plugins
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
    
    // Navigation - Portal shows all standards including itself
    navbar: {
      title: 'IFLA Standards',
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
    
    // Footer - Portal has simplified links (no RDF downloads/sitemap)
    footer: {
      style: 'dark',
      links: [
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