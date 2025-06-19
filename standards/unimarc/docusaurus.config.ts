import type { Config } from '@docusaurus/types';
import preset from '../../packages/preset-ifla/dist/index.js';

const config: Config = {
  ...preset({}, {
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