import type { Config } from '@docusaurus/types';
import preset, { getSiteConfig } from '../packages/preset-ifla/dist/index.js';
import navbarItems from './navbar';

// Get site URLs based on environment
const { url, baseUrl, env } = getSiteConfig('portal');

const config: Config = {
  ...preset({}, {
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

    // Custom navbar items
    customNavbarItems: navbarItems,

    // Navigation customization for portal
    navigation: {
      hideCurrentSiteFromStandardsDropdown: false, // Portal should show all standards including itself
      standardsDropdownPosition: 'right',
      includeResourcesDropdown: false, // Portal has its own management interface
      includeDocumentationItem: false, // Portal has custom documentation structure
    },

    // Footer customization for portal
    footer: {
      additionalResourceLinks: [
        {
          label: 'Vocabulary Server',
          href: 'https://iflastandards.info/',
        },
        {
          label: 'GitHub Repository',
          href: 'https://github.com/iflastandards/standards-dev',
        },
      ],
    },

    // GitHub configuration
    editUrl: 'https://github.com/iflastandards/standards-dev/tree/main/portal/',

    // Portal-specific overrides
    overrides: {
      onBrokenAnchors: 'ignore', // Changed from default 'warn'
      staticDirectories: ['static', '../packages/theme/static'],
    },
  })
};

export default config;