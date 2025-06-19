import type { Config } from '@docusaurus/types';
import preset from '../../packages/preset-ifla/dist/index.js';

const config: Config = {
  ...preset({}, {
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