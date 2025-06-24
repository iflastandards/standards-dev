// packages/theme/src/config/siteConfig.ts

import { DocsEnv, type SiteKey, sites } from './siteConfigCore';
import { getCurrentEnv } from './siteConfig.server';

// Re-export types for external consumption
export type { SiteKey } from './siteConfigCore';

/**
 * Generates a full URL to a page on a specified IFLA Docusaurus site, considering the target environment.
 * If `targetEnv` is not provided, it defaults to the current site's environment.
 * If `path` is an empty string, it links to the root of the `toSiteKey`.
 * Ensures that `baseUrl` is correctly handled, avoiding double slashes if `path` starts with one.
 * @param toSiteKey The key of the target site (e.g., 'LRM', 'portal').
 * @param path The path to the page on the target site (e.g., '/introduction', 'docs/main'). Defaults to ''.
 * @param targetEnv The deployment environment for which to generate the URL.
 * @returns The full URL string, or '#' if the configuration for the site/env is not found.
 */
export function getSiteUrl(
  toSiteKey: SiteKey,
  path = '',
  targetEnv: DocsEnv | string, // targetEnv is required, but can be a string
): string {
  let resolvedEnv = targetEnv;

  if (typeof targetEnv === 'undefined') {
    const fallbackEnv = getCurrentEnv();
    resolvedEnv = fallbackEnv;
  }

  // Map 'local' to 'localhost' for environment compatibility
  if (resolvedEnv === 'local') {
    resolvedEnv = DocsEnv.Localhost;
  }

  // Validate resolvedEnv (could be original targetEnv or fallbackEnv)
  if (!resolvedEnv || !Object.values(DocsEnv).includes(resolvedEnv as DocsEnv)) {
    return `#ERROR_INVALID_RESOLVED_ENV_FOR_${toSiteKey}`;
  }

  const siteConfig = sites[toSiteKey]?.[resolvedEnv as DocsEnv];

  if (!siteConfig) {
    return '#ERROR_SITE_CONFIG_NOT_FOUND';
  }

  const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
  const fullPath = `${siteConfig.baseUrl}${normalizedPath}`;
  return `${siteConfig.url}${fullPath}`;
}

/**
 * Retrieves the Docusaurus configuration (url, baseUrl) for a given site and the current environment.
 * This is intended for use in `docusaurus.config.js` of each site.
 * @param siteKey The key of the site for which to get the Docusaurus config.
 * @returns An object containing the `url` and `baseUrl` for the site in the current environment.
 */
export const getSiteDocusaurusConfig = (siteKey: SiteKey, currentEnv: DocsEnv | string): { url: string; baseUrl: string } => {
  // Map 'local' to 'localhost' for environment compatibility
  const resolvedEnv = currentEnv === 'local' ? DocsEnv.Localhost : currentEnv as DocsEnv;

  const site = sites[siteKey]?.[resolvedEnv as DocsEnv];
  if (!site) {
    throw new Error(`Configuration for site '${siteKey}' in environment '${currentEnv}' not found.`);
  }
  return { url: site.url, baseUrl: site.baseUrl };
};
