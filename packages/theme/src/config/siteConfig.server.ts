import { DocsEnv, type SiteKey, sites } from './siteConfigCore';

/**
 * Determines the current deployment environment based on `process.env.DOCS_ENV`,
 * with a fallback to `process.env.NODE_ENV` for local development.
 * This function is intended for server-side use (e.g., in Docusaurus configuration files).
 * It should NOT be imported into any client-side components.
 */
export function getCurrentEnv(): DocsEnv {
  const docsEnv = process.env.DOCS_ENV;

  // Map DOCS_ENV values to DocsEnv enum values
  if (docsEnv) {
    const docsEnvMap: Record<string, DocsEnv> = {
      'local': DocsEnv.Localhost,
      'localhost': DocsEnv.Localhost,
      'preview': DocsEnv.Preview,
      'dev': DocsEnv.Dev,
      'production': DocsEnv.Production,
    };
    
    if (docsEnvMap[docsEnv]) {
      return docsEnvMap[docsEnv];
    }
  }

  // Fallback to NODE_ENV if DOCS_ENV is not set or invalid
  const nodeEnv = process.env.NODE_ENV;

  if (nodeEnv === 'development') {
    return DocsEnv.Localhost;
  }

  return DocsEnv.Production;
}

/**
 * Retrieves the Docusaurus configuration (url, baseUrl, port) for a given site and the current environment.
 * This is intended for use in `docusaurus.config.js` of each site.
 * @param siteKey The key of the site for which to get the Docusaurus config.
 * @returns An object containing the `url`, `baseUrl`, and `port` for the site in the current environment.
 */
export const getSiteDocusaurusConfigWithOptions = (siteKey: SiteKey): { url: string; baseUrl: string; port?: number } => {
  const currentEnv = getCurrentEnv();
  const site = sites[siteKey]?.[currentEnv];
  if (!site) {
    throw new Error(`Configuration for site '${siteKey}' in environment '${currentEnv}' not found.`);
  }
  return { url: site.url, baseUrl: site.baseUrl, port: site.port };
};
