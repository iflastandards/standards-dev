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
 * Get the environment name based on NODE_ENV
 * Maps NODE_ENV values to our environment file names
 */
export function getEnvironmentName(): string {
  const envMap: Record<string, string> = {
    'development': 'development',
    'production': 'production',
    'test': 'local',
  };
  
  // Default to production if NODE_ENV is not set
  const nodeEnv = process.env['NODE_ENV'] || 'production';
  return envMap[nodeEnv] || 'production';
}