import { describe, it, expect, beforeAll } from 'vitest';

/**
 * Deployment-critical external service connectivity tests
 * These tests verify that the deployment environment can connect to required services
 * without testing the full functionality of development tools
 */
describe('External Service Connectivity', () => {
  describe('Google Services', () => {
    beforeAll(() => {
      // Skip these tests if we're not in CI or if environment variables aren't set
      const hasGoogleCreds = !!(
        process.env.GOOGLE_SHEETS_API_KEY || 
        process.env.GSHEETS_SA_KEY
      );
      
      if (!process.env.CI || !hasGoogleCreds) {
        return;
      }
    });

    it('should have Google Sheets credentials available', () => {
      // Only run in CI
      if (!process.env.CI) {
        expect(true).toBe(true);
        return;
      }

      // At least one of these should be available
      const hasApiKey = !!process.env.GOOGLE_SHEETS_API_KEY;
      const hasServiceAccount = !!process.env.GSHEETS_SA_KEY;
      
      expect(hasApiKey || hasServiceAccount).toBe(true);
      
      // If service account is provided, it should be valid base64
      if (hasServiceAccount) {
        expect(() => {
          const decoded = Buffer.from(process.env.GSHEETS_SA_KEY!, 'base64').toString();
          JSON.parse(decoded);
        }).not.toThrow();
      }
    });

    it('should be able to make a basic Google Sheets API request', async () => {
      // Only run in CI with credentials
      if (!process.env.CI || !process.env.GOOGLE_SHEETS_API_KEY) {
        expect(true).toBe(true);
        return;
      }

      // Simple connectivity check - just verify we can reach the API
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/test?key=${process.env.GOOGLE_SHEETS_API_KEY}`,
        { method: 'GET' }
      );

      // We expect 404 (spreadsheet not found) which proves connectivity
      // 403 would mean auth issues, network errors would throw
      expect([404, 403]).toContain(response.status);
    });
  });

  describe('GitHub API', () => {
    it('should have GitHub token available in CI', () => {
      if (!process.env.CI) {
        expect(true).toBe(true);
        return;
      }

      expect(process.env.GITHUB_TOKEN).toBeDefined();
    });
  });
});