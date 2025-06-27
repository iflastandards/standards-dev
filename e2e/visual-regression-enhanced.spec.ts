import { test, expect } from '@playwright/test';

// Enhanced visual regression testing with multiple viewports
const viewports = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'laptop', width: 1366, height: 768 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'mobile', width: 375, height: 667 },
  { name: 'mobile-large', width: 414, height: 896 }
];

const testPages = [
  { path: '/', name: 'portal-home' },
  { path: '/ISBDM/', name: 'isbdm-home' },
  { path: '/ISBDM/docs/intro', name: 'isbdm-intro' },
  { path: '/LRM/', name: 'lrm-home' },
  { path: '/FRBR/', name: 'frbr-home' }
];

test.describe('Enhanced Visual Regression Testing', () => {
  for (const viewport of viewports) {
    test.describe(`${viewport.name} viewport (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
      });

      for (const testPage of testPages) {
        test(`should render ${testPage.name} consistently on ${viewport.name}`, async ({ page }) => {
          // Navigate to page
          await page.goto(testPage.path);
          await page.waitForLoadState('networkidle');
          
          // Wait for fonts and images to load
          await page.waitForTimeout(1000);
          
          // Hide dynamic content that changes between runs
          await page.addStyleTag({
            content: `
              .theme-last-updated, 
              .footer__copyright,
              [class*="buildTime"],
              [class*="timestamp"] {
                visibility: hidden !important;
              }
            `
          });

          // Take full page screenshot
          await expect(page).toHaveScreenshot(`${testPage.name}-${viewport.name}.png`, {
            fullPage: true,
            animations: 'disabled',
            clip: viewport.width < 768 ? undefined : { x: 0, y: 0, width: viewport.width, height: Math.min(viewport.height, 2000) }
          });
        });
      }

      // Test interactive elements on mobile
      if (viewport.width <= 768) {
        test(`should handle mobile navigation on ${viewport.name}`, async ({ page }) => {
          await page.goto('/');
          await page.waitForLoadState('networkidle');
          
          // Test mobile menu if present
          const mobileMenuButton = page.locator('[aria-label*="menu"], .navbar__toggle');
          if (await mobileMenuButton.count() > 0) {
            await mobileMenuButton.click();
            await page.waitForTimeout(500);
            
            await expect(page).toHaveScreenshot(`mobile-menu-open-${viewport.name}.png`, {
              animations: 'disabled'
            });
          }
        });
      }
    });
  }

  test.describe('Component-specific visual tests', () => {
    test('VocabularyTable component across viewports', async ({ page }) => {
      // Test vocabulary table on a page that has one
      await page.goto('/ISBDM/docs/examples/sensory-test-vocabulary/');
      await page.waitForLoadState('networkidle');
      
      // Wait for vocabulary data to load
      await page.waitForSelector('text=aural', { timeout: 10000 });

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(500);
        
        // Screenshot just the vocabulary table component
        const vocabularyTable = page.locator('[class*="VocabularyTable"], .vocabulary-table').first();
        if (await vocabularyTable.count() > 0) {
          await expect(vocabularyTable).toHaveScreenshot(`vocabulary-table-${viewport.name}.png`, {
            animations: 'disabled'
          });
        }
      }
    });

    test('Navigation components across viewports', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(500);
        
        // Screenshot navigation area
        const navbar = page.locator('.navbar, [class*="navbar"]').first();
        if (await navbar.count() > 0) {
          await expect(navbar).toHaveScreenshot(`navbar-${viewport.name}.png`, {
            animations: 'disabled'
          });
        }
      }
    });
  });

  test.describe('Theme and styling consistency', () => {
    test('Dark mode consistency across viewports', async ({ page }) => {
      // Check if dark mode toggle exists
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const darkModeToggle = page.locator('[aria-label*="dark"], [class*="darkToggle"]');
      if (await darkModeToggle.count() > 0) {
        // Test dark mode on different viewports
        for (const viewport of [viewports[0], viewports[4]]) { // Desktop and mobile
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          
          // Toggle dark mode
          await darkModeToggle.first().click();
          await page.waitForTimeout(500);
          
          await expect(page).toHaveScreenshot(`dark-mode-${viewport.name}.png`, {
            fullPage: true,
            animations: 'disabled'
          });
        }
      }
    });

    test('Print stylesheet rendering', async ({ page }) => {
      await page.goto('/ISBDM/docs/intro');
      await page.waitForLoadState('networkidle');
      
      // Emulate print media
      await page.emulateMedia({ media: 'print' });
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('print-view.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Error state visuals', () => {
    test('404 page rendering across viewports', async ({ page }) => {
      // Navigate to non-existent page
      await page.goto('/non-existent-page');
      await page.waitForLoadState('networkidle');
      
      for (const viewport of [viewports[0], viewports[4]]) { // Desktop and mobile
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(500);
        
        await expect(page).toHaveScreenshot(`404-page-${viewport.name}.png`, {
          animations: 'disabled'
        });
      }
    });
  });
});