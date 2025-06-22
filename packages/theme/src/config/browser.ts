/**
 * Browser-safe configuration exports
 * This file contains only configurations that can be safely bundled for browser use
 */

import { themes as prismThemes } from 'prism-react-renderer';

// Browser-safe theme configuration - only truly global items
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
  // Shared navbar logo configuration
  navbar: {
    logo: {
      alt: 'IFLA Logo',
      src: 'img/logo-ifla_black.png',
    },
  },
  // Shared footer configuration with common links
  footer: {
    style: 'dark',
    links: [
      {
        title: 'Standards',
        items: [
          { label: 'ISBDM', to: '/docs' },
          { label: 'LRM', to: '/docs' },
          { label: 'FR', to: '/docs' },
          { label: 'ISBD', to: '/docs' },
          { label: 'MulDiCat', to: '/docs' },
          { label: 'UNIMARC', to: '/docs' },
        ],
      },
      {
        title: 'Community',
        items: [
          { label: 'IFLA Website', href: 'https://www.ifla.org' },
          { label: 'GitHub', href: 'https://github.com/ifla' },
        ],
      },
      {
        title: 'More',
        items: [
          { label: 'Blog', to: '/blog' },
          { label: 'About', to: '/docs/intro' },
        ],
      },
    ],
    copyright: `Copyright © ${new Date().getFullYear()} IFLA. Built with Docusaurus.`,
  },
};

// Common plugin defaults (browser-safe)
export const sharedPlugins = [
  ['@docusaurus/plugin-content-docs', {
    sidebarPath: './sidebars.ts',
    editUrl: 'https://github.com/ifla/standards-dev/tree/main/',
    remarkPlugins: [],
    rehypePlugins: [],
    showLastUpdateAuthor: true,
    showLastUpdateTime: true,
  }],
  ['@docusaurus/plugin-content-blog', {
    showReadingTime: true,
    feedOptions: {
      type: 'all',
      copyright: `Copyright © ${new Date().getFullYear()} IFLA.`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createFeedItems: async (params: any) => {
        const { blogPosts, defaultCreateFeedItems, ...rest } = params;
        return defaultCreateFeedItems({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          blogPosts: blogPosts.filter((item: any, index: number) => index < 10),
          ...rest,
        });
      },
    },
  }],
];

// Common theme defaults (browser-safe)
export const sharedThemes = [
  ['classic', {
    customCss: './src/css/custom.css',
  }],
];

// Common defaults for all sites (browser-safe)
export const commonDefaults = {
  onBrokenLinks: 'throw' as const,
  onBrokenMarkdownLinks: 'warn' as const,
  favicon: '/img/favicon.ico',
  organizationName: 'ifla',
  projectName: 'standards-dev',
  trailingSlash: false,
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
};
