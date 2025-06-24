// Updated to use the new centralized configuration system
const { getSiteConfig, mapDocsEnvToEnvironment, SITE_CONFIG } = require('../../libs/shared-config/dist/index.cjs.js');

// Environment enum for compatibility
const DocsEnv = {
  Localhost: 'local',
  Preview: 'preview',
  Dev: 'development',
  Production: 'production',
};

// Get site keys from the centralized configuration
const siteKeys = Object.keys(SITE_CONFIG);

// Map script environment names to the internal environment system
const ENV_MAP = {
  'localhost': 'local',
  'local': 'local',
  'preview': 'preview', 
  'dev': 'development',
  'development': 'development',
  'production': 'production',
};

function loadSiteConfig(siteKey, env) {
  const mappedEnv = ENV_MAP[env.toLowerCase()] || 'local';
  return getSiteConfig(siteKey, mappedEnv);
}

// Create sites object for backward compatibility
function createSiteConfigFromEnv() {
  const sites = {};
  const environments = Object.values(DocsEnv);
  
  for (const siteKey of siteKeys) {
    sites[siteKey] = {};
    
    for (const env of environments) {
      sites[siteKey][env] = loadSiteConfig(siteKey, env);
    }
  }
  
  return { sites, DocsEnv };
}

module.exports = {
  createSiteConfigFromEnv,
  DocsEnv,
  siteKeys,
  loadSiteConfig,
};