import { createStandardSiteConfig } from '@ifla/theme/config';

const config = createStandardSiteConfig({
  siteKey: 'muldicat',
  title: 'MulDiCat: RDA to MARC21 and UNIMARC',
  tagline: 'MulDiCat: RDA to MARC21 and UNIMARC',
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

  // GitHub configuration
  editUrl: 'https://github.com/iflastandards/muldicat/tree/main/',

  // Custom navbar items
  navbar: {
    items: [
      {
        type: 'doc',
        docId: 'intro',
        position: 'left',
        label: 'Introduction',
      },
    ],
  },

  // Navigation customization
  navigation: {
    hideCurrentSiteFromStandardsDropdown: true,
    standardsDropdownPosition: 'right',
    includeResourcesDropdown: false,
  },

  // Footer customization
  footer: {
    useResourcesInsteadOfSites: true,
    additionalResourceLinks: [],
  },

  // Enable redirects
  redirects: {
    redirects: [],
    createRedirects: (_existingPath: string) => undefined,
  },
});

export default config;
