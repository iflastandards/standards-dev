import type { Config } from '@docusaurus/types';
import preset from '../../packages/preset-ifla/dist/index.js';

const config: Config = {
  ...preset({}, {
    siteKey: 'FRBR',
    title: 'IFLA FR Family of Models',
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