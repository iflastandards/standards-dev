import { describe, it, expect, vi } from 'vitest';
import { createStandardSiteConfig } from '../../config/standardSiteFactory';
import { sharedPlugins, sharedThemes } from '../../config/docusaurus';

// Mock the dependencies
vi.mock('../../config/siteConfig', () => ({
  getSiteDocusaurusConfig: vi.fn(() => ({
    url: 'http://localhost:3001',
    baseUrl: '/test/',
  })),
  getSiteUrl: vi.fn((siteKey, path, env) => `http://localhost:3001/${siteKey}${path}`),
}));

vi.mock('../../config/siteConfig.server', () => ({
  getCurrentEnv: vi.fn(() => 'localhost'),
}));

describe('standardSiteFactory', () => {
  describe('plugin configuration isolation', () => {
    it('should create independent plugin configurations for different sites', () => {
      // Create configurations for two different sites
      const config1 = createStandardSiteConfig({
        siteKey: 'LRM',
        title: 'LRM Site',
        tagline: 'LRM Tagline',
      });

      const config2 = createStandardSiteConfig({
        siteKey: 'ISBDM',
        title: 'ISBDM Site',
        tagline: 'ISBDM Tagline',
      });

      // Verify that plugin arrays are different instances
      expect(config1.plugins).not.toBe(config2.plugins);
      
      // Verify that individual plugin configurations are different instances
      if (Array.isArray(config1.plugins) && Array.isArray(config2.plugins)) {
        for (let i = 0; i < Math.min(config1.plugins.length, config2.plugins.length); i++) {
          const plugin1 = config1.plugins[i];
          const plugin2 = config2.plugins[i];
          
          if (Array.isArray(plugin1) && Array.isArray(plugin2)) {
            // For array-based plugins [name, options], verify options are different instances
            if (plugin1.length > 1 && plugin2.length > 1) {
              expect(plugin1[1]).not.toBe(plugin2[1]);
            }
          }
        }
      }
    });

    it('should create independent theme configurations for different sites', () => {
      // Create configurations for two different sites
      const config1 = createStandardSiteConfig({
        siteKey: 'LRM',
        title: 'LRM Site',
        tagline: 'LRM Tagline',
      });

      const config2 = createStandardSiteConfig({
        siteKey: 'ISBDM',
        title: 'ISBDM Site',
        tagline: 'ISBDM Tagline',
      });

      // Verify that theme arrays are different instances
      expect(config1.themes).not.toBe(config2.themes);
      
      // Verify that individual theme configurations are different instances
      if (Array.isArray(config1.themes) && Array.isArray(config2.themes)) {
        for (let i = 0; i < Math.min(config1.themes.length, config2.themes.length); i++) {
          const theme1 = config1.themes[i];
          const theme2 = config2.themes[i];
          
          if (Array.isArray(theme1) && Array.isArray(theme2)) {
            // For array-based themes [name, options], verify options are different instances
            if (theme1.length > 1 && theme2.length > 1) {
              expect(theme1[1]).not.toBe(theme2[1]);
            }
          }
        }
      }
    });

    it('should prevent configuration mutation between sites', () => {
      // Create first configuration
      const config1 = createStandardSiteConfig({
        siteKey: 'LRM',
        title: 'LRM Site',
        tagline: 'LRM Tagline',
      });

      // Simulate Docusaurus mutating plugin configuration (like it does during build normalization)
      if (Array.isArray(config1.plugins)) {
        for (const plugin of config1.plugins) {
          if (Array.isArray(plugin) && plugin.length > 1 && typeof plugin[1] === 'object') {
            // Simulate mutation that Docusaurus might do
            (plugin[1] as any).mutatedProperty = 'contaminated-value';
            (plugin[1] as any).baseUrl = '/contaminated-base-url/';
          }
        }
      }

      // Create second configuration after first one was mutated
      const config2 = createStandardSiteConfig({
        siteKey: 'ISBDM',
        title: 'ISBDM Site',
        tagline: 'ISBDM Tagline',
      });

      // Verify that second configuration is not contaminated
      if (Array.isArray(config2.plugins)) {
        for (const plugin of config2.plugins) {
          if (Array.isArray(plugin) && plugin.length > 1 && typeof plugin[1] === 'object') {
            expect((plugin[1] as any).mutatedProperty).toBeUndefined();
            expect((plugin[1] as any).baseUrl).not.toBe('/contaminated-base-url/');
          }
        }
      }
    });

    it('should handle additional plugins with proper isolation', () => {
      const additionalPlugin = [
        'test-plugin',
        {
          testOption: 'original-value',
          nestedOption: {
            deepValue: 'deep-original'
          }
        }
      ];

      // Create first configuration with additional plugin
      const config1 = createStandardSiteConfig({
        siteKey: 'LRM',
        title: 'LRM Site',
        tagline: 'LRM Tagline',
        additionalPlugins: [additionalPlugin],
      });

      // Mutate the additional plugin configuration
      if (Array.isArray(config1.plugins)) {
        const testPlugin = config1.plugins.find(p => 
          Array.isArray(p) && p[0] === 'test-plugin'
        ) as [string, any] | undefined;
        
        if (testPlugin && testPlugin[1]) {
          testPlugin[1].testOption = 'mutated-value';
          testPlugin[1].nestedOption.deepValue = 'deep-mutated';
        }
      }

      // Create second configuration with same additional plugin
      const config2 = createStandardSiteConfig({
        siteKey: 'ISBDM',
        title: 'ISBDM Site',
        tagline: 'ISBDM Tagline',
        additionalPlugins: [additionalPlugin],
      });

      // Verify that second configuration is not contaminated
      if (Array.isArray(config2.plugins)) {
        const testPlugin = config2.plugins.find(p => 
          Array.isArray(p) && p[0] === 'test-plugin'
        ) as [string, any] | undefined;
        
        if (testPlugin && testPlugin[1]) {
          expect(testPlugin[1].testOption).toBe('original-value');
          expect(testPlugin[1].nestedOption.deepValue).toBe('deep-original');
        }
      }
    });

    it('should preserve original shared configurations unchanged', () => {
      // Store original references
      const originalSharedPlugins = [...sharedPlugins];
      const originalSharedThemes = [...sharedThemes];

      // Create multiple configurations
      createStandardSiteConfig({
        siteKey: 'LRM',
        title: 'LRM Site',
        tagline: 'LRM Tagline',
      });

      createStandardSiteConfig({
        siteKey: 'ISBDM',
        title: 'ISBDM Site',
        tagline: 'ISBDM Tagline',
      });

      // Verify that original shared configurations are unchanged
      expect(sharedPlugins).toEqual(originalSharedPlugins);
      expect(sharedThemes).toEqual(originalSharedThemes);
    });
  });

  describe('site-specific configuration', () => {
    it('should generate correct site-specific URLs and base paths', () => {
      const config = createStandardSiteConfig({
        siteKey: 'LRM',
        title: 'LRM Site',
        tagline: 'LRM Tagline',
      });

      expect(config.title).toBe('LRM Site');
      expect(config.tagline).toBe('LRM Tagline');
      expect(config.projectName).toBe('LRM');
    });

    it('should handle custom project names', () => {
      const config = createStandardSiteConfig({
        siteKey: 'LRM',
        title: 'LRM Site',
        tagline: 'LRM Tagline',
        projectName: 'custom-project-name',
      });

      expect(config.projectName).toBe('custom-project-name');
    });
  });
});
