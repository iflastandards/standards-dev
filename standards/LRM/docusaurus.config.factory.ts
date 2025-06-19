import { createStandardSiteConfig } from '@ifla/theme/config';

const config = createStandardSiteConfig({
  siteKey: 'LRM',
  title: 'IFLA LRM',
  tagline: 'Library Reference Model',
  projectName: 'LRM',

  // LRM-specific vocabulary configuration
  vocabularyDefaults: {
    prefix: "lrm",
    numberPrefix: "E", // Override default "T" with "E" for LRM
    profile: "lrm-values-profile.csv",
    elementDefaults: {
      uri: "https://www.iflastandards.info/LRM/elements",
      profile: "lrm-elements-profile.csv",
    }
  },

  // GitHub configuration
  editUrl: 'https://github.com/iflastandards/LRM/tree/main/',

  // Custom navbar items (will be merged with standard items)
  navbar: {
    items: [
      {
        type: 'doc',
        docId: 'intro/intro',
        position: 'left',
        label: 'Introduction',
      },
    ],
  },

  // Navigation customization
  navigation: {
    hideCurrentSiteFromStandardsDropdown: true,
    standardsDropdownPosition: 'right',
    includeResourcesDropdown: false,
  },

  // Footer customization
  footer: {
    additionalResourceLinks: [], // Can add more later
  },

  // Enable redirects
  redirects: {
    redirects: [],
    createRedirects: (_existingPath: string) => undefined,
  },
});

export default config;
