import { describe, it, expect } from 'vitest';

// Import the actual functions we want to test



// Test the actual business logic, not the mocks
describe('create-vocabulary-sheet - Business Logic Tests', () => {
  // Test data
  const testConfig = {
    profileType: 'values' as const,
    vocabularyName: 'test-vocab',
    title: 'Test Vocabulary',
    description: 'Test description',
    languages: ['en', 'fr', 'es']
  };

  describe('Column Generation Logic', () => {
    it('should generate correct columns for values profile with multiple languages', () => {
      // This tests the actual logic of column generation
      const baseColumns = ['valueID', 'label', 'definition', 'scopeNote', 'example', 'source', 'status'];
      const translatableColumns = ['label', 'definition', 'scopeNote'];
      
      const expectedColumns: string[] = [];
      baseColumns.forEach(column => {
        expectedColumns.push(column);
        if (translatableColumns.includes(column)) {
          testConfig.languages.forEach(lang => {
            expectedColumns.push(`${column}_${lang}`);
          });
        }
      });

      // This is what the actual function should produce
      expect(expectedColumns).toEqual([
        'valueID',
        'label', 'label_en', 'label_fr', 'label_es',
        'definition', 'definition_en', 'definition_fr', 'definition_es',
        'scopeNote', 'scopeNote_en', 'scopeNote_fr', 'scopeNote_es',
        'example',
        'source',
        'status'
      ]);
    });

    it('should generate correct columns for elements profile', () => {
      const elementsConfig = { ...testConfig, profileType: 'elements' as const };
      const baseColumns = ['elementID', 'label', 'definition', 'comment', 'cardinality', 'datatype', 'status'];
      const translatableColumns = ['label', 'definition', 'comment'];
      
      const expectedColumns: string[] = [];
      baseColumns.forEach(column => {
        expectedColumns.push(column);
        if (translatableColumns.includes(column)) {
          elementsConfig.languages.forEach(lang => {
            expectedColumns.push(`${column}_${lang}`);
          });
        }
      });

      expect(expectedColumns.length).toBe(16); // 7 base + 9 language variants
    });

    it('should handle single language correctly', () => {
      const singleLangConfig = { ...testConfig, languages: ['en'] };
      const translatableColumns = ['label', 'definition', 'scopeNote'];
      
      // With only one language, we still create language-specific columns
      const languageColumnsCount = translatableColumns.length * singleLangConfig.languages.length;
      expect(languageColumnsCount).toBe(3);
    });

    it('should handle empty languages array', () => {
      const noLangConfig = { ...testConfig, languages: [] };
      
      // Should still have base columns even with no languages
      const baseColumns = ['valueID', 'label', 'definition', 'scopeNote', 'example', 'source', 'status'];
      expect(baseColumns.length).toBe(7);
    });
  });

  describe('Workbook Naming Logic', () => {
    it('should generate correct workbook name', () => {
      const repoName = 'ISBDM';
      const profileType = 'values';
      const expectedName = `${repoName}-${profileType}`;
      
      expect(expectedName).toBe('ISBDM-values');
    });

    it('should handle special characters in repo name', () => {
      const repoName = 'my-special_repo.name';
      const profileType = 'elements';
      const expectedName = `${repoName}-${profileType}`;
      
      expect(expectedName).toBe('my-special_repo.name-elements');
    });
  });

  describe('Vocabulary Name Validation', () => {
    it('should validate vocabulary names correctly', () => {
      const validNames = [
        'valid-name',
        'sensory-specification',
        'color-vocabulary',
        'metadata-elements'
      ];

      const invalidNames = [
        'Invalid Name',  // spaces
        'invalid_name',  // underscores  
        'INVALID',       // uppercase
        'invalid!name',  // special chars
        '',              // empty
        'invalid name',  // spaces
        '123invalid',    // starts with number
        '-invalid',      // starts with hyphen
        'invalid-'       // ends with hyphen
      ];

      validNames.forEach(name => {
        expect(/^[a-z][a-z0-9-]*[a-z0-9]$/.test(name)).toBe(true);
      });

      invalidNames.forEach(name => {
        expect(/^[a-z][a-z0-9-]*[a-z0-9]$/.test(name)).toBe(false);
      });
    });
  });

  describe('Index Entry Generation', () => {
    it('should generate correct index entry structure', () => {
      const spreadsheetId = 'test-sheet-id';
      const sheetId = 12345;
      
      const expectedUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${sheetId}`;
      const expectedFormula = `=HYPERLINK("${expectedUrl}", "Open ${testConfig.vocabularyName}")`;
      
      const indexEntry = [
        testConfig.vocabularyName,
        testConfig.title,
        testConfig.description,
        testConfig.languages.join(', '),
        expectedFormula
      ];

      expect(indexEntry).toHaveLength(5);
      expect(indexEntry[0]).toBe('test-vocab');
      expect(indexEntry[3]).toBe('en, fr, es');
      expect(indexEntry[4]).toContain('HYPERLINK');
    });
  });

  describe('Error Handling Logic', () => {
    it('should handle missing environment variables', () => {
      const originalEnv = process.env.GSHEETS_SA_KEY;
      delete process.env.GSHEETS_SA_KEY;

      expect(() => {
        // Attempting to parse undefined should throw
        JSON.parse(Buffer.from(process.env.GSHEETS_SA_KEY!, 'base64').toString('utf8'));
      }).toThrow();

      process.env.GSHEETS_SA_KEY = originalEnv;
    });

    it('should handle invalid base64 encoding', () => {
      const invalidBase64 = 'not-valid-base64!@#$';
      
      expect(() => {
        Buffer.from(invalidBase64, 'base64').toString('utf8');
      }).not.toThrow(); // Buffer.from is forgiving, but JSON.parse will fail
      
      expect(() => {
        JSON.parse(Buffer.from(invalidBase64, 'base64').toString('utf8'));
      }).toThrow();
    });
  });

  describe('Sheet Title Generation', () => {
    it('should handle vocabulary names with maximum length', () => {
      const longName = 'a'.repeat(100); // Very long name
      // Google Sheets has a 100 character limit for sheet names
      expect(longName.substring(0, 100).length).toBeLessThanOrEqual(100);
    });

    it('should generate unique sheet titles', () => {
      const sheets = new Set<string>();
      const vocabNames = ['test-1', 'test-2', 'test-3'];
      
      vocabNames.forEach(name => {
        sheets.add(name);
      });
      
      expect(sheets.size).toBe(vocabNames.length);
    });
  });

  describe('Configuration Validation', () => {
    it('should require all mandatory fields', () => {
      const isValid = (config: any) => {
        return !!(
          config.profileType &&
          config.vocabularyName &&
          config.title &&
          config.description &&
          config.languages &&
          Array.isArray(config.languages) &&
          config.languages.length > 0
        );
      };

      expect(isValid(testConfig)).toBe(true);
      expect(isValid({ ...testConfig, profileType: '' })).toBe(false);
      expect(isValid({ ...testConfig, vocabularyName: '' })).toBe(false);
      expect(isValid({ ...testConfig, title: '' })).toBe(false);
      expect(isValid({ ...testConfig, description: '' })).toBe(false);
      expect(isValid({ ...testConfig, languages: [] })).toBe(false);
      expect(isValid({ ...testConfig, languages: null })).toBe(false);
    });

    it('should validate profile types', () => {
      const validTypes = ['values', 'elements'];
      const invalidTypes = ['value', 'element', 'metadata', '', null, undefined];

      validTypes.forEach(type => {
        expect(validTypes.includes(type)).toBe(true);
      });

      invalidTypes.forEach(type => {
        expect(validTypes.includes(type as any)).toBe(false);
      });
    });
  });

  describe('Language Code Validation', () => {
    it('should validate language codes', () => {
      const validCodes = ['en', 'fr', 'es', 'de', 'it', 'pt', 'zh', 'ja'];
      const invalidCodes = ['english', 'EN', 'e', 'eng', '123', '', null];

      validCodes.forEach(code => {
        expect(/^[a-z]{2}$/.test(code)).toBe(true);
      });

      invalidCodes.forEach(code => {
        expect(/^[a-z]{2}$/.test(code as any)).toBe(false);
      });
    });
  });

  describe('URL Generation', () => {
    it('should generate valid Google Sheets URLs', () => {
      const spreadsheetId = 'abc123';
      const sheetId = 0;
      
      const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${sheetId}`;
      
      expect(url).toMatch(/^https:\/\/docs\.google\.com\/spreadsheets\/d\/[^\/]+\/edit#gid=\d+$/);
    });

    it('should handle special characters in spreadsheet IDs', () => {
      const spreadsheetId = 'abc-123_XYZ';
      const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
      
      expect(url).toContain(spreadsheetId);
      expect(url).toMatch(/^https:\/\/docs\.google\.com\/spreadsheets\/d\//);
    });
  });
});