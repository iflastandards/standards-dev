import { test, expect } from '@playwright/test';

test.describe('DOCS_ENV Validation Tests', () => {
  // Test the shared-config.old getEnvironmentName function behavior
  
  test('should require DOCS_ENV to be set', async () => {
    // Create an isolated test environment
    const originalDocsEnv = process.env.DOCS_ENV;
    
    try {
      // Remove DOCS_ENV
      delete process.env.DOCS_ENV;

      expect(() => getEnvironmentName()).toThrow('FATAL: DOCS_ENV environment variable is required but not set');
    } finally {
      // Restore original DOCS_ENV
      if (originalDocsEnv) {
        process.env.DOCS_ENV = originalDocsEnv;
      }
    }
  });

  test('should reject invalid DOCS_ENV values', async () => {
    const originalDocsEnv = process.env.DOCS_ENV;
    
    try {
      // Set invalid DOCS_ENV
      process.env.DOCS_ENV = 'invalid-env';

      expect(() => getEnvironmentName()).toThrow('FATAL: Invalid DOCS_ENV value: \'invalid-env\'');
    } finally {
      // Restore original DOCS_ENV
      if (originalDocsEnv) {
        process.env.DOCS_ENV = originalDocsEnv;
      } else {
        delete process.env.DOCS_ENV;
      }
    }
  });

  test('should accept valid DOCS_ENV values', async () => {
    const validValues = ['local', 'localhost', 'preview', 'dev', 'production'];
    const originalDocsEnv = process.env.DOCS_ENV;
    
    for (const validValue of validValues) {
      try {
        process.env.DOCS_ENV = validValue;

        expect(() => getEnvironmentName()).not.toThrow();
        
        const result = getEnvironmentName();
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      } finally {
        // Restore original DOCS_ENV for next iteration
        if (originalDocsEnv) {
          process.env.DOCS_ENV = originalDocsEnv;
        } else {
          delete process.env.DOCS_ENV;
        }
      }
    }
  });

  test('should map DOCS_ENV values correctly', async () => {
    const mappings = {
      'local': 'local',
      'localhost': 'local', 
      'preview': 'preview',
      'dev': 'development',
      'production': 'production'
    };
    
    const originalDocsEnv = process.env.DOCS_ENV;
    
    for (const [input, expected] of Object.entries(mappings)) {
      try {
        process.env.DOCS_ENV = input;
        

        const result = getEnvironmentName();
        expect(result, `DOCS_ENV=${input} should map to ${expected}`).toBe(expected);
      } finally {
        // Restore original DOCS_ENV for next iteration
        if (originalDocsEnv) {
          process.env.DOCS_ENV = originalDocsEnv;
        } else {
          delete process.env.DOCS_ENV;
        }
      }
    }
  });
});
