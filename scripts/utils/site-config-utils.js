const fs = require('fs');
const path = require('path');

// Environment enum for compatibility
const DocsEnv = {
  Localhost: 'localhost',
  Preview: 'preview',
  Dev: 'dev',
  Production: 'production',
};

// Site keys
const siteKeys = ['portal', 'ISBDM', 'LRM', 'FRBR', 'isbd', 'muldicat', 'unimarc'];

// Map environment names for file lookup
const ENV_FILE_MAP = {
  'localhost': 'local',
  'preview': 'preview', 
  'dev': 'development',
  'development': 'development',
  'production': 'production',
};

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

function loadSiteConfig(siteKey, env) {
  const sitePath = siteKey === 'portal' ? 'portal' : `standards/${siteKey}`;
  const envFileName = ENV_FILE_MAP[env.toLowerCase()] || ENV_FILE_MAP['localhost'];
  const envFilePath = path.join(process.cwd(), sitePath, `.env.site.${envFileName}`);
  
  const envVars = parseEnvFile(envFilePath);
  
  if (!envVars.SITE_URL || !envVars.SITE_BASE_URL) {
    // Fallback to hardcoded values if env file missing
    return getFallbackConfig(siteKey, env);
  }
  
  const config = {
    url: envVars.SITE_URL,
    baseUrl: envVars.SITE_BASE_URL,
  };
  
  if (envVars.SITE_PORT) {
    config.port = parseInt(envVars.SITE_PORT, 10);
  }
  
  return config;
}

// Fallback to old hardcoded values for missing env files
function getFallbackConfig(siteKey, env) {
  const portMap = {
    portal: 3000,
    ISBDM: 3001,
    LRM: 3002,
    FRBR: 3003,
    isbd: 3004,
    muldicat: 3005,
    unimarc: 3006,
  };

  switch (env.toLowerCase()) {
    case 'localhost':
    case 'local':
      return {
        url: `http://localhost:${portMap[siteKey]}`,
        baseUrl: siteKey === 'portal' ? '/' : `/${siteKey}/`,
        port: portMap[siteKey],
      };
    case 'preview':
      return {
        url: 'https://iflastandards.github.io',
        baseUrl: siteKey === 'portal' ? '/standards-dev/' : `/standards-dev/${siteKey}/`,
      };
    case 'dev':
    case 'development':
      return {
        url: 'https://jonphipps.github.io',
        baseUrl: siteKey === 'portal' ? '/standards-dev/' : `/standards-dev/${siteKey}/`,
      };
    case 'production':
      return {
        url: 'https://www.iflastandards.info',
        baseUrl: siteKey === 'portal' ? '/' : `/${siteKey}/`,
      };
    default:
      throw new Error(`Unknown environment: ${env}`);
  }
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