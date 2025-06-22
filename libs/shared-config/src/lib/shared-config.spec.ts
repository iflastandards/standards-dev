import { describe, it, expect } from 'vitest';
import { createBaseConfig, createThemeConfig } from '../index';

describe('shared-config', () => {
  describe('createBaseConfig', () => {
    it('should create base configuration with provided options', () => {
      const config = createBaseConfig({
        title: 'Test Site',
        tagline: 'Test Tagline',
        url: 'https://example.com',
        baseUrl: '/test/',
        projectName: 'test-project',
      });
      
      expect(config.title).toBe('Test Site');
      expect(config.tagline).toBe('Test Tagline');
      expect(config.url).toBe('https://example.com');
      expect(config.baseUrl).toBe('/test/');
      expect(config.projectName).toBe('test-project');
      expect(config.future.v4).toBe(true);
    });
  });
  
  describe('createThemeConfig', () => {
    it('should create theme configuration with provided options', () => {
      const config = createThemeConfig({
        navbarTitle: 'Test Nav',
        navbarItems: [{ label: 'Docs', position: 'left' }],
      });
      
      expect(config.navbar.title).toBe('Test Nav');
      expect(config.navbar.items).toHaveLength(1);
      expect(config.prism.theme).toBeDefined();
    });
  });
});