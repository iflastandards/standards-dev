import type { BaseConfigOptions } from './types';
import defaults from './defaults.json';

/**
 * Factory function to create base Docusaurus configuration
 * This is a pure function that returns a consistent configuration object
 */
export function createBaseConfig(options: BaseConfigOptions) {
  return {
    title: options.title,
    tagline: options.tagline,
    url: options.url,
    baseUrl: options.baseUrl,
    projectName: options.projectName,
    
    // Static values from defaults
    organizationName: defaults.organizationName,
    favicon: defaults.favicon,
    trailingSlash: defaults.trailingSlash,
    onBrokenLinks: defaults.onBrokenLinks as 'warn',
    onBrokenMarkdownLinks: defaults.onBrokenMarkdownLinks as 'warn',
    onBrokenAnchors: defaults.onBrokenAnchors as 'warn',
    onDuplicateRoutes: defaults.onDuplicateRoutes as 'warn',
    
    // Future flags for Docusaurus v4
    future: defaults.future,
    
    // i18n configuration
    i18n: defaults.i18n,
  };
}