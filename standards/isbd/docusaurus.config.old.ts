import type { Config } from '@docusaurus/types';
import preset, { getSiteConfig } from '../../packages/preset-ifla/dist/index.js';
import navbarItems from './navbar';

// Get site URLs based on environment
const { url, baseUrl, env } = getSiteConfig('isbd');

const config: Config = {
  ...preset(undefined as any, {
    siteKey: 'isbd',
    title: 'ISBD: International Standard Bibliographic Description',
    tagline: 'Consolidated Edition',
    url,
    baseUrl,
    env,

    // ISBD-specific vocabulary configuration
    vocabularyDefaults: {
      prefix: "isbd",
      numberPrefix: "T",
      profile: "isbd-values-profile.csv",
      elementDefaults: {
        uri: "https://www.iflastandards.info/ISBD/elements",
        classPrefix: "class",
        propertyPrefix: "prop",
        profile: "isbd-elements-profile.csv",
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
    editUrl: 'https://github.com/iflastandards/ISBD/tree/main/',
  })
};

export default config;