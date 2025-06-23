import { test, expect } from '@playwright/test';
import { DocsEnv, sites } from '../packages/theme/src/config/siteConfigCore';

// Determine the current environment from env variable or default to localhost
const currentEnv = (process.env.DOCS_ENV as DocsEnv) || DocsEnv.Localhost;

// Define expected URL patterns for each environment
const URL_PATTERNS: Record<DocsEnv, RegExp> = {
  [DocsEnv.Localhost]: /^(http:\/\/localhost:\d+|\/)/,
  [DocsEnv.Preview]: /^(https:\/\/iflastandards\.github\.io\/standards-dev|\/standards-dev)/,
  [DocsEnv.Dev]: /^(https:\/\/jonphipps\.github\.io\/standards-dev|\/standards-dev)/,
  [DocsEnv.Production]: /^(https:\/\/www\.iflastandards\.info|\/)/,
};

// Known external links that are allowed
const ALLOWED_EXTERNAL_DOMAINS = [
  'ifla.org',
  'github.com',
  'twitter.com',
  'linkedin.com',
  'facebook.com',
  'youtube.com',
  'doi.org',
  'orcid.org',
  'creativecommons.org',
];

test.describe('Site Validation Tests', () => {
  // Test each site
  Object.entries(sites).forEach(([siteKey, siteConfigs]) => {
    const siteConfig = siteConfigs[currentEnv];
    const baseUrl = siteConfig.url + siteConfig.baseUrl;

    test.describe(`${siteKey} site validation`, () => {
      test.beforeEach(async ({ page }) => {
        // Navigate to the specific site's home page
        // For localhost, we need to ensure we're using the right port
        const fullUrl = currentEnv === DocsEnv.Localhost && siteConfig.port 
          ? `http://localhost:${siteConfig.port}${siteConfig.baseUrl}`
          : baseUrl;
        
        await page.goto(fullUrl);
        await page.waitForLoadState('networkidle');
      });

      test(`should load at correct URL for ${currentEnv} environment`, async ({ page }) => {
        const currentUrl = page.url();
        
        // Verify the site loads at the expected URL
        expect(currentUrl).toContain(siteConfig.url);
        expect(currentUrl).toContain(siteConfig.baseUrl);
      });

      test('should load all images and graphics without errors', async ({ page }) => {
        // Wait a bit for all images to start loading
        await page.waitForTimeout(1000);
        
        // Get all images on the page
        const images = await page.locator('img').all();
        const brokenImages: string[] = [];
        const missingAltTexts: string[] = [];

        for (const img of images) {
          const src = await img.getAttribute('src');
          const alt = await img.getAttribute('alt');
          
          // Check if image has alt text (accessibility)
          if (!alt || alt.trim() === '') {
            missingAltTexts.push(src || 'unknown');
          }

          // Check if image loaded successfully using multiple methods
          const isVisible = await img.isVisible();
          
          if (isVisible) {
            // Use JavaScript to check if image actually loaded
            const imageStatus = await img.evaluate((el: HTMLImageElement) => {
              return {
                complete: el.complete,
                naturalWidth: el.naturalWidth,
                naturalHeight: el.naturalHeight,
                currentSrc: el.currentSrc,
                error: el.onerror !== null
              };
            });
            
            // An image is considered broken if:
            // - It's marked as complete but has 0 natural dimensions
            // - It has an error handler attached (usually means it failed to load)
            if (imageStatus.complete && imageStatus.naturalWidth === 0 && imageStatus.naturalHeight === 0) {
              brokenImages.push(src || 'unknown');
            }
          }
        }

        // Check CSS background images
        const elementsWithBgImages = await page.locator('[style*="background-image"]').all();
        for (const element of elementsWithBgImages) {
          const bgImage = await element.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return style.backgroundImage;
          });
          
          if (bgImage && bgImage !== 'none') {
            // Extract URL from background-image
            const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
            if (urlMatch) {
              const imageUrl = urlMatch[1];
              
              // Verify the image loads
              try {
                // Convert relative URLs to absolute
                const absoluteUrl = new URL(imageUrl, page.url()).href;
                const response = await page.request.get(absoluteUrl, { failOnStatusCode: false });
                if (!response.ok()) {
                  brokenImages.push(imageUrl);
                }
              } catch {
                // If request fails, it's likely a broken image
                brokenImages.push(imageUrl);
              }
            }
          }
        }

        // Assert no broken images
        expect(brokenImages).toHaveLength(0);
        
        // Warn about missing alt texts (but don't fail the test)
        if (missingAltTexts.length > 0) {
          console.warn(`Images missing alt text in ${siteKey}:`, missingAltTexts);
        }
      });

      test('should have all links matching correct environment pattern', async ({ page }) => {
        const links = await page.locator('a[href]').all();
        const invalidLinks: { href: string; reason: string }[] = [];
        const externalLinks: string[] = [];
        const brokenLinks: { href: string; status: number }[] = [];

        for (const link of links) {
          const href = await link.getAttribute('href');
          if (!href) continue;

          // Skip anchor links and mailto/tel links
          if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            continue;
          }

          // Check if it's an absolute URL
          if (href.startsWith('http://') || href.startsWith('https://')) {
            const url = new URL(href);
            
            // Check if it's an internal link that should match our pattern
            if (url.hostname === new URL(siteConfig.url).hostname) {
              // This is an internal absolute link - it should match our environment
              if (!URL_PATTERNS[currentEnv].test(href)) {
                invalidLinks.push({ 
                  href, 
                  reason: `Does not match ${currentEnv} environment pattern` 
                });
              }
            } else {
              // External link - check if it's from allowed domains
              const isAllowed = ALLOWED_EXTERNAL_DOMAINS.some(domain => 
                url.hostname.includes(domain)
              );
              
              if (!isAllowed) {
                externalLinks.push(href);
              }
            }

            // Check if link is broken (returns 404)
            try {
              const response = await page.request.head(href, { 
                failOnStatusCode: false,
                timeout: 5000 
              });
              
              if (response.status() >= 400) {
                brokenLinks.push({ href, status: response.status() });
              }
            } catch {
              // Skip link checking for external links that might block automated requests
              if (!url.hostname.includes(new URL(siteConfig.url).hostname)) {
                console.log(`Skipping external link check for: ${href}`);
              }
            }
          } else {
            // Relative link - should follow baseUrl pattern
            if (!href.startsWith(siteConfig.baseUrl) && !href.startsWith('/') && !href.startsWith('.')) {
              invalidLinks.push({ 
                href, 
                reason: `Relative link does not match baseUrl: ${siteConfig.baseUrl}` 
              });
            }
          }
        }

        // Assert no invalid links
        expect(invalidLinks).toHaveLength(0);
        
        // Assert no broken internal links
        const brokenInternalLinks = brokenLinks.filter(link => {
          try {
            const url = new URL(link.href);
            return url.hostname === new URL(siteConfig.url).hostname;
          } catch {
            return true; // Relative links are internal
          }
        });
        expect(brokenInternalLinks).toHaveLength(0);

        // Log external links for review (but don't fail)
        if (externalLinks.length > 0) {
          console.log(`External links found in ${siteKey}:`, externalLinks);
        }
      });

      test('should have correct base URL configuration', async ({ page }) => {
        // Check if base tag is set correctly
        const baseTag = await page.locator('base').first();
        if (await baseTag.count() > 0) {
          const baseHref = await baseTag.getAttribute('href');
          expect(baseHref).toBe(siteConfig.baseUrl);
        }

        // Check if Docusaurus baseUrl is correctly configured
        const docusaurusConfig = await page.evaluate(() => {
          // @ts-ignore - window.docusaurus might exist
          return window.docusaurus?.siteConfig?.baseUrl;
        });
        
        if (docusaurusConfig) {
          expect(docusaurusConfig).toBe(siteConfig.baseUrl);
        }
      });

      test('should load critical resources without 404s', async ({ page }) => {
        const failedResources: { url: string; status: number }[] = [];

        // Listen for failed resource loads
        page.on('response', (response) => {
          if (response.status() >= 400) {
            const url = response.url();
            // Only track resources from our domain
            if (url.includes(new URL(siteConfig.url).hostname) || url.startsWith('/')) {
              failedResources.push({ url, status: response.status() });
            }
          }
        });

        // Navigate again to capture all resource loads
        await page.goto(baseUrl);
        await page.waitForLoadState('networkidle');

        // Filter out some expected 404s (like favicon.ico in dev)
        const criticalFailures = failedResources.filter(resource => {
          const ignoredPaths = ['/favicon.ico', '/robots.txt', '/sitemap.xml'];
          return !ignoredPaths.some(path => resource.url.endsWith(path));
        });

        expect(criticalFailures).toHaveLength(0);
      });

      test('should have working navigation menu', async ({ page }) => {
        // Check that navigation exists and is visible
        const nav = page.locator('nav').first();
        await expect(nav).toBeVisible();

        // Check that nav links work
        const navLinks = await nav.locator('a[href]').all();
        expect(navLinks.length).toBeGreaterThan(0);

        // Test clicking a nav link that should navigate to a different page
        let navigationTested = false;
        for (const navLink of navLinks) {
          const linkHref = await navLink.getAttribute('href');
          
          // Skip links that won't navigate (anchors, external, or home page)
          if (linkHref && 
              !linkHref.startsWith('#') && 
              !linkHref.startsWith('http') &&
              linkHref !== '/' &&
              linkHref !== siteConfig.baseUrl) {
            
            const currentUrl = page.url();
            await navLink.click();
            await page.waitForLoadState('networkidle');
            
            // Verify navigation occurred
            const newUrl = page.url();
            expect(newUrl).not.toBe(currentUrl);
            navigationTested = true;
            break;
          }
        }
        
        // If no suitable link was found to test, at least verify nav exists
        if (!navigationTested) {
          expect(navLinks.length).toBeGreaterThan(0);
        }
      });
    });
  });
});