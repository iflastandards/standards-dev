// Configuration exports for IFLA theme

export {
  default as createIFLAConfig,
  VOCABULARY_DEFAULTS
} from './docusaurus.base';

export * from './siteConfigCore';
export { getSiteUrl, getSiteDocusaurusConfig } from './siteConfig';
export { getCurrentEnv, getSiteDocusaurusConfigWithOptions } from './siteConfig.server';
export {
  sharedThemeConfig,
  sharedPlugins,
  sharedThemes,
  baseDocusaurusConfig as commonDefaults,
  standardsDropdown
  // Removed staticBaseSettings from here, assuming it's not part of the public API
} from './docusaurus';

export {
  default as defaultSidebars,
  applySidebarLevels,
  createIFLASidebar,
  mergeSidebars,
  generateElementItems,
  generateRelationshipStructure
} from './sidebars.default';

// Export the new factory function
export { createStandardSiteConfig } from './standardSiteFactory';

export type { IFLAThemeConfig } from '../types';
