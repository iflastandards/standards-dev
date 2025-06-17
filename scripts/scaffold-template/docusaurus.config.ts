import { createStandardSiteConfig } from '@ifla/theme/config';

const config = createStandardSiteConfig({
  siteKey: '__CODE__',
  title: '__TITLE__',
  tagline: '__TAGLINE__',
  projectName: '__CODE__',

  // __CODE__-specific vocabulary configuration
  vocabularyDefaults: {
    prefix: "__PREFIX__",
    numberPrefix: "__NUMBER_PREFIX__",
    profile: "__PROFILE__",
    elementDefaults: {
      uri: "__ELEMENTS_URI__",
      profile: "__ELEMENTS_PROFILE__",
    }
  },

  // GitHub configuration
  editUrl: '__EDIT_URL__',

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
