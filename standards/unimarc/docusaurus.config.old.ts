import type { Config } from '@docusaurus/types';
import preset, { getSiteConfig } from '../../packages/preset-ifla/dist/index.js';
import navbarItems from './navbar';

// Get site URLs based on environment
const { url, baseUrl, env } = getSiteConfig('unimarc');

const config: Config = {
  ...preset(undefined as any, {
    siteKey: 'unimarc',
    title: 'IFLA UNIMARC',
    tagline: 'Universal MARC Format',
    url,
    baseUrl,
    env,

    // UNIMARC-specific vocabulary configuration
    vocabularyDefaults: {
      prefix: "ifla",
      numberPrefix: "T",
      profile: "vocabulary-profile.csv",
      elementDefaults: {
        uri: "https://www.iflastandards.info/elements",
        classPrefix: "class",
        propertyPrefix: "prop",
        profile: "elements-profile.csv",
        profileShapeId: "ElementShape",
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
    editUrl: 'https://github.com/iflastandards/UNIMARC/tree/main/',
  })
};

export default config;