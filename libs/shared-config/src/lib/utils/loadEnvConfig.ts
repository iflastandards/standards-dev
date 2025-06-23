import type { EnvConfig } from '../types';

/**
 * Helper function to validate that required environment variables are present
 * This should be called from the site's docusaurus.config.ts after loading env vars
 * 
 * @param envVars - The environment variables object
 * @param siteKey - The site key for error messages
 */
export function validateEnvConfig(envVars: Record<string, string | undefined>, siteKey: string): EnvConfig {
  // Validate required environment variables
  const required = ['SITE_URL', 'SITE_BASE_URL', 'SITE_TITLE', 'SITE_TAGLINE'];
  for (const key of required) {
    if (!envVars[key]) {
      throw new Error(`Missing required environment variable: ${key} for site: ${siteKey}`);
    }
  }
  
  return envVars as EnvConfig;
}

/**
 * Get the environment name for loading environment files
 * Checks DOCS_ENV first (for compatibility), then falls back to NODE_ENV
 * Maps environment values to our environment file names
 */
export function getEnvironmentName(): string {
  // First check DOCS_ENV (for compatibility with legacy system)
  const docsEnv = process.env['DOCS_ENV'];
  if (docsEnv) {
    const docsEnvMap: Record<string, string> = {
      'local': 'local',      // DOCS_ENV=local maps to 'local' environment files
      'localhost': 'local',  // DocsEnv.Localhost also maps to 'local' environment files
      'preview': 'preview', 
      'dev': 'development',
      'production': 'production',
    };
    if (docsEnvMap[docsEnv]) {
      return docsEnvMap[docsEnv];
    }
    // Throw error for invalid DOCS_ENV values
    throw new Error(`Invalid DOCS_ENV value: '${docsEnv}'. Expected one of: ${Object.keys(docsEnvMap).join(', ')}`);
  }
  
  // Fallback to NODE_ENV mapping
  const nodeEnvMap: Record<string, string> = {
    'development': 'development',
    'production': 'production',
    'test': 'local',
  };
  
  const nodeEnv = process.env['NODE_ENV'] || 'production';
  return nodeEnvMap[nodeEnv] || 'production';
}