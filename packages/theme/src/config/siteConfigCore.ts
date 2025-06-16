export enum DocsEnv {
  Localhost = 'localhost',
  Preview = 'preview',
  Production = 'production',
}

export type SiteKey = 'portal' | 'ISBDM' | 'LRM' | 'fr' | 'isbd' | 'muldicat' | 'unimarc' | 'github';

export interface SiteConfig {
  url: string;
  baseUrl: string;
  port?: number; // Only for localhost
}

// Defines the configuration for each site in each environment
// Ensure this is kept up-to-date with any new sites or environment changes.
export const sites: Record<SiteKey, Record<DocsEnv, SiteConfig>> = {
  portal: {
    [DocsEnv.Localhost]: { url: 'http://localhost:3000', baseUrl: '/portal/', port: 3000 },
    [DocsEnv.Preview]: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/', port: 3000 },
    [DocsEnv.Production]: { url: 'https://iflastandards.info', baseUrl: '/', port: 3000 },
  },
  ISBDM: {
    [DocsEnv.Localhost]: { url: 'http://localhost:3001', baseUrl: '/ISBDM/', port: 3001 },
    [DocsEnv.Preview]: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/ISBDM/', port: 3001 },
    [DocsEnv.Production]: { url: 'https://iflastandards.info', baseUrl: '/ISBDM/', port: 3001 },
  },
  LRM: {
    [DocsEnv.Localhost]: { url: 'http://localhost:3002', baseUrl: '/LRM/', port: 3002 },
    [DocsEnv.Preview]: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/LRM/', port: 3002 },
    [DocsEnv.Production]: { url: 'https://iflastandards.info', baseUrl: '/LRM/', port: 3002 },
  },
  fr: {
    [DocsEnv.Localhost]: { url: 'http://localhost:3003', baseUrl: '/fr/', port: 3003 },
    [DocsEnv.Preview]: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/fr/', port: 3003 },
    [DocsEnv.Production]: { url: 'https://iflastandards.info', baseUrl: '/fr/', port: 3003 },
  },
  isbd: {
    [DocsEnv.Localhost]: { url: 'http://localhost:3004', baseUrl: '/isbd/', port: 3004 },
    [DocsEnv.Preview]: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/isbd/', port: 3004 },
    [DocsEnv.Production]: { url: 'https://iflastandards.info', baseUrl: '/isbd/', port: 3004 },
  },
  muldicat: {
    [DocsEnv.Localhost]: { url: 'http://localhost:3005', baseUrl: '/muldicat/', port: 3005 },
    [DocsEnv.Preview]: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/muldicat/', port: 3005 },
    [DocsEnv.Production]: { url: 'https://iflastandards.info', baseUrl: '/muldicat/', port: 3005 },
  },
  unimarc: {
    [DocsEnv.Localhost]: { url: 'http://localhost:3006', baseUrl: '/unimarc/', port: 3006 },
    [DocsEnv.Preview]: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/unimarc/', port: 3006 },
    [DocsEnv.Production]: { url: 'https://iflastandards.info', baseUrl: '/unimarc/', port: 3006 },
  },
  github: {
    [DocsEnv.Localhost]: { url: 'http://localhost:3007', baseUrl: '/github/', port: 3007 },
    [DocsEnv.Preview]: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/github/', port: 3007 },
    [DocsEnv.Production]: { url: 'https://iflastandards.info', baseUrl: '/github/', port: 3007 },
  },
};
