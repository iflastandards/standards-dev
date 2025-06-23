import * as fs from 'fs';
import * as path from 'path';

export enum DocsEnv {
  Localhost = 'local',
  Preview = 'preview',
  Dev = 'development',
  Production = 'production',
}

export type SiteKey = 'portal' | 'ISBDM' | 'LRM' | 'FRBR' | 'isbd' | 'muldicat' | 'unimarc';

export interface SiteConfig {
  url: string;
  baseUrl: string;
  port?: number;
}

// Map environment names for compatibility
const ENV_FILE_MAP = {
  [DocsEnv.Localhost]: 'local',
  [DocsEnv.Preview]: 'preview', 
  [DocsEnv.Dev]: 'development',
  [DocsEnv.Production]: 'production',
};

function parseEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const env: Record<string, string> = {};
  
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

function loadSiteConfig(siteKey: SiteKey, env: DocsEnv): SiteConfig | null {
  const sitePath = siteKey === 'portal' ? 'portal' : `standards/${siteKey}`;
  const envFileName = ENV_FILE_MAP[env];
  const envFilePath = path.join(process.cwd(), sitePath, `.env.site.${envFileName}`);
  
  const envVars = parseEnvFile(envFilePath);
  
  if (!envVars.SITE_URL || !envVars.SITE_BASE_URL) {
    return null;
  }
  
  const config: SiteConfig = {
    url: envVars.SITE_URL,
    baseUrl: envVars.SITE_BASE_URL,
  };
  
  if (envVars.SITE_PORT) {
    config.port = parseInt(envVars.SITE_PORT, 10);
  }
  
  return config;
}

// Create the sites object dynamically by reading env files
function createSitesConfig(): Record<SiteKey, Record<DocsEnv, SiteConfig>> {
  const siteKeys: SiteKey[] = ['portal', 'ISBDM', 'LRM', 'FRBR', 'isbd', 'muldicat', 'unimarc'];
  const environments = Object.values(DocsEnv);
  
  const sites: Record<SiteKey, Record<DocsEnv, SiteConfig>> = {} as any;
  
  for (const siteKey of siteKeys) {
    sites[siteKey] = {} as Record<DocsEnv, SiteConfig>;
    
    for (const env of environments) {
      const config = loadSiteConfig(siteKey, env);
      if (config) {
        sites[siteKey][env] = config;
      } else {
        // Fallback to old hardcoded values if env file missing
        sites[siteKey][env] = getFallbackConfig(siteKey, env);
      }
    }
  }
  
  return sites;
}

// Fallback to old hardcoded values for missing env files
function getFallbackConfig(siteKey: SiteKey, env: DocsEnv): SiteConfig {
  const portMap: Record<SiteKey, number> = {
    portal: 3000,
    ISBDM: 3001,
    LRM: 3002,
    FRBR: 3003,
    isbd: 3004,
    muldicat: 3005,
    unimarc: 3006,
  };

  switch (env) {
    case DocsEnv.Localhost:
      return {
        url: `http://localhost:${portMap[siteKey]}`,
        baseUrl: siteKey === 'portal' ? '/' : `/${siteKey}/`,
        port: portMap[siteKey],
      };
    case DocsEnv.Preview:
      return {
        url: 'https://iflastandards.github.io',
        baseUrl: siteKey === 'portal' ? '/standards-dev/' : `/standards-dev/${siteKey}/`,
      };
    case DocsEnv.Dev:
      return {
        url: 'https://jonphipps.github.io',
        baseUrl: siteKey === 'portal' ? '/standards-dev/' : `/standards-dev/${siteKey}/`,
      };
    case DocsEnv.Production:
      return {
        url: 'https://www.iflastandards.info',
        baseUrl: siteKey === 'portal' ? '/' : `/${siteKey}/`,
      };
    default:
      throw new Error(`Unknown environment: ${env}`);
  }
}

export const sites = createSitesConfig();