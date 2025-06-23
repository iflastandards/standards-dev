import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Environment Configuration Tests', () => {
  const rootDir = path.resolve(__dirname, '..');
  const rootEnvPath = path.join(rootDir, '.env');
  
  test('should have root .env file with valid DOCS_ENV', async () => {
    // Verify root .env file exists and contains DOCS_ENV
    expect(fs.existsSync(rootEnvPath), 'Root .env file should exist for local development').toBe(true);
    
    const envContent = fs.readFileSync(rootEnvPath, 'utf8');
    expect(envContent).toContain('DOCS_ENV=');
    
    // Extract DOCS_ENV value
    const docsEnvMatch = envContent.match(/^DOCS_ENV=(.+)$/m);
    expect(docsEnvMatch, 'DOCS_ENV should be set in root .env').toBeTruthy();
    
    const docsEnvValue = docsEnvMatch![1].trim();
    const validValues = ['local', 'localhost', 'preview', 'dev', 'production'];
    expect(validValues, `DOCS_ENV value '${docsEnvValue}' should be valid`).toContain(docsEnvValue);
  });

  test('should validate all sites have required environment files', async () => {
    // Test each standard site has the required .env.site files
    const sites = ['muldicat', 'ISBDM', 'LRM', 'FRBR', 'isbd', 'unimarc'];
    
    for (const site of sites) {
      const siteDir = `standards/${site}`;
      const siteEnvPath = path.join(rootDir, siteDir, '.env.site');
      const siteLocalEnvPath = path.join(rootDir, siteDir, '.env.site.local');
      
      // Verify base .env.site exists
      expect(fs.existsSync(siteEnvPath), `${site} should have .env.site file`).toBe(true);
      
      // Verify .env.site.local exists  
      expect(fs.existsSync(siteLocalEnvPath), `${site} should have .env.site.local file`).toBe(true);
      
      // Verify required variables are in .env.site
      const baseEnvContent = fs.readFileSync(siteEnvPath, 'utf8');
      expect(baseEnvContent).toContain('SITE_TITLE=');
      expect(baseEnvContent).toContain('SITE_TAGLINE=');
      
      // Verify required variables are in .env.site.local
      const localEnvContent = fs.readFileSync(siteLocalEnvPath, 'utf8');
      expect(localEnvContent).toContain('SITE_URL=');
      expect(localEnvContent).toContain('SITE_BASE_URL=');
    }
  });

  test('should validate portal has required environment files', async () => {
    const portalDir = 'portal';
    const portalEnvPath = path.join(rootDir, portalDir, '.env.site');
    const portalLocalEnvPath = path.join(rootDir, portalDir, '.env.site.local');
    
    // Verify base .env.site exists
    expect(fs.existsSync(portalEnvPath), 'portal should have .env.site file').toBe(true);
    
    // Verify .env.site.local exists  
    expect(fs.existsSync(portalLocalEnvPath), 'portal should have .env.site.local file').toBe(true);
    
    // Verify required variables are in .env.site
    const baseEnvContent = fs.readFileSync(portalEnvPath, 'utf8');
    expect(baseEnvContent).toContain('SITE_TITLE=');
    expect(baseEnvContent).toContain('SITE_TAGLINE=');
    
    // Verify required variables are in .env.site.local
    const localEnvContent = fs.readFileSync(portalLocalEnvPath, 'utf8');
    expect(localEnvContent).toContain('SITE_URL=');
    expect(localEnvContent).toContain('SITE_BASE_URL=');
  });
});