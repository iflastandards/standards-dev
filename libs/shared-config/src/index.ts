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
export * from './lib/utils/loadEnvConfig';
export * from './lib/utils/getSiteUrl';
export * from './lib/types';
export { default as defaults } from './lib/defaults.json';