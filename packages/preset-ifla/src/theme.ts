/**
 * Theme configuration builder for IFLA preset
 */

import type { NavbarItem } from '@docusaurus/theme-common';
import { SiteKey, DocsEnv, IFLANavigationOptions, IFLAFooterOptions } from './types';
import { getSiteUrl } from './utils';

/**
 * Build cross-site navigation dropdown
 */
export function createStandardsDropdown(
  currentSiteKey: SiteKey,
  env: DocsEnv,
  options: IFLANavigationOptions = {}
): NavbarItem {
  const {
    hideCurrentSiteFromStandardsDropdown = false,
    standardsDropdownPosition = 'left'
  } = options;

  const allItems = [
    { label: 'Portal Home', href: getSiteUrl('portal', '/', env), siteKey: 'portal' },
    { label: 'ISBD', href: getSiteUrl('isbd', '/', env), siteKey: 'isbd' },
    { label: 'LRM', href: getSiteUrl('LRM', '/', env), siteKey: 'LRM' },
    { label: 'UNIMARC', href: getSiteUrl('unimarc', '/', env), siteKey: 'unimarc' },
    { label: 'ISBDM', href: getSiteUrl('ISBDM', '/', env), siteKey: 'ISBDM' },
    { label: 'FR Family', href: getSiteUrl('FRBR', '/', env), siteKey: 'FRBR' },
    { label: 'Muldicat', href: getSiteUrl('muldicat', '/', env), siteKey: 'muldicat' },
  ];

  const items = hideCurrentSiteFromStandardsDropdown
    ? allItems.filter(item => item.siteKey !== currentSiteKey)
    : allItems;

  return {
    type: 'dropdown',
    label: 'Standards',
    position: standardsDropdownPosition,
    items: items.map(({ siteKey: _siteKey, ...item }) => item), // Remove siteKey from final items
  };
}

/**
 * Build resources dropdown
 */
export function createResourcesDropdown(env: DocsEnv): NavbarItem {
  return {
    label: 'Resources',
    position: 'right',
    type: 'dropdown',
    items: [
      {
        label: 'RDF Downloads',
        to: '/rdf/',
      },
      {
        label: 'Vocabulary Server',
        href: getSiteUrl('portal', '/', env).replace(/\/portal\/$/, '/'), // Root URL for vocab server
      },
      {
        label: 'IFLA Website',
        href: 'https://www.ifla.org/',
      },
      {
        label: 'GitHub Repository',
        href: 'https://github.com/iflastandards/standards-dev',
        'aria-label': 'GitHub repository',
      },
      {
        label: 'Portal',
        href: getSiteUrl('portal', '/', env),
      },
    ],
  };
}

/**
 * Build complete navbar configuration
 */
export function buildNavbarConfig(
  title: string,
  siteKey: SiteKey,
  env: DocsEnv,
  customNavbarItems: NavbarItem[] = [],
  navigation: IFLANavigationOptions = {}
): any {
  const {
    includeDocumentationItem = true,
    includeResourcesDropdown = true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    standardsDropdownPosition: _standardsDropdownPosition = 'left',
  } = navigation;

  // Create a fresh array for each call to prevent contamination
  const navbarItems: NavbarItem[] = [];

  // Add default Documentation item (if enabled)
  if (includeDocumentationItem) {
    navbarItems.push({
      type: 'doc',
      position: 'left',
      docId: 'index',
      label: 'Documentation',
    });
  }

  // Add custom navbar items (create a deep copy to avoid mutation)
  customNavbarItems.forEach(item => {
    navbarItems.push(JSON.parse(JSON.stringify(item)));
  });

  // Add standards dropdown
  navbarItems.push(createStandardsDropdown(siteKey, env, navigation));

  // Add resources dropdown (if enabled)
  if (includeResourcesDropdown) {
    navbarItems.push(createResourcesDropdown(env));
  }

  // Add standard right-side items
  navbarItems.push(
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
    }
  );

  // Return a completely new object structure to prevent any reference sharing
  return {
    title,
    logo: {
      alt: 'IFLA Logo',
      src: 'img/logo-ifla_black.png',
    },
    items: navbarItems,
  };
}

/**
 * Build footer configuration
 */
