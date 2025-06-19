import type { Config } from '@docusaurus/types';
import preset, { getSiteConfig } from '../../packages/preset-ifla/dist/index.js';
import navbarItems from './navbar';

// Get site URLs based on environment
const { url, baseUrl, env } = getSiteConfig('muldicat');

const config: Config = {
  ...preset(undefined as any, {
    siteKey: 'muldicat',
    title: 'MulDiCat',
    tagline: 'Multilingual Dictionary of Cataloguing Terms and Concepts',
    url,
    baseUrl,
    env,

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
    customNavbarItems: navbarItems,

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