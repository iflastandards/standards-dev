// packages/theme/src/config/siteConfig.ts

import { DocsEnv, type SiteKey, sites } from './siteConfigCore';

// Re-export types for external consumption
export type { SiteKey } from './siteConfigCore';

/**
 * Generates a full URL to a page on a specified IFLA Docusaurus site for a given environment.
 * This is a pure function that requires the environment to be explicitly passed.
 * 
 * @param toSiteKey The key of the target site (e.g., 'LRM', 'portal').
 * @param path The path to the page on the target site (e.g., '/introduction', 'docs/main'). Defaults to ''.
 * @param targetEnv The deployment environment for which to generate the URL (required).
 * @returns The full URL string, or '#' if the configuration for the site/env is not found.
 */
export function getSiteUrl(
  toSiteKey: SiteKey,
  path: string = '',
  targetEnv: DocsEnv | string,
): string {
  // Map 'local' to 'localhost' for environment compatibility
  const resolvedEnv = targetEnv === 'local' ? DocsEnv.Localhost : targetEnv;

  // Validate environment
  if (!resolvedEnv || !Object.values(DocsEnv).includes(resolvedEnv as DocsEnv)) {
    return `#ERROR_INVALID_ENV_${resolvedEnv}_FOR_${toSiteKey}`;
  }

  const siteConfig = sites[toSiteKey]?.[resolvedEnv as DocsEnv];

  if (!siteConfig) {
    return '#ERROR_SITE_CONFIG_NOT_FOUND';
  }

  const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
  const fullPath = `${siteConfig.baseUrl}${normalizedPath}`;
  return `${siteConfig.url}${fullPath}`;
}
