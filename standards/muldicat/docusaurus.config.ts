import { createStandardSiteConfig } from '@ifla/theme/config';

const config = createStandardSiteConfig({
  siteKey: 'muldicat',
  title: 'MulDiCat',
  tagline: 'Multilingual Dictionary of Cataloguing Terms and Concepts',
  projectName: 'MULDICAT',

  // MulDiCat-specific vocabulary configuration
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
  editUrl: 'https://github.com/iflastandards/muldicat/tree/main/',

  // Custom navbar items
  navbar: {
    items: [
      {
        type: 'doc',
        docId: 'intro',
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
    additionalResourceLinks: [],
  },

  // Enable redirects
  redirects: {
    redirects: [],
    createRedirects: (_existingPath: string) => undefined,
  },
});

export default config;
