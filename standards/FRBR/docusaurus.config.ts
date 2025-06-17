import { createStandardSiteConfig } from '@ifla/theme/config';

const config = createStandardSiteConfig({
  siteKey: 'FRBR',
  title: 'IFLA FRBR Family of Models',
  tagline: 'Conceptual Models for Bibliographic Information',
  projectName: 'FRBR',

  // FRBR-specific vocabulary configuration
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
  editUrl: 'https://github.com/iflastandards/FRBR/tree/main/',

  // Navigation customization
  navigation: {
    hideCurrentSiteFromStandardsDropdown: true,
    standardsDropdownPosition: 'right',
    includeResourcesDropdown: false,
  },

  // Footer customization
  footer: {
    useResourcesInsteadOfSites: true,
    additionalResourceLinks: [],
  },
});

export default config;
