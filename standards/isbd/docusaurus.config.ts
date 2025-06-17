import { createStandardSiteConfig } from '@ifla/theme/config';

const config = createStandardSiteConfig({
  siteKey: 'isbd',
  title: 'ISBD: International Standard Bibliographic Description',
  tagline: 'Consolidated Edition',
  projectName: 'isbd',

  // ISBD-specific vocabulary configuration
  vocabularyDefaults: {
    prefix: "isbd",
    numberPrefix: "T",
    profile: "isbd-values-profile.csv",
    elementDefaults: {
      uri: "https://www.iflastandards.info/ISBD/elements",
      profile: "isbd-elements-profile.csv",
    }
  },

  // GitHub configuration
  editUrl: 'https://github.com/iflastandards/ISBD/tree/main/',

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
});

export default config;
