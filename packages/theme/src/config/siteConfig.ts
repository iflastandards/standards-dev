/**
 * Self-contained site configuration for all IFLA sites across all environments.
 * This is the single source of truth for site URLs and base paths.
 * Moved from shared-config.old to theme to eliminate cross-package dependencies.
 */

export type Environment = 'local' | 'preview' | 'development' | 'production';
export type SiteKey = 'portal' | 'ISBDM' | 'LRM' | 'FRBR' | 'isbd' | 'muldicat' | 'unimarc' | 'testsite' | 'newtest';

export interface SiteConfigEntry {
  url: string;
  baseUrl: string;
  port?: number; // Only for local environment
}

// Central configuration matrix - single source of truth
export const SITE_CONFIG: Record<SiteKey, Record<Environment, SiteConfigEntry>> = {
  portal: {
    local: { url: 'http://localhost:3000', baseUrl: '/', port: 3000 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/' },
  },
  ISBDM: {
    local: { url: 'http://localhost:3001', baseUrl: '/ISBDM/', port: 3001 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/ISBDM/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/ISBDM/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/ISBDM/' },
  },
  LRM: {
    local: { url: 'http://localhost:3002', baseUrl: '/LRM/', port: 3002 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/LRM/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/LRM/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/LRM/' },
  },
  FRBR: {
    local: { url: 'http://localhost:3003', baseUrl: '/FRBR/', port: 3003 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/FRBR/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/FRBR/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/FRBR/' },
  },
  isbd: {
    local: { url: 'http://localhost:3004', baseUrl: '/isbd/', port: 3004 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/isbd/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/isbd/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/isbd/' },
  },
  muldicat: {
    local: { url: 'http://localhost:3005', baseUrl: '/muldicat/', port: 3005 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/muldicat/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/muldicat/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/muldicat/' },
  },
  unimarc: {
    local: { url: 'http://localhost:3006', baseUrl: '/unimarc/', port: 3006 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/unimarc/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/unimarc/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/unimarc/' },
  },
  // Test sites for scaffolding
  testsite: {
    local: { url: 'http://localhost:3007', baseUrl: '/testsite/', port: 3007 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/testsite/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/testsite/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/testsite/' },
  },
  newtest: {
    local: { url: 'http://localhost:3008', baseUrl: '/newtest/', port: 3008 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/newtest/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/newtest/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/newtest/' },
  },
};

/**
 * Get the configuration for a specific site and environment.
 * This function creates a new object to avoid shared references when
 * multiple builds are running concurrently.
 * 
 * @param siteKey - The site identifier
 * @param env - The environment
 * @returns The site configuration
 * @throws Error if configuration is missing
 */
export function getSiteConfig(siteKey: SiteKey, env: Environment): SiteConfigEntry {
  const config = SITE_CONFIG[siteKey]?.[env];
  if (!config) {
    throw new Error(`Configuration missing for ${siteKey} in ${env}`);
  }
  // Return a new object to avoid shared references when multiple builds run concurrently
  return { ...config };
}

/**
 * Get all site configurations for a specific environment as a mapping object.
 * This is SSG-compatible as it returns a serializable object instead of a function.
 * This function creates new objects to avoid shared references when
 * multiple builds are running concurrently.
 * 
 * @param env - The environment (used only at build time)
 * @returns A mapping object of all site configurations for the environment
 */
export function getSiteConfigMap(env: Environment): Record<SiteKey, SiteConfigEntry> {
  const result: Record<SiteKey, SiteConfigEntry> = {} as Record<SiteKey, SiteConfigEntry>;

  (Object.keys(SITE_CONFIG) as SiteKey[]).forEach(siteKey => {
    const config = SITE_CONFIG[siteKey]?.[env];
    if (config) {
      // Create a new object to avoid shared references when multiple builds run concurrently
      result[siteKey] = { ...config };
    }
  });

  return result;
}
