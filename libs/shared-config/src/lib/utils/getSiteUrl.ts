import type { EnvConfig } from '../types';

/**
 * Build a complete URL from environment configuration and path
 * 
 * @param envConfig - Environment configuration containing SITE_URL and SITE_BASE_URL
 * @param path - The path to append (e.g., '/docs/intro')
 * @returns Complete URL
 */
export function buildSiteUrl(envConfig: EnvConfig, path: string = ''): string {
  const { SITE_URL, SITE_BASE_URL } = envConfig;
  
  // Normalize the path
  let normalizedPath = path;
  if (!normalizedPath.startsWith('/') && normalizedPath !== '') {
    normalizedPath = '/' + normalizedPath;
  }
  
  // Combine URL parts
  const baseUrl = SITE_BASE_URL.endsWith('/') ? SITE_BASE_URL : SITE_BASE_URL + '/';
  const fullPath = (baseUrl + normalizedPath).replace(/\/+/g, '/');
  
  // Ensure URL doesn't have trailing slash for paths
  const url = new URL(fullPath, SITE_URL);
  let pathname = url.pathname;
  
  // Remove trailing slash except for root paths
  if (pathname !== '/' && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  
  url.pathname = pathname;
  return url.toString();
}

/**
 * Helper to get the complete site URL
 * This is used by sites after they've loaded their environment variables
 */
export function getSiteUrl(url: string, baseUrl: string, path: string = ''): string {
  const envConfig: EnvConfig = {
    SITE_URL: url,
    SITE_BASE_URL: baseUrl,
    SITE_TITLE: '',
    SITE_TAGLINE: '',
  };
  return buildSiteUrl(envConfig, path);
}