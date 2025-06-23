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
 * Requires DOCS_ENV to be set to one of the valid values
 * Throws fatal error if DOCS_ENV is missing or invalid - nx should catch this and load from root .env
 */
export function getEnvironmentName(): string {
  const docsEnv = process.env['DOCS_ENV'];
  
  // DOCS_ENV is required - throw fatal error if missing
  if (!docsEnv) {
    throw new Error(
      `❌ FATAL: DOCS_ENV environment variable is required but not set.\n` +
      `✅ Valid values: local, localhost, preview, dev, production\n` +
      `💡 NX builds should load DOCS_ENV from root .env file automatically.\n` +
      `💡 CI/production workflows must set DOCS_ENV explicitly.`
    );
  }
  
  // Validate DOCS_ENV value
  const docsEnvMap: Record<string, string> = {
    'local': 'local',      // DOCS_ENV=local maps to 'local' environment files
    'localhost': 'local',  // DocsEnv.Localhost also maps to 'local' environment files
    'preview': 'preview', 
    'dev': 'development',
    'production': 'production',
  };
  
  if (!docsEnvMap[docsEnv]) {
    const validValues = Object.keys(docsEnvMap).join(', ');
    throw new Error(
      `❌ FATAL: Invalid DOCS_ENV value: '${docsEnv}'\n` +
      `✅ Expected one of: ${validValues}\n` +
      `💡 NX builds should load valid DOCS_ENV from root .env file.\n` +
      `💡 CI/production workflows must set DOCS_ENV correctly.`
    );
  }
  
  return docsEnvMap[docsEnv];
}