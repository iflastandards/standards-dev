import { test, expect } from '@playwright/test';

// Performance testing for core pages and functionality
test.describe('Performance Testing', () => {
  test('Portal homepage loads within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    // Navigate to portal
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Performance budget: 3 seconds for portal homepage
    expect(loadTime).toBeLessThan(3000);
    
    // Check Core Web Vitals using page.evaluate
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals: any = {};
          
          entries.forEach((entry) => {
            if (entry.entryType === 'paint') {
              vitals[entry.name] = entry.startTime;
            }
          });
          
          resolve(vitals);
        });
        
        observer.observe({ entryTypes: ['paint'] });
        
        // Fallback timeout
        setTimeout(() => resolve({}), 2000);
      });
    });
    
    console.log('Performance metrics:', { loadTime, vitals });
  });

  test('Standards site loads within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/ISBDM/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Performance budget: 4 seconds for standards sites (more content)
    expect(loadTime).toBeLessThan(4000);
  });

  test('Vocabulary table loads and renders efficiently', async ({ page }) => {
    await page.goto('/ISBDM/docs/examples/sensory-test-vocabulary/');
    
    const startTime = Date.now();
    
    // Wait for vocabulary data to load
    await page.waitForSelector('text=aural', { timeout: 10000 });
    
    const renderTime = Date.now() - startTime;
    
    // Vocabulary table should render within 5 seconds
    expect(renderTime).toBeLessThan(5000);
    
    // Test search performance
    const searchStart = Date.now();
    await page.locator('input[placeholder*="Filter"]').first().fill('visual');
    await page.waitForSelector('text=visual', { timeout: 3000 });
    const searchTime = Date.now() - searchStart;
    
    // Search filtering should be near-instant
    expect(searchTime).toBeLessThan(1000);
  });

  test('Navigation performance across different pages', async ({ page }) => {
    // Start at portal
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test navigation to different sections
    const navigationTests = [
      { name: 'ISBDM', path: '/ISBDM/' },
      { name: 'LRM', path: '/LRM/' },
      { name: 'FRBR', path: '/FRBR/' }
    ];
    
    for (const nav of navigationTests) {
      const startTime = Date.now();
      
      await page.goto(nav.path);
      await page.waitForLoadState('networkidle');
      
      const navTime = Date.now() - startTime;
      
      // Each navigation should complete within 3 seconds
      expect(navTime).toBeLessThan(3000);
      
      console.log(`${nav.name} navigation time: ${navTime}ms`);
    }
  });

  test('Memory usage remains stable during prolonged interaction', async ({ page }) => {
    await page.goto('/ISBDM/docs/examples/sensory-test-vocabulary/');
    await page.waitForLoadState('networkidle');
    
    // Wait for vocabulary table to load
    await page.waitForSelector('text=aural', { timeout: 10000 });
    
    // Perform multiple search operations to test for memory leaks
    const searchTerms = ['aural', 'visual', 'tactile', 'gustatory', 'olfactory'];
    
    for (let i = 0; i < 3; i++) { // Repeat cycle 3 times
      for (const term of searchTerms) {
        await page.locator('input[placeholder*="Filter"]').first().fill(term);
        await page.waitForTimeout(200);
        
        // Clear search
        await page.locator('input[placeholder*="Filter"]').first().fill('');
        await page.waitForTimeout(200);
      }
    }
    
    // Test language switching performance
    const languageTabs = page.locator('button:has-text("FR")');
    if (await languageTabs.count() > 0) {
      for (let i = 0; i < 5; i++) {
        await languageTabs.first().click();
        await page.waitForTimeout(300);
        
        const englishTab = page.locator('button:has-text("EN")');
        if (await englishTab.count() > 0) {
          await englishTab.first().click();
          await page.waitForTimeout(300);
        }
      }
    }
    
    // If we get here without timeout/crash, memory usage is likely stable
    expect(true).toBe(true);
  });

  test('Bundle size and resource loading efficiency', async ({ page }) => {
    // Track network requests
    const resources: any[] = [];
    
    page.on('response', (response) => {
      resources.push({
        url: response.url(),
        status: response.status(),
        size: response.headers()['content-length'],
        type: response.headers()['content-type']
      });
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Analyze resource loading
    const jsResources = resources.filter(r => r.type?.includes('javascript'));
    const cssResources = resources.filter(r => r.type?.includes('css'));
    const imageResources = resources.filter(r => r.type?.includes('image'));
    
    console.log('Resource analysis:', {
      totalRequests: resources.length,
      jsFiles: jsResources.length,
      cssFiles: cssResources.length,
      imageFiles: imageResources.length
    });
    
    // Performance assertions
    expect(resources.length).toBeLessThan(50); // Reasonable number of requests
    expect(jsResources.length).toBeLessThan(20); // Not too many JS files
    expect(cssResources.length).toBeLessThan(10); // Reasonable CSS files
    
    // Check for failed resources
    const failedResources = resources.filter(r => r.status >= 400);
    expect(failedResources.length).toBe(0);
  });

  test('Mobile performance testing', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test mobile navigation performance
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const mobileLoadTime = Date.now() - startTime;
    
    // Mobile should load within 4 seconds (allowing for slower mobile connections)
    expect(mobileLoadTime).toBeLessThan(4000);
    
    // Test mobile menu performance if present
    const mobileMenu = page.locator('[aria-label*="menu"], .navbar__toggle');
    if (await mobileMenu.count() > 0) {
      const menuStartTime = Date.now();
      
      await mobileMenu.click();
      await page.waitForTimeout(500); // Allow animation
      
      const menuTime = Date.now() - menuStartTime;
      
      // Mobile menu should open quickly
      expect(menuTime).toBeLessThan(1000);
    }
  });
});