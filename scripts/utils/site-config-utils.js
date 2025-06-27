
// Environment enum matching siteConfig.ts exactly
const DocsEnv = {
  Local: 'local',
  Preview: 'preview',
  Development: 'development',
  Production: 'production',
};

// Get site keys from the centralized configuration
const siteKeys = Object.keys(SITE_CONFIG);

function loadSiteConfig(siteKey, env) {
  return getSiteConfig(siteKey, env);
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
