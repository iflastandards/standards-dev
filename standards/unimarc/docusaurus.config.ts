import { createStandardSiteConfig } from '@ifla/theme/config';

const config = createStandardSiteConfig({
  siteKey: 'unimarc',
  title: 'IFLA UNIMARC',
  tagline: 'Universal MARC Format',
  projectName: 'UNIMARC',

  // UNIMARC-specific vocabulary configuration
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
  editUrl: 'https://github.com/iflastandards/UNIMARC/tree/main/',

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
