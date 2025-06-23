import type { Config } from '@docusaurus/types';
import { createIFLAPlugins } from '@ifla/shared-config';
import { createStandardSiteConfig } from '@ifla/theme/config';
import navbarItems from './navbar';

const config: Config = createStandardSiteConfig({
  siteKey: '__CODE__' as any, // Template placeholder will be replaced during scaffolding
  title: '__TITLE__',
  tagline: '__TAGLINE__',

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

  // Custom navbar items
  navbar: {
    items: navbarItems,
  },

  // Navigation customization
  navigation: {
    hideCurrentSiteFromStandardsDropdown: true,
    standardsDropdownPosition: 'right',
    includeResourcesDropdown: false,
  },

  // GitHub configuration
  editUrl: '__EDIT_URL__',

  // Additional plugins - include standard IFLA plugins
  additionalPlugins: [
    ...createIFLAPlugins({
      enableIdealImage: true,
      enableLocalSearch: true,
    }),
  ],
});

export default config;
