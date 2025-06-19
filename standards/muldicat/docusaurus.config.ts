import type { Config } from '@docusaurus/types';
import preset from '../../packages/preset-ifla/dist/index.js';

const config: Config = {
  ...preset({}, {
    siteKey: 'muldicat',
    title: 'MulDiCat',
    tagline: 'Multilingual Dictionary of Cataloguing Terms and Concepts',
    projectName: 'MULDICAT',

    // MulDiCat-specific vocabulary configuration
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
    customNavbarItems: [
      {
        type: 'doc',
        docId: 'intro',
        position: 'left',
        label: 'Introduction',
      },
    ],

    // Navigation customization
    navigation: {
      hideCurrentSiteFromStandardsDropdown: true,
      standardsDropdownPosition: 'right',
      includeResourcesDropdown: false,
    },

    // GitHub configuration
    editUrl: 'https://github.com/iflastandards/muldicat/tree/main/',

    // Enable redirects
    redirects: {
      createRedirects: (_existingPath: string) => undefined,
    },
  })
};

export default config;