import type { Config } from '@docusaurus/types';
import preset, { getSiteConfig } from '../../packages/preset-ifla/dist/index.js';
import navbarItems from './navbar';

// Get site URLs based on environment
const { url, baseUrl, env } = getSiteConfig('LRM');

const config: Config = {
  ...preset({}, {
    siteKey: 'LRM',
    title: 'IFLA LRM',
    tagline: 'Library Reference Model',
    url,
    baseUrl,
    env,
    
    // LRM-specific vocabulary configuration  
    vocabularyDefaults: {
      prefix: "lrm",
      startCounter: 1000,
      uriStyle: "numeric",
      numberPrefix: "E", 
      caseStyle: "kebab-case",
      showFilter: true,
      filterPlaceholder: "Filter vocabulary terms...",
      showTitle: false,
      showURIs: true,
      showCSVErrors: false,
      profile: "lrm-values-profile.csv",
      profileShapeId: "Concept",
      RDF: {
        "rdf:type": ["skos:ConceptScheme"]
      },
      elementDefaults: {
        uri: "https://www.iflastandards.info/LRM/elements",
        classPrefix: "C",
        propertyPrefix: "P", 
        profile: "lrm-elements-profile.csv",
        profileShapeId: "Element",
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

    // GitHub edit URL
    editUrl: 'https://github.com/iflastandards/LRM/tree/main/',
  })
};

export default config;