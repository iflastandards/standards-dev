import { defineConfig, devices } from '@playwright/test';

/**
 * Pre-push specific Playwright configuration
 * Tests against built files served via docusaurus serve
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Sequential for pre-push reliability
  forbidOnly: true,
  retries: 1, // One retry for flaky tests
  workers: 1, // Single worker for stability
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/e2e-pre-push-results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Test only essential browsers for pre-push */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox', 
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    }
  ],

  /* No automatic server - we'll manage it manually in pre-push hook */
  // webServer: undefined,
});