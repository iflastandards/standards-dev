import { test, expect } from '@playwright/test';

// All sites currently running on serve:all
const sites = [
  { name: 'portal', url: 'http://localhost:3000', path: '/' },
  { name: 'isbdm', url: 'http://localhost:3001', path: '/ISBDM/' },
  { name: 'lrm', url: 'http://localhost:3002', path: '/LRM/' },
  { name: 'frbr', url: 'http://localhost:3003', path: '/FRBR/' },
  { name: 'isbd', url: 'http://localhost:3004', path: '/isbd/' },
  { name: 'muldicat', url: 'http://localhost:3005', path: '/muldicat/' },
  { name: 'unimarc', url: 'http://localhost:3006', path: '/unimarc/' },
];

for (const site of sites) {
  test(`${site.name} homepage visual regression`, async ({ page }) => {
    await page.goto(`${site.url}${site.path}`);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot(`${site.name}-homepage.png`);
  });

  test(`${site.name} docs page visual regression`, async ({ page }) => {
    await page.goto(`${site.url}${site.path}docs/intro`);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot(`${site.name}-docs.png`);
  });
}