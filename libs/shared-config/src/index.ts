// Main exports for shared-config library
export * from './lib/createBaseConfig';
export * from './lib/createThemeConfig';
export * from './lib/createPluginConfig';
export * from './lib/createFooterConfig';
export { 
  createIFLAPlugins, 
  createDevelopmentPlugins, 
  createProductionPlugins,
  type IFLAPluginOptions 
} from './lib/createPresetConfig';
export * from './lib/createPresetConfigClassic';
export * from './lib/createStandardsFooter';
export * from './lib/createVocabularyConfig';
export * from './lib/createStaticDirectories';
export * from './lib/createStandardsNavbar';
// Environment configuration utilities removed - sites now use direct DOCS_ENV access
export * from './lib/types';
export { default as defaults } from './lib/defaults.json';

// Site configuration exports
export { 
  getSiteConfig,
  type Environment,
  type SiteKey,
  type SiteConfigEntry,
  SITE_CONFIG 
} from './lib/siteConfig';