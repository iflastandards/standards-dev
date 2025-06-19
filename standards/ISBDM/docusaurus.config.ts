import type { Config } from '@docusaurus/types';
import preset from '../../packages/preset-ifla/dist/index.js';

const config: Config = {
  ...preset({}, {
    siteKey: 'ISBDM',
    title: 'ISBD for Manifestation',
    tagline: 'International Standard Bibliographic Description for Manifestation',
    projectName: 'ISBDM',

    // ISBDM-specific vocabulary configuration
    vocabularyDefaults: {
      prefix: "isbdm",
      numberPrefix: "T",
      profile: "isbdm-values-profile-revised.csv",
      elementDefaults: {
        uri: "https://www.iflastandards.info/ISBDM/elements",
        profile: "isbdm-elements-profile.csv",
      }
    },

    // Custom navbar items (replacing default Documentation item)
    customNavbarItems: [
      {
        type: 'dropdown',
        label: 'Instructions',
        position: 'left',
        items: [
          {
            type: 'doc',
            docId: 'intro/index',
            label: 'Introduction',
          },
          {
            type: 'doc',
            docId: 'assess/index',
            label: 'Assessment',
          },
          {
            type: 'doc',
            docId: 'glossary/index',
            label: 'Glossary',
          },
          {
            type: 'doc',
            docId: 'fullex/index',
            label: 'Examples',
          },
        ],
      },
      {
        type: 'dropdown',
        label: 'Elements',
        position: 'left',
        items: [
          {
            type: 'doc',
            docId: 'statements/index',
            label: 'Statements',
          },
          {
            type: 'doc',
            docId: 'notes/index',
            label: 'Notes',
          },
          {
            type: 'doc',
            docId: 'attributes/index',
            label: 'Attributes',
          },
          {
            type: 'doc',
            docId: 'relationships/index',
            label: 'Relationships',
          },
        ],
      },
      {
        type: 'dropdown',
        position: 'left',
        label: 'Values',
        items: [
          {
            type: 'doc',
            docId: 'ves/index',
            label: 'Value Vocabularies',
          },
          {
            type: 'doc',
            docId: 'ses/index',
            label: 'String Encodings Schemes',
          },
        ]
      },
      {
        type: 'doc',
        docId: 'manage',
        label: 'Management',
        position: 'left',
        className: 'navbar__item--management',
      },
      {
        type: 'dropdown',
        label: 'About',
        position: 'right',
        items: [
          {
            type: 'doc',
            docId: 'about/index',
            label: 'About ISBDM',
          },
          {
            type: 'doc',
            docId: 'about/docusaurus-for-ifla',
            label: 'Modern Documentation Platform',
          },
        ],
      },
    ],

    // Navigation customization
    navigation: {
      hideCurrentSiteFromStandardsDropdown: true,
      standardsDropdownPosition: 'right',
      includeResourcesDropdown: false,
      includeDocumentationItem: false, // ISBDM has custom navigation structure
    },

    // Footer customization
    footer: {
      additionalResourceLinks: [],
    },

    // GitHub configuration
    editUrl: 'https://github.com/iflastandards/ISBDM/tree/main/',

    // Override settings for ISBDM
    overrides: {
      onBrokenLinks: 'ignore', // Override: ignore generated element links
      onBrokenAnchors: 'ignore', // Override: ignore generated anchor links
    },

    // Custom redirects for ISBDM
    redirects: {
      redirects: [],
      createRedirects: (existingPath: string) => {
        // Only process element paths - be very specific to avoid interfering with other routes
        // This regex specifically matches element paths with numeric IDs only
        const elementMatch = existingPath.match(/^\/docs\/(attributes|statements|notes|relationships)\/(\d+)$/);
        if (elementMatch) {
          const elementId = elementMatch[2];
          // Only create redirect if it's a valid numeric element ID
          if (/^\d+$/.test(elementId)) {
            return [`/docs/elements/${elementId}`];
          }
        }
        // Don't redirect anything else - this prevents interference with other routes
        return undefined;
      },
    },

    // Custom sidebar generator to filter index.mdx files
    customSidebarGenerator: false, // Use preset's default generator
  })
};

export default config;
