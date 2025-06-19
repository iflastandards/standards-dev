/**
 * Utilities for the IFLA preset
 */

import { SiteKey, DocsEnv, VocabularyDefaults } from './types';

// Simple site configuration lookup by siteId and environment
const SITE_URLS: Record<string, Record<DocsEnv, { url: string; baseUrl: string }>> = {
  portal: {
    [DocsEnv.Localhost]: { url: 'http://localhost:3000', baseUrl: '/portal/' },
    [DocsEnv.Preview]: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/' },
    [DocsEnv.Production]: { url: 'https://iflastandards.info', baseUrl: '/' },
  },
  isbdm: {
    [DocsEnv.Localhost]: { url: 'http://localhost:3001', baseUrl: '/ISBDM/' },
    [DocsEnv.Preview]: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/isbdm/' },
    [DocsEnv.Production]: { url: 'https://iflastandards.info', baseUrl: '/ISBDM/' },
  },
  lrm: {
    [DocsEnv.Localhost]: { url: 'http://localhost:3002', baseUrl: '/LRM/' },
    [DocsEnv.Preview]: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/lrm/' },
    [DocsEnv.Production]: { url: 'https://iflastandards.info', baseUrl: '/LRM/' },
  },
  frbr: {
    [DocsEnv.Localhost]: { url: 'http://localhost:3003', baseUrl: '/FRBR/' },
    [DocsEnv.Preview]: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/FRBR/' },
    [DocsEnv.Production]: { url: 'https://iflastandards.info', baseUrl: '/FRBR/' },
  },
  isbd: {
    [DocsEnv.Localhost]: { url: 'http://localhost:3004', baseUrl: '/isbd/' },
    [DocsEnv.Preview]: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/isbd/' },
    [DocsEnv.Production]: { url: 'https://iflastandards.info', baseUrl: '/isbd/' },
  },
  muldicat: {
    [DocsEnv.Localhost]: { url: 'http://localhost:3005', baseUrl: '/muldicat/' },
    [DocsEnv.Preview]: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/muldicat/' },
    [DocsEnv.Production]: { url: 'https://iflastandards.info', baseUrl: '/muldicat/' },
  },
  unimarc: {
    [DocsEnv.Localhost]: { url: 'http://localhost:3006', baseUrl: '/unimarc/' },
    [DocsEnv.Preview]: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/unimarc/' },
    [DocsEnv.Production]: { url: 'https://iflastandards.info', baseUrl: '/unimarc/' },
  },
};

/**
 * Get the current environment from process.env
 */
export function getCurrentEnv(): DocsEnv {
  const docsEnv = process.env.DOCS_ENV?.toLowerCase();
  const nodeEnv = process.env.NODE_ENV?.toLowerCase();
  
  if (docsEnv === 'localhost' || docsEnv === 'development' || nodeEnv === 'development') {
    return DocsEnv.Localhost;
  } else if (docsEnv === 'preview' || docsEnv === 'staging') {
    return DocsEnv.Preview;
  } else {
    return DocsEnv.Production;
  }
}

/**
 * Get site URLs for a specific site and environment
 */
export function getSiteUrls(siteKey: SiteKey, env?: DocsEnv): { url: string; baseUrl: string } {
  const resolvedEnv = env ?? getCurrentEnv();
  const normalizedSiteKey = siteKey.toLowerCase();
  
  const siteConfig = SITE_URLS[normalizedSiteKey]?.[resolvedEnv];
  
  if (!siteConfig) {
    throw new Error(`No configuration found for site '${siteKey}' in environment '${resolvedEnv}'`);
  }
  
  return siteConfig;
}

/**
 * Get site configuration for use in docusaurus.config.ts
 * Call this function at the top of your site config to get url and baseUrl
 */
export function getSiteConfig(siteKey: SiteKey): { url: string; baseUrl: string; env: DocsEnv } {
  const env = getCurrentEnv();
  const config = getSiteUrls(siteKey, env);
  return {
    ...config,
    env,
  };
}

/**
 * Build a complete URL for a site and path
 */
export function getSiteUrl(siteKey: SiteKey, path: string = '/', env?: DocsEnv): string {
  const { url, baseUrl } = getSiteUrls(siteKey, env);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${url}${cleanBaseUrl}${cleanPath.slice(1)}`.replace(/\/+/g, '/').replace(/\/$/, '') || url;
}

/**
 * Generic vocabulary defaults that can be used as a base
 */
export const GENERIC_VOCABULARY_DEFAULTS: VocabularyDefaults = {
  prefix: "ifla",
  startCounter: 1000,
  uriStyle: "numeric",
  numberPrefix: "T",
  caseStyle: "kebab-case",
  showFilter: true,
  filterPlaceholder: "Filter vocabulary terms...",
  showTitle: false,
  showURIs: true,
  showCSVErrors: false,
  profile: "vocabulary-profile.csv",
  profileShapeId: "Concept",
  RDF: {
    "rdf:type": ["skos:ConceptScheme"]
  },
  elementDefaults: {
    uri: "https://www.iflastandards.info/elements",
    classPrefix: "C",
    propertyPrefix: "P",
    profile: "elements-profile.csv",
    profileShapeId: "Element",
  }
};

/**
 * Merge vocabulary defaults with user overrides
 * No longer uses site-specific defaults - each site must specify its own
 */
export function mergeVocabularyDefaults(
  overrides: Partial<VocabularyDefaults> = {}
): VocabularyDefaults {
  // Use generic defaults as base if no overrides provided
  const baseDefaults = overrides ? GENERIC_VOCABULARY_DEFAULTS : GENERIC_VOCABULARY_DEFAULTS;
  
  return {
    ...baseDefaults,
    ...overrides,
    // Deep merge elementDefaults if provided
    elementDefaults: {
      ...baseDefaults.elementDefaults,
      ...(overrides.elementDefaults || {})
    },
    // Deep merge RDF if provided  
    RDF: {
      ...baseDefaults.RDF,
      ...(overrides.RDF || {})
    }
  };
}