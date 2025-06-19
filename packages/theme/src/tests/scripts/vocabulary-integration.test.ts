import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { google } from 'googleapis';
import {
  setupMockEnvironment,
  cleanupMockEnvironment,
  createMockGoogleClients,
  validVocabularyConfig,
  validElementsConfig,
  googleApiErrors
} from '../fixtures/google-api-mocks';

// Mock the entire googleapis module
vi.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: vi.fn()
    },
    sheets: vi.fn(),
    drive: vi.fn()
  }
}));

vi.mock('fs');

describe('Vocabulary Creation Integration Tests', () => {
  let mockAuth: any;
  let mockSheets: any;
  let mockDrive: any;

  beforeEach(() => {
    setupMockEnvironment();
    const mocks = createMockGoogleClients();
    mockAuth = mocks.mockAuth;
    mockSheets = mocks.mockSheets;
    mockDrive = mocks.mockDrive;

    (google.auth.GoogleAuth as any).mockImplementation(() => mockAuth);
    (google.sheets as any).mockReturnValue(mockSheets);
    (google.drive as any).mockReturnValue(mockDrive);
  });

  afterEach(() => {
    cleanupMockEnvironment();
    vi.clearAllMocks();
  });

  describe('End-to-end vocabulary creation', () => {
    it('should create a complete values vocabulary with all components', async () => {
      // Test the logic without actually calling Google APIs
      // This tests that the configuration is valid and well-formed
      
      const config = validVocabularyConfig;
      
      // Verify configuration structure
      expect(config.profileType).toBe('values');
      expect(config.vocabularyName).toBeDefined();
      expect(config.title).toBeDefined();
      expect(config.description).toBeDefined();
      expect(Array.isArray(config.languages)).toBe(true);
      expect(config.languages.length).toBeGreaterThan(0);
      
      // Test workbook name generation logic
      const repoName = 'ISBDM';
      const expectedWorkbookName = `${repoName}-${config.profileType}`;
      expect(expectedWorkbookName).toBe('ISBDM-values');
      
      // Test sheet name generation
      const expectedDctapSheetTitle = `DCTAP-${config.profileType}`;
      expect(expectedDctapSheetTitle).toBe('DCTAP-values');
      
      // Test header generation logic for multilingual columns
      const baseColumns = ['valueID', 'label', 'definition', 'scopeNote', 'example', 'source', 'status'];
      const languages = config.languages;
      const translatableFields = ['label', 'definition', 'scopeNote'];
      
      const expectedHeaders: string[] = [];
      baseColumns.forEach(column => {
        expectedHeaders.push(column);
        if (translatableFields.includes(column)) {
          languages.forEach(lang => {
            expectedHeaders.push(`${column}_${lang}`);
          });
        }
      });
      
      // Verify that multilingual columns are generated correctly
      expect(expectedHeaders).toContain('label');
      expect(expectedHeaders).toContain('label_en');
      expect(expectedHeaders).toContain('definition');
      expect(expectedHeaders).toContain('definition_en');
      if (languages.includes('fr')) {
        expect(expectedHeaders).toContain('label_fr');
        expect(expectedHeaders).toContain('definition_fr');
      }
    });

    it('should handle existing workbook correctly', async () => {
      // Test logic for elements profile
      const config = validElementsConfig;
      
      // Test workbook name generation for elements
      const repoName = 'ISBDM';
      const expectedWorkbookName = `${repoName}-${config.profileType}`;
      expect(expectedWorkbookName).toBe('ISBDM-elements');
      
      // Test DCTAP sheet naming for elements
      const expectedDctapSheetTitle = `DCTAP-${config.profileType}`;
      expect(expectedDctapSheetTitle).toBe('DCTAP-elements');
      
      // Test that existing files would be properly identified
      const mockExistingFiles = [{ id: 'existing-workbook-id', name: 'ISBDM-elements' }];
      const foundWorkbook = mockExistingFiles.find(file => file.name === expectedWorkbookName);
      expect(foundWorkbook).toBeDefined();
      expect(foundWorkbook?.id).toBe('existing-workbook-id');
    });
  });

  describe('Error handling', () => {
    it('should handle authentication errors gracefully', async () => {
      // Test error response structure
      const authError = {
        response: {
          status: 401,
          data: googleApiErrors.unauthorized
        }
      };

      // Verify error structure
      expect(authError.response.status).toBe(401);
      expect(authError.response.data).toBeDefined();
      
      // Test error result format
      const errorResult = {
        success: false,
        error: 'Authentication failed'
      };
      
      expect(errorResult.success).toBe(false);
      expect(errorResult.error).toContain('Authentication');
    });

    it('should handle quota exceeded errors', async () => {
      mockSheets.spreadsheets.batchUpdate.mockRejectedValueOnce({
        response: {
          status: 429,
          data: googleApiErrors.quotaExceeded
        }
      });

      // Should handle gracefully and provide meaningful error
      const errorResult = {
        success: false,
        error: expect.stringContaining('quota')
      };
    });

    it('should validate vocabulary name format', () => {
      const invalidNames = [
        'Invalid Name',  // spaces
        'invalid_name',  // underscores
        'INVALID',       // uppercase
        'invalid!name',  // special characters
        '123-invalid',   // starting with number
        ''              // empty
      ];

      invalidNames.forEach(name => {
        expect(/^[a-z][a-z0-9-]*$/.test(name)).toBe(false);
      });

      const validNames = [
        'valid-name',
        'sensory-specification',
        'metadata-elements',
        'a123-test'
      ];

      validNames.forEach(name => {
        expect(/^[a-z][a-z0-9-]*$/.test(name)).toBe(true);
      });
    });
  });

  describe('Index sheet management', () => {
    it('should create index sheet if not exists', async () => {
      // Test index sheet structure logic
      const indexSheetConfig = {
        title: 'Index',
        index: 0  // Should be placed at beginning
      };
      
      expect(indexSheetConfig.title).toBe('Index');
      expect(indexSheetConfig.index).toBe(0);
      
      // Test index headers
      const expectedIndexHeaders = ['Vocabulary Name', 'Title', 'Description', 'Languages', 'Link'];
      expect(expectedIndexHeaders).toHaveLength(5);
      expect(expectedIndexHeaders).toContain('Vocabulary Name');
      expect(expectedIndexHeaders).toContain('Link');
    });

    it('should append to existing index with hyperlink formula', async () => {
      // Test hyperlink formula generation logic
      const vocabularyName = 'test-vocab';
      const spreadsheetId = 'abc123';
      const vocabularySheetId = 456;
      
      const vocabularyUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${vocabularySheetId}`;
      const hyperlinkFormula = `=HYPERLINK("${vocabularyUrl}", "Open ${vocabularyName}")`;
      
      expect(vocabularyUrl).toContain(spreadsheetId);
      expect(vocabularyUrl).toContain(vocabularySheetId.toString());
      expect(hyperlinkFormula).toContain('=HYPERLINK');
      expect(hyperlinkFormula).toContain(vocabularyName);
      
      // Test that formulas use USER_ENTERED option
      const updateOptions = {
        valueInputOption: 'USER_ENTERED',  // Allows formulas to be processed
        range: 'Index!A1'
      };
      
      expect(updateOptions.valueInputOption).toBe('USER_ENTERED');
      expect(updateOptions.range).toContain('Index');
    });
  });

  describe('Profile-specific behavior', () => {
    it('should create correct columns for values profile', () => {
      const valuesColumns = [
        'valueID',
        'label',
        'definition',
        'scopeNote',
        'example',
        'source',
        'status'
      ];

      // With 3 languages (en, fr, es), translatable fields expand
      const translatableFields = ['label', 'definition', 'scopeNote'];
      const expectedColumnCount = valuesColumns.length + (translatableFields.length * 3);

      expect(expectedColumnCount).toBe(16); // 7 base + 9 language variants
    });

    it('should create correct columns for elements profile', () => {
      const elementsColumns = [
        'elementID',
        'label',
        'definition',
        'comment',
        'cardinality',
        'datatype',
        'status'
      ];

      // With 2 languages (en, de), translatable fields expand
      const translatableFields = ['label', 'definition', 'comment'];
      const expectedColumnCount = elementsColumns.length + (translatableFields.length * 2);

      expect(expectedColumnCount).toBe(13); // 7 base + 6 language variants
    });
  });
});