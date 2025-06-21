import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { themes as prismThemes } from 'prism-react-renderer';
import { getSiteDocusaurusConfig } from '@ifla/theme/config';
import { getCurrentEnv } from '@ifla/theme/config/siteConfig.server';
import { standardsDropdown } from '@ifla/theme/config/docusaurus';
import navbarItems from './navbar';

const siteKey = 'muldicat';
const currentEnv = getCurrentEnv();
const { url, baseUrl } = getSiteDocusaurusConfig(siteKey, currentEnv);

const config: Config = {
  title: 'MulDiCat',
  tagline: 'Multilingual Dictionary of Cataloguing Terms and Concepts',
  url,
  baseUrl,
  projectName: 'muldicat',
  
  // Deployment settings
  organizationName: 'iflastandards',
  trailingSlash: false,
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  onBrokenAnchors: 'warn',
  onDuplicateRoutes: 'warn',

  favicon: '/img/favicon.ico',
  
  // Shared static directories for all standards sites
  staticDirectories: ['static', '../../packages/theme/static'],
  
  customFields: {
    vocabularyDefaults: {
      prefix: "ifla",
      numberPrefix: "T",
      profile: "vocabulary-profile.csv",
      elementDefaults: {
        uri: "https://www.iflastandards.info/elements",
        classPrefix: "class",
        propertyPrefix: "prop",
        profile: "elements-profile.csv",
        profileShapeId: "ElementShape",
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
          editUrl: 'https://github.com/iflastandards/muldicat/tree/main/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/iflastandards/muldicat/tree/main/',
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
    
    // Navigation
    navbar: {
      title: 'MulDiCat',
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
            {
              label: 'GitHub Repository',
              href: 'https://github.com/iflastandards/muldicat',
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
