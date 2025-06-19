import { createStandardSiteConfig } from '@ifla/theme/config';

const config = createStandardSiteConfig({
  siteKey: 'portal',
  title: 'IFLA Standards Portal',
  tagline: 'International Federation of Library Associations and Institutions',
  projectName: 'standards-portal',

  // Portal-specific vocabulary configuration (minimal since portal doesn't have RDF content)
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
  editUrl: 'https://github.com/iflastandards/standards-dev/tree/main/portal/',

  // Portal-specific overrides
  overrides: {
    onBrokenAnchors: 'ignore', // Changed from default 'warn'
    staticDirectories: ['static', '../packages/theme/static'],
  },

  // Custom navbar items for portal
  navbar: {
    items: [
      {
        type: 'docSidebar',
        sidebarId: 'tutorialSidebar',
        position: 'left',
        label: 'Documentation',
      },
      {to: '/blog', label: 'Blog', position: 'left'},
      {
        to: '/manage',
        label: 'Management',
        position: 'left',
        className: 'navbar__item--management',
      },
    ],
  },

  // Navigation customization for portal
  navigation: {
    hideCurrentSiteFromStandardsDropdown: false, // Portal should show all standards including itself
    standardsDropdownPosition: 'right',
    includeResourcesDropdown: false, // Portal has its own management interface
    includeDocumentationItem: false, // Portal has custom documentation structure
  },

  // Footer customization for portal
  footer: {
    additionalResourceLinks: [
      {
        label: 'Vocabulary Server',
        href: 'https://iflastandards.info/',
      },
      {
        label: 'GitHub Repository',
        href: 'https://github.com/iflastandards/standards-dev',
      },
    ],
  },
});

export default config;
