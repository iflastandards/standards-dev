import { describe, it, expect } from 'vitest';
import { getSiteConfig, type SiteKey, type Environment } from '../../config/siteConfig';

describe('getSiteConfig', () => {
  describe('basic functionality', () => {
    it('should return correct config for portal in local environment', () => {
      const config = getSiteConfig('portal', 'local');
      expect(config).toEqual({
        url: 'http://localhost:3000',
        baseUrl: '/',
        port: 3000
      });
    });

    it('should return correct config for LRM in production environment', () => {
      const config = getSiteConfig('LRM', 'production');
      expect(config).toEqual({
        url: 'https://www.iflastandards.info',
        baseUrl: '/LRM/'
      });
    });

    it('should return correct config for ISBDM in preview environment', () => {
      const config = getSiteConfig('ISBDM', 'preview');
      expect(config).toEqual({
        url: 'https://iflastandards.github.io',
        baseUrl: '/standards-dev/ISBDM/'
      });
    });
  });

  describe('all sites in all environments', () => {
    const sites: SiteKey[] = ['portal', 'ISBDM', 'LRM', 'FRBR', 'isbd', 'muldicat', 'unimarc', 'newtest'];
    const environments: Environment[] = ['local', 'preview', 'development', 'production'];

    sites.forEach(site => {
      environments.forEach(env => {
        it(`should return valid config for ${site} in ${env} environment`, () => {
          const config = getSiteConfig(site, env);
          expect(config).toBeDefined();
          expect(config.url).toBeTruthy();
          expect(config.baseUrl).toBeTruthy();

          // Only local environment should have port
          if (env === 'local') {
            expect(config.port).toBeDefined();
            expect(config.port).toBeGreaterThanOrEqual(3000);
            expect(config.port).toBeLessThanOrEqual(3008);
          } else {
            expect(config.port).toBeUndefined();
          }
        });
      });
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid site key', () => {
      expect(() => getSiteConfig('invalid' as SiteKey, 'local')).toThrow(
        'Configuration missing for invalid in local'
      );
    });

    it('should throw error for invalid environment', () => {
      expect(() => getSiteConfig('portal', 'invalid' as Environment)).toThrow(
        'Configuration missing for portal in invalid'
      );
    });
  });

  describe('URL structure validation', () => {
    it('should use localhost URLs for local environment', () => {
      const sites: SiteKey[] = ['portal', 'ISBDM', 'LRM', 'FRBR', 'isbd', 'muldicat', 'unimarc', 'newtest'];
      sites.forEach(site => {
        const config = getSiteConfig(site, 'local');
        expect(config.url).toMatch(/^http:\/\/localhost:\d+$/);
      });
    });

    it('should use production URLs for production environment', () => {
      const sites: SiteKey[] = ['portal', 'ISBDM', 'LRM', 'FRBR', 'isbd', 'muldicat', 'unimarc', 'newtest'];
      sites.forEach(site => {
        const config = getSiteConfig(site, 'production');
        expect(config.url).toBe('https://www.iflastandards.info');
      });
    });

    it('should use GitHub Pages URLs for preview environment', () => {
      const sites: SiteKey[] = ['portal', 'ISBDM', 'LRM', 'FRBR', 'isbd', 'muldicat', 'unimarc', 'newtest'];
      sites.forEach(site => {
        const config = getSiteConfig(site, 'preview');
        expect(config.url).toBe('https://iflastandards.github.io');
        expect(config.baseUrl).toMatch(/^\/standards-dev/);
      });
    });
  });
});
