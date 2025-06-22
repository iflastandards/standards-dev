import { describe, it, expect } from 'vitest';
import { buildSiteUrl, getSiteUrl } from '@ifla/shared-config';
import type { EnvConfig } from '@ifla/shared-config';

// Mock environment configurations for testing
const createEnvConfig = (siteKey: string, environment: string): EnvConfig => {
  const configs: Record<string, Record<string, EnvConfig>> = {
    portal: {
      local: {
        SITE_URL: 'http://localhost:3000',
        SITE_BASE_URL: '/portal/',
        SITE_TITLE: 'IFLA Standards Portal',
        SITE_TAGLINE: 'Portal for IFLA Standards'
      },
      preview: {
        SITE_URL: 'https://iflastandards.github.io',
        SITE_BASE_URL: '/standards-dev/',
        SITE_TITLE: 'IFLA Standards Portal',
        SITE_TAGLINE: 'Portal for IFLA Standards'
      },
      production: {
        SITE_URL: 'https://www.iflastandards.info',
        SITE_BASE_URL: '/',
        SITE_TITLE: 'IFLA Standards Portal',
        SITE_TAGLINE: 'Portal for IFLA Standards'
      }
    },
    LRM: {
      local: {
        SITE_URL: 'http://localhost:3002',
        SITE_BASE_URL: '/LRM/',
        SITE_TITLE: 'IFLA LRM',
        SITE_TAGLINE: 'IFLA Library Reference Model'
      },
      preview: {
        SITE_URL: 'https://iflastandards.github.io',
        SITE_BASE_URL: '/standards-dev/LRM/',
        SITE_TITLE: 'IFLA LRM',
        SITE_TAGLINE: 'IFLA Library Reference Model'
      },
      production: {
        SITE_URL: 'https://www.iflastandards.info',
        SITE_BASE_URL: '/LRM/',
        SITE_TITLE: 'IFLA LRM',
        SITE_TAGLINE: 'IFLA Library Reference Model'
      }
    },
    ISBDM: {
      local: {
        SITE_URL: 'http://localhost:3001',
        SITE_BASE_URL: '/ISBDM/',
        SITE_TITLE: 'ISBDM',
        SITE_TAGLINE: 'International Standard Bibliographic Description'
      },
      preview: {
        SITE_URL: 'https://iflastandards.github.io',
        SITE_BASE_URL: '/standards-dev/ISBDM/',
        SITE_TITLE: 'ISBDM',
        SITE_TAGLINE: 'International Standard Bibliographic Description'
      },
      production: {
        SITE_URL: 'https://www.iflastandards.info',
        SITE_BASE_URL: '/ISBDM/',
        SITE_TITLE: 'ISBDM',
        SITE_TAGLINE: 'International Standard Bibliographic Description'
      }
    },
    isbd: {
      local: {
        SITE_URL: 'http://localhost:3004',
        SITE_BASE_URL: '/isbd/',
        SITE_TITLE: 'ISBD',
        SITE_TAGLINE: 'International Standard Bibliographic Description'
      },
      preview: {
        SITE_URL: 'https://iflastandards.github.io',
        SITE_BASE_URL: '/standards-dev/isbd/',  
        SITE_TITLE: 'ISBD',
        SITE_TAGLINE: 'International Standard Bibliographic Description'
      },
      production: {
        SITE_URL: 'https://www.iflastandards.info',
        SITE_BASE_URL: '/isbd/',
        SITE_TITLE: 'ISBD',
        SITE_TAGLINE: 'International Standard Bibliographic Description'
      }
    },
    unimarc: {
      local: {
        SITE_URL: 'http://localhost:3006',
        SITE_BASE_URL: '/unimarc/',
        SITE_TITLE: 'UNIMARC',
        SITE_TAGLINE: 'UNIMARC Format'
      },
      preview: {
        SITE_URL: 'https://iflastandards.github.io',
        SITE_BASE_URL: '/standards-dev/unimarc/',
        SITE_TITLE: 'UNIMARC',
        SITE_TAGLINE: 'UNIMARC Format'
      },
      production: {
        SITE_URL: 'https://www.iflastandards.info',
        SITE_BASE_URL: '/unimarc/',
        SITE_TITLE: 'UNIMARC',
        SITE_TAGLINE: 'UNIMARC Format'
      }
    }
  };

  return configs[siteKey]?.[environment] || (() => {
    throw new Error(`No configuration found for site: ${siteKey}, environment: ${environment}`);
  })();
};

