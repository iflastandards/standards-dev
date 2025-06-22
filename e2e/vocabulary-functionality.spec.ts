import { test, expect } from '@playwright/test';

test.describe('Vocabulary Table Functionality', () => {
  test('should load and interact with vocabulary tables in ISBDM', async ({ page }) => {
    await page.goto('http://localhost:3001/ISBDM/docs/examples/sensory-test-vocabulary/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Wait for vocabulary data to load (up to 15 seconds)
    await page.waitForSelector('text=aural', { timeout: 15000 });
    
    // Check that vocabulary terms are visible
    await expect(page.locator('text=aural')).toBeVisible();
    await expect(page.locator('text=gustatory')).toBeVisible();
    await expect(page.locator('text=tactile')).toBeVisible();
  });

  test('should have working search/filter functionality', async ({ page }) => {
    await page.goto('http://localhost:3001/ISBDM/docs/examples/sensory-test-vocabulary/');
    await page.waitForLoadState('networkidle');
    
    // Wait for data to load
    await page.waitForSelector('text=aural', { timeout: 15000 });
    
    // Find search input
    const searchInput = page.locator('input[placeholder*="Filter"], input[placeholder*="Search"]').first();
    
    if (await searchInput.count() > 0) {
      // Test filtering
      await searchInput.fill('aural');
      await page.waitForTimeout(500);
      
      // Should show aural terms
      await expect(page.locator('text=aural').first()).toBeVisible();
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(500);
      
      // All terms should be visible again
      await expect(page.locator('text=gustatory').first()).toBeVisible();
    }
  });

  test('should display vocabulary definitions and examples', async ({ page }) => {
    await page.goto('http://localhost:3001/ISBDM/docs/examples/sensory-test-vocabulary/');
    await page.waitForLoadState('networkidle');
    
    // Wait for data to load
    await page.waitForSelector('text=aural', { timeout: 15000 });
    
    // Check for definition content
    await expect(page.locator('text=Content that is intended to be perceived')).toBeVisible();
    
    // Check for example content
    await expect(page.locator('text=Audiobooks, text=music recordings, text=Wine tasting')).toBeVisible();
  });

  test('should handle language switching if available', async ({ page }) => {
    await page.goto('http://localhost:3001/ISBDM/docs/examples/sensory-test-vocabulary/');
    await page.waitForLoadState('networkidle');
    
    // Wait for data to load
    await page.waitForSelector('text=aural', { timeout: 15000 });
    
    // Look for language selector tabs
    const languageTabs = page.locator('button:has-text("FR"), button:has-text("ES"), [role="tab"]:has-text("fr"), [role="tab"]:has-text("es")');
    
    if (await languageTabs.count() > 0) {
      // Click first non-English tab
      await languageTabs.first().click();
      await page.waitForTimeout(1000);
      
      // Should show different language content
      const foreignText = page.locator('text=auditif, text=auditiva, text=français');
      if (await foreignText.count() > 0) {
        await expect(foreignText.first()).toBeVisible();
      }
    }
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.goto('http://localhost:3001/ISBDM/docs/examples/sensory-test-vocabulary/');
    await page.waitForLoadState('networkidle');
    
    // Wait for data to load
    await page.waitForSelector('text=aural', { timeout: 15000 });
    
    // Tab to interactive elements
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    
    if (await focusedElement.count() > 0) {
      await expect(focusedElement).toBeVisible();
      
      // If it's a search input, test typing
      const elementType = await focusedElement.getAttribute('type');
      if (elementType === 'search' || elementType === 'text') {
        await page.keyboard.type('aural');
        await page.waitForTimeout(500);
        
        // Should filter results
        await expect(page.locator('text=aural').first()).toBeVisible();
      }
    }
  });
});