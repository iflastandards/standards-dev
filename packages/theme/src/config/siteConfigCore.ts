export enum DocsEnv {
  Localhost = 'localhost',
  Preview = 'preview',
  Dev = 'dev',
  Production = 'production',
}

export type SiteKey = 'portal' | 'ISBDM' | 'LRM' | 'FRBR' | 'isbd' | 'muldicat' | 'unimarc';

export interface SiteConfig {
  url: string;
  baseUrl: string;
  port?: number; // Only for localhost
}

// Defines the configuration for each site in each environment
// Ensure this is kept up-to-date with any new sites or environment changes.
export const sites: Record<SiteKey, Record<DocsEnv, SiteConfig>> = {
  portal: {
    [DocsEnv.Localhost]: { url: 'http://localhost:3000', baseUrl: '/', port: 3000 },
    [DocsEnv.Preview]: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/' },
    [DocsEnv.Dev]: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/' },
    [DocsEnv.Production]: { url: 'https://www.iflastandards.info', baseUrl: '/' },
  },
  ISBDM: {
    [DocsEnv.Localhost]: { url: 'http://localhost:3001', baseUrl: '/ISBDM/', port: 3001 },
    [DocsEnv.Preview]: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/ISBDM/' },
    [DocsEnv.Dev]: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/ISBDM/' },
    [DocsEnv.Production]: { url: 'https://www.iflastandards.info', baseUrl: '/ISBDM/' },
  },
  LRM: {
    [DocsEnv.Localhost]: { url: 'http://localhost:3002', baseUrl: '/LRM/' },
    [DocsEnv.Preview]: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/LRM/' },
    [DocsEnv.Dev]: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/LRM/' },
    [DocsEnv.Production]: { url: 'https://www.iflastandards.info', baseUrl: '/LRM/' },
  },
  FRBR: {
    [DocsEnv.Localhost]: { url: 'http://localhost:3003', baseUrl: '/FRBR/' },
    [DocsEnv.Preview]: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/FRBR/' },
    [DocsEnv.Dev]: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/FRBR/' },
    [DocsEnv.Production]: { url: 'https://www.iflastandards.info', baseUrl: '/FRBR/' },
  },
  isbd: {
    [DocsEnv.Localhost]: { url: 'http://localhost:3004', baseUrl: '/isbd/' },
    [DocsEnv.Preview]: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/isbd/' },
    [DocsEnv.Dev]: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/isbd/' },
    [DocsEnv.Production]: { url: 'https://www.iflastandards.info', baseUrl: '/isbd/' },
  },
  muldicat: {
    [DocsEnv.Localhost]: { url: 'http://localhost:3005', baseUrl: '/muldicat/' },
    [DocsEnv.Preview]: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/muldicat/' },
    [DocsEnv.Dev]: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/muldicat/' },
    [DocsEnv.Production]: { url: 'https://www.iflastandards.info', baseUrl: '/muldicat/' },
  },
  unimarc: {
    [DocsEnv.Localhost]: { url: 'http://localhost:3006', baseUrl: '/unimarc/' },
    [DocsEnv.Preview]: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/unimarc/' },
    [DocsEnv.Dev]: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/unimarc/' },
    [DocsEnv.Production]: { url: 'https://www.iflastandards.info', baseUrl: '/unimarc/' },
  },
};