export function buildFooterConfig(
  env: DocsEnv,
  footerOptions: IFLAFooterOptions = {},
  siteKey?: string
): any {
  const { additionalResourceLinks = [], hideDefaultResourceLinks = false } = footerOptions;

  const defaultResourceLinks = hideDefaultResourceLinks ? [] : [
    {
      label: 'RDF Downloads',
      to: '/rdf/',
    },
    {
      label: 'Sitemap',
      to: '/sitemap',
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _resourcesItems = [
    ...defaultResourceLinks,
    ...additionalResourceLinks,
  ];

  // Portal footer customization
  const docsSection = siteKey === 'portal' ? {
    title: 'Docs',
    items: [
      {
        label: 'Documentation',
        to: '/docs/',
      },
      {
        label: 'Standards Portal',
        href: getSiteUrl('portal', '/', env),
      },
    ],
  } : {
    title: 'Docs',
    items: [
      {
        label: 'Standards Portal',
        href: getSiteUrl('portal', '/', env),
      },
      {
        label: 'Introduction',
        to: '/docs/intro',
      },
      {
        label: 'Elements',
        to: '/docs/elements',
      },
      {
        label: 'Examples',
        to: '/docs/examples',
      },
    ],
  };

  return {
    style: 'dark',
    logo: {
      alt: 'IFLA Logo',
      src: 'img/logo-ifla_black.png',
      href: 'https://www.ifla.org',
      width: 160,
      height: 51,
    },
    links: [
      docsSection,
      {
        title: 'Standards',
        items: [
          {
            label: 'ISBD',
            href: getSiteUrl('isbd', '/', env),
          },
          {
            label: 'LRM',
            href: getSiteUrl('LRM', '/', env),
          },
          {
            label: 'UNIMARC',
            href: getSiteUrl('unimarc', '/', env),
          },
          {
            label: 'ISBDM',
            href: getSiteUrl('ISBDM', '/', env),
          },
          {
            label: 'FR Family',
            href: getSiteUrl('FRBR', '/', env),
          },
          {
            label: 'Muldicat',
            href: getSiteUrl('muldicat', '/', env),
          },
        ],
      },
      {
        title: 'Resources',
        items: [
          {
            label: 'RDF Downloads',
            to: '/rdf/',
          },
          {
            label: 'Vocabulary Server',
            href: getSiteUrl('portal', '/', env).replace(/\/portal\/$/, '/'), // Root URL for vocab server
          },
          {
            label: 'IFLA Website',
            href: 'https://www.ifla.org/',
          },
          {
            label: 'IFLA Standards',
            href: 'https://www.ifla.org/programmes/ifla-standards/',
          },
          ...additionalResourceLinks,
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
          {
            label: 'Sitemap',
            to: '/sitemap',
          },
        ],
      },
    ],
    copyright: `<div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
      <div>Copyright © ${new Date().getFullYear()} <a href="https://www.ifla.org" style="color: inherit;">International Federation of Library Associations and Institutions (IFLA)</a></div>
      <div style="display: flex; align-items: center; gap: 10px; margin-top: 10px;">
        <span>Built with</span>
        <a href="https://docusaurus.io" style="color: inherit;">Docusaurus</a>
      </div>
    </div>`,
  };
}

/**
 * Build complete theme configuration
 */
export function buildThemeConfig(
  title: string,
  siteKey: SiteKey,
  env: DocsEnv,
  customNavbarItems: NavbarItem[] = [],
  navigation: IFLANavigationOptions = {},
  footer: IFLAFooterOptions = {},
  prismTheme?: any,
  prismDarkTheme?: any,
  enableMermaid?: boolean
): any {
  const themeConfig: any = {
    // Color mode configuration
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },

    // Docs configuration
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
      versionPersistence: 'localStorage',
    },

    // Table of contents
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 5,
    },

    // Social card
    image: 'img/docusaurus-social-card.jpg',

    // Announcement bar
    announcementBar: {
      id: 'support_us',
      content: '⭐️ This is an active development site for IFLA standards ⭐️',
      backgroundColor: '#fafbfc',
      textColor: '#091E42',
      isCloseable: false,
    },

    // Prism configuration for code highlighting
    prism: {
      theme: prismTheme || { plain: {}, styles: [] },
      darkTheme: prismDarkTheme || { plain: {}, styles: [] },
      additionalLanguages: ['bash', 'diff', 'json'],
    },

    // Navbar configuration
    navbar: buildNavbarConfig(title, siteKey, env, customNavbarItems, navigation),

    // Footer configuration
    footer: buildFooterConfig(env, footer, siteKey),
  };

  // Add mermaid configuration if enabled
  if (enableMermaid) {
    themeConfig.mermaid = {
      theme: { light: 'default', dark: 'dark' },
      options: {
        maxTextSize: 50000,
      },
    };
  }

  return themeConfig;
}
