import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type { NavbarItem } from '@docusaurus/theme-common';
import { type DocsEnv } from './siteConfigCore';
import { getSiteUrl } from './siteConfig';

/**
 * Base Docusaurus configuration.
 * This is not a valid Docusaurus config file, but a base for other configs.
 */

export const standardsDropdown = (currentEnv: DocsEnv): NavbarItem => ({
  type: 'dropdown',
  label: 'Standards',
  position: 'left',
  items: [
    { label: 'Portal Home', href: getSiteUrl('portal', '/', currentEnv) }, 
    {
      label: 'ISBD',
      href: getSiteUrl('isbd', '/', currentEnv),
    },
    {
      label: 'LRM',
      href: getSiteUrl('LRM', '/', currentEnv),
    },
    {
      label: 'UNIMARC',
      href: getSiteUrl('unimarc', '/', currentEnv),
    },
    {
      label: 'ISBDM',
      href: getSiteUrl('ISBDM', '/', currentEnv),
    },
    {
      label: 'FRBR', // Assuming 'FRBR' is the key for FR family
      href: getSiteUrl('FRBR', '/', currentEnv),
    },
    {
      label: 'Muldicat',
      href: getSiteUrl('muldicat', '/', currentEnv),
    },
  ],
});



// Shared theme configuration - only truly global items
export const sharedThemeConfig = {
  // Global prism themes for code highlighting
  prism: {
    theme: prismThemes.github,
    darkTheme: prismThemes.dracula,
  },
  // Common table of contents settings
  tableOfContents: {
    minHeadingLevel: 2,
    maxHeadingLevel: 5,
  },
  // Standard color mode configuration
  colorMode: {
    defaultMode: 'light',
    disableSwitch: false,
    respectPrefersColorScheme: true,
  },
  // Standard social card
  image: 'img/docusaurus-social-card.jpg',
  // Common announcement bar
  announcementBar: {
    id: 'support_us',
    content: '⭐️ This is an active development site for IFLA standards ⭐️',
    backgroundColor: '#fafbfc',
    textColor: '#091E42',
    isCloseable: false,
  },
  // Shared navbar logo configuration (static part)
  navbar: {
    logo: {
      alt: 'IFLA Logo',
      src: 'img/logo-ifla_black.png',
    },
  },
  // Shared footer configuration (static parts)
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
          <img src="/img/cc0_by.png" alt="My Logo Alt Text" style="vertical-align:middle; height:24px;" />
        </a>
        Gordon Dunsire and Mirna Willer (Main design and content editors).
      `,

  },
  staticDirectories: ['static', '../../packages/theme/static'],
};

// Shared plugins - only truly universal ones
export const sharedPlugins = [
  'docusaurus-plugin-sass',
  [
    '@docusaurus/plugin-ideal-image',
    {
      quality: 70,
      max: 1030,
      min: 640,
      steps: 2,
      disableInDev: false,
    },
  ],
];

// Shared themes - only search which all sites use
export const sharedThemes = [
  '@docusaurus/theme-live-codeblock',
  [
    '@easyops-cn/docusaurus-search-local',
    {
      hashed: true,
      indexBlog: false,
    },
  ],
];

// Static base settings that sites can override
export const staticBaseSettings: Partial<Config> = {
  future: {
    experimental_faster: false,
    v4: true,
  },
  favicon: '/img/favicon.ico',
  // url: 'https://iflastandards.github.io', // Site-specific, so remove from base
  organizationName: 'iflastandards', // Common organization name
  trailingSlash: false, // Default, can be overridden by sites or env
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  onBrokenAnchors: 'warn',
  onDuplicateRoutes: 'warn',
  markdown: {
    mermaid: true,
  },
  // staticDirectories: ['static', '../../packages/theme/static'], // Each site should declare its own, plus the theme's one if needed
};

// Function to generate the base Docusaurus configuration dynamically
export const baseDocusaurusConfig = (currentEnv: DocsEnv): Partial<Config> => {
  return {
    ...staticBaseSettings, // Spread the static base settings
    staticDirectories: ['static', '../../packages/theme/static'], // Standards sites path
    plugins: sharedPlugins,
    themes: sharedThemes,
    themeConfig: {
      // Spread all of sharedThemeConfig (which includes prism, tableOfContents, colorMode, image, announcementBar, etc.)
      ...(sharedThemeConfig as any), // Type assertion for spread
      // Override/construct navbar and footer within themeConfig
      navbar: {
        ...(sharedThemeConfig.navbar as any), // Spreads sharedThemeConfig.navbar (e.g., logo)
        items: [], // Sites are responsible for populating this themselves
      },
      footer: {
        ...sharedThemeConfig.footer, // Use the shared footer configuration directly
      },
    },
  };
};

// Example of how to use baseDocusaurusConfig in a site's docusaurus.config.ts
// import { baseDocusaurusConfig, standardsDropdown, sharedFooterSiteLinks } from '@ifla/theme/config/docusaurus'; // (or from @ifla/theme/config)
// import { getCurrentEnv } from '@ifla/theme/config/siteConfig.server';
// import { getSiteDocusaurusConfig } from '@ifla/theme/config/siteConfig';
//
// const siteKey: SiteKey = 'portal'; // Or 'LRM', 'ISBDM', etc.
// const currentEnv = getCurrentEnv(); // This 'currentEnv' should be used below
// const { url, baseUrl } = getSiteDocusaurusConfig(siteKey, currentEnv);
//
// const config: Config = {
//   ...baseDocusaurusConfig(currentEnv), // Correct: use currentEnv directly
//   title: 'My Site Title',
//   tagline: 'My Site Tagline',
//   url: url,
//   baseUrl: baseUrl,
//   customFields: {
//     docsEnv: currentEnv, // Correct: use currentEnv directly
//   },
//   themeConfig: {
//     ...(baseDocusaurusConfig(currentEnv).themeConfig as any), // Correct: use currentEnv directly
//     navbar: {
//       title: 'My Site Nav Title',
//       // logo: { alt: 'My Site Logo', src: 'img/logo.svg' },
//       items: [
//         standardsDropdown(currentEnv), // Correct: use currentEnv directly
//         // ... other navbar items
//       ],
//     },
//     footer: {
//       style: 'dark',
//       links: [
//         ...sharedFooterSiteLinks(currentEnv), // Correct: use currentEnv directly
//         // ... other footer links
//       ],
//       copyright: `Copyright ${new Date().getFullYear()} IFLA. Built with Docusaurus.`,
//     },
//   },
// };
//
// export default config;
