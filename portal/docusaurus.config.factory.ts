import type { Config } from '@docusaurus/types';
import preset from '../packages/preset-ifla/dist/index.js';
import { SiteConfigBuilder } from '../packages/theme/dist/index.js';
import navbarItems from './navbar';

// Use the SiteConfigBuilder function to dynamically resolve configuration
// This prevents any build-time caching contamination between sites
const configData = SiteConfigBuilder({
  siteKey: 'portal',
  hideCurrentSiteFromDropdown: false,
  hideDefaultResourceLinks: true
});

const { url, baseUrl, env, standardsDropdownItems, footerLinks } = configData;

// Build navbar configuration using standard Docusaurus format
const navbar = {
  title: 'IFLA Standards Portal',
  logo: {
    alt: 'IFLA Logo',
    src: 'img/logo-ifla_black.png',
  },
  items: [
    {
      type: 'doc',
      position: 'left' as const,
      docId: 'index',
      label: 'Documentation',
    },
    ...navbarItems,
    {
      type: 'dropdown' as const,
      label: 'Standards',
      position: 'right' as const,
      items: standardsDropdownItems,
    },
    { to: '/blog', label: 'Blog', position: 'right' as const },
    {
      type: 'docsVersionDropdown' as const,
      position: 'right' as const,
    },
    {
      type: 'localeDropdown' as const,
      position: 'right' as const,
    },
    {
      type: 'search' as const,
      position: 'right' as const,
    }
  ],
};

// Build footer configuration using standard Docusaurus format
const footer = {
  style: 'dark' as const,
  logo: {
    alt: 'IFLA Logo',
    src: 'img/logo-ifla_black.png',
    href: 'https://www.ifla.org',
    width: 160,
    height: 51,
  },
  links: [
    {
      title: 'Docs',
      items: footerLinks.docsLinks,
    },
    {
      title: 'Standards',
      items: footerLinks.standardsLinks,
    },
    {
      title: 'Resources',
      items: [
        ...footerLinks.resourceLinks,
        {
          label: 'GitHub Repository',
          href: 'https://github.com/iflastandards/standards-dev',
        },
      ],
    },
    {
      title: 'More',
      items: footerLinks.moreLinks,
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

const presetConfig = preset(undefined as any, {
  siteKey: 'portal',
  title: 'IFLA Standards Portal',
  tagline: 'International Federation of Library Associations and Institutions',
  url,
  baseUrl,
  env,

  // Portal-specific vocabulary configuration (minimal since portal doesn't have RDF content)
  vocabularyDefaults: {
    prefix: "ifla",
    numberPrefix: "T",
    profile: "vocabulary-profile.csv",
    elementDefaults: {
      uri: "https://www.iflastandards.info/elements",
      profile: "elements-profile.csv",
    }
  },

  // GitHub configuration
  editUrl: 'https://github.com/iflastandards/standards-dev/tree/main/portal/',

  // Portal-specific overrides
  overrides: {
    onBrokenAnchors: 'ignore',
    staticDirectories: ['static', '../packages/theme/static'],
  },
});

const config: Config = {
  ...presetConfig,
  // Override themeConfig with our custom navbar and footer
  themeConfig: {
    ...presetConfig.themeConfig,
    navbar,
    footer,
  },
};

export default config;