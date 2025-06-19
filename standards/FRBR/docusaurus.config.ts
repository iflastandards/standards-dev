import type { Config } from '@docusaurus/types';
import preset, { getSiteConfig } from '../../packages/preset-ifla/dist/index.js';
import navbarItems from './navbar';

// Get site URLs based on environment
const { url, baseUrl, env } = getSiteConfig('frbr');

const config: Config = {
  ...preset(undefined as any, {
    siteKey: 'frbr',
    title: 'IFLA FR Family of Models',
    tagline: 'Conceptual Models for Bibliographic Information',
    url,
    baseUrl,
    env,

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

    // Custom navbar items
    customNavbarItems: navbarItems,

    // Navigation customization
    navigation: {
      hideCurrentSiteFromStandardsDropdown: true,
      standardsDropdownPosition: 'right',
      includeResourcesDropdown: false,
    },

    // GitHub configuration
    editUrl: 'https://github.com/iflastandards/FRBR/tree/main/',
  })
};

export default config;