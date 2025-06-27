import { test, expect } from '@playwright/test';
import { createSiteConfigFromEnv } from '../scripts/utils/site-config-utils';

// Get affected sites from environment variable
const affectedSites = process.env.SITES?.split(' ').filter(Boolean) || [];
const { sites, sitesMap, currentEnv } = createSiteConfigFromEnv();

test.describe('Affected Sites Validation', () => {
  test.describe.configure({ mode: 'parallel' });

  if (affectedSites.length === 0) {
    test('No affected sites to test', async () => {
      console.log('No affected sites detected. Skipping validation.');
      expect(true).toBe(true);
    });
    return;
  }

  for (const siteName of affectedSites) {
    const site = sitesMap.get(siteName) || sites[siteName];
    
    if (!site) {
      test(`Skipping unknown site: ${siteName}`, async () => {
        console.warn(`Site ${siteName} not found in configuration`);
        expect(true).toBe(true);
      });
      continue;
    }

    test.describe(`${siteName} - ${currentEnv}`, () => {
      test('Homepage loads correctly', async ({ page }) => {
        await page.goto(site.url, { waitUntil: 'networkidle' });
        
        // Check title
        await expect(page).toHaveTitle(new RegExp(site.title || siteName));
        
        // Check for main content
        await expect(page.locator('main')).toBeVisible();
        
        // Check navigation
        await expect(page.locator('nav.navbar')).toBeVisible();
      });

      test('No broken internal links', async ({ page }) => {
        await page.goto(site.url);
        
        // Find all internal links
        const links = await page.locator(`a[href^="${site.baseUrl}"], a[href^="/"]`).all();
        
        // Test up to 10 links per site for performance
        const linksToTest = links.slice(0, 10);
        
        for (const link of linksToTest) {
          const href = await link.getAttribute('href');
          if (!href) continue;
          
          const response = await page.request.head(new URL(href, site.url).toString());
          expect(response.status()).toBeLessThan(400);
        }
      });

      test('Theme toggle works', async ({ page }) => {
        await page.goto(site.url);
        
        // Find theme toggle button
        const themeToggle = page.locator('button[class*="colorModeToggle"]');
        
        if (await themeToggle.isVisible()) {
          // Check initial theme
          const htmlElement = page.locator('html');
          const initialTheme = await htmlElement.getAttribute('data-theme');
          
          // Toggle theme
          await themeToggle.click();
          
          // Check theme changed
          await expect(htmlElement).not.toHaveAttribute('data-theme', initialTheme);
        }
      });

      if (site.hasVocabularies) {
        test('Vocabulary tables load', async ({ page }) => {
          // Navigate to a vocabulary page if available
          await page.goto(`${site.url}/docs/vocabulary`);
          
          // Check for vocabulary table
          const vocabTable = page.locator('.vocabulary-table, table').first();
          await expect(vocabTable).toBeVisible({ timeout: 10000 });
        });
      }
    });
  }
});