import type { Config } from '@docusaurus/types';
import preset, { getSiteConfig } from '../../packages/preset-ifla/dist/index.js';
import navbarItems from './navbar';

// Get site URLs based on environment
const { url, baseUrl, env } = getSiteConfig('__CODE__');

const config: Config = {
  ...preset({}, {
    siteKey: '__CODE__',
    title: '__TITLE__',
    tagline: '__TAGLINE__',
    url,
    baseUrl,
    env,

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
    customNavbarItems: navbarItems,

    // Navigation customization
    navigation: {
      hideCurrentSiteFromStandardsDropdown: true,
      standardsDropdownPosition: 'right',
      includeResourcesDropdown: false,
    },

    // GitHub configuration
    editUrl: '__EDIT_URL__',
  })
};

export default config;