describe('buildSiteUrl', () => {
  describe('path normalization', () => {
    it('should handle paths with leading slash', () => {
      const config = createEnvConfig('LRM', 'local');
      const url = buildSiteUrl(config, '/docs/intro');
      expect(url).toBe('http://localhost:3002/LRM/docs/intro');
    });

    it('should handle paths without leading slash', () => {
      const config = createEnvConfig('LRM', 'local');
      const url = buildSiteUrl(config, 'docs/intro');
      expect(url).toBe('http://localhost:3002/LRM/docs/intro');
    });

    it('should handle empty path', () => {
      const config = createEnvConfig('LRM', 'local');
      const url = buildSiteUrl(config, '');
      expect(url).toBe('http://localhost:3002/LRM');
    });

    it('should handle root path', () => {
      const config = createEnvConfig('LRM', 'local');
      const url = buildSiteUrl(config, '/');
      expect(url).toBe('http://localhost:3002/LRM');
    });
  });

  describe('cross-site navigation', () => {
    it('should generate correct URL for ISBDM site', () => {
      const config = createEnvConfig('ISBDM', 'local');
      const url = buildSiteUrl(config, '/docs/intro');
      expect(url).toBe('http://localhost:3001/ISBDM/docs/intro');
    });

    it('should generate correct URL for portal site', () => {
      const config = createEnvConfig('portal', 'local');
      const url = buildSiteUrl(config, '/docs/intro');
      expect(url).toBe('http://localhost:3000/portal/docs/intro');
    });

    it('should generate correct URL for ISBD site', () => {
      const config = createEnvConfig('isbd', 'local');
      const url = buildSiteUrl(config, '/docs/intro');
      expect(url).toBe('http://localhost:3004/isbd/docs/intro');
    });

    it('should generate correct URL for UNIMARC site', () => {
      const config = createEnvConfig('unimarc', 'local');
      const url = buildSiteUrl(config, '/docs/intro');
      expect(url).toBe('http://localhost:3006/unimarc/docs/intro');
    });
  });

  describe('different environments', () => {
    it('should generate correct URL for preview environment', () => {
      const config = createEnvConfig('LRM', 'preview');
      const url = buildSiteUrl(config, '/docs/intro');
      expect(url).toBe('https://iflastandards.github.io/standards-dev/LRM/docs/intro');
    });

    it('should generate correct URL for production environment', () => {
      const config = createEnvConfig('LRM', 'production');
      const url = buildSiteUrl(config, '/docs/intro');
      expect(url).toBe('https://www.iflastandards.info/LRM/docs/intro');
    });
  });

  describe('blog and other paths', () => {
    it('should generate correct URL for blog path', () => {
      const config = createEnvConfig('LRM', 'local');
      const url = buildSiteUrl(config, '/blog');
      expect(url).toBe('http://localhost:3002/LRM/blog');
    });

    it('should generate correct URL for manage path', () => {
      const config = createEnvConfig('ISBDM', 'local');
      const url = buildSiteUrl(config, '/manage');
      expect(url).toBe('http://localhost:3001/ISBDM/manage');
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid site key', () => {
      expect(() => {
        // @ts-expect-error Testing invalid input
        createEnvConfig('INVALID_SITE', 'local');
      }).toThrow('No configuration found for site: INVALID_SITE, environment: local');
    });

    it('should throw error for invalid environment', () => {
      expect(() => {
        // @ts-expect-error Testing invalid input  
        createEnvConfig('LRM', 'INVALID_ENV');
      }).toThrow('No configuration found for site: LRM, environment: INVALID_ENV');
    });
  });
});

describe('getSiteUrl helper', () => {
  describe('URL construction', () => {
    it('should construct URLs correctly from components', () => {
      const url = getSiteUrl('http://localhost:3002', '/LRM/', '/docs/intro');
      expect(url).toBe('http://localhost:3002/LRM/docs/intro');
    });

    it('should handle empty path', () => {
      const url = getSiteUrl('http://localhost:3002', '/LRM/', '');
      expect(url).toBe('http://localhost:3002/LRM');
    });

    it('should handle production URLs', () => {
      const url = getSiteUrl('https://www.iflastandards.info', '/LRM/', '/docs/intro');
      expect(url).toBe('https://www.iflastandards.info/LRM/docs/intro');
    });

    it('should handle preview URLs', () => {
      const url = getSiteUrl('https://iflastandards.github.io', '/standards-dev/LRM/', '/docs/intro');
      expect(url).toBe('https://iflastandards.github.io/standards-dev/LRM/docs/intro');
    });
  });
});
