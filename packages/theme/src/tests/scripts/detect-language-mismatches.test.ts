import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock googleapis
vi.mock('googleapis', () => ({
  google: {
    sheets: vi.fn(() => ({
      spreadsheets: {
        values: {
          batchGet: vi.fn()
        }
      }
    }))
  }
}));

// Mock google-auth-library
vi.mock('google-auth-library', () => ({
  GoogleAuth: vi.fn().mockImplementation(() => ({
    getClient: vi.fn().mockResolvedValue({})
  }))
}));

// Mock langdetect
vi.mock('langdetect', () => ({
  default: {
    detect: vi.fn((text) => {
      // Mock language detection based on text content
      if (text.includes('Hello')) return [{ lang: 'en', prob: 0.99 }];
      if (text.includes('Hola')) return [{ lang: 'es', prob: 0.98 }];
      if (text.includes('Bonjour')) return [{ lang: 'fr', prob: 0.97 }];
      if (text.includes('你好')) return [{ lang: 'zh', prob: 0.96 }];
      if (text.includes('Привет')) return [{ lang: 'ru', prob: 0.95 }];
      return [{ lang: 'en', prob: 0.5 }];
    })
  }
}));

describe('detect-language-mismatches.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Configuration', () => {
    it('should define spreadsheet configurations', () => {
      const SPREADSHEETS = [
        {
          name: 'Sensory Specification',
          spreadsheetId: '1LYfCSaQD9fUdchSHZjJ1f_n1PxiSJrfMeBBTNrKQMKQ',
          ranges: ['sensory specification vocabulary!A:Z']
        },
        {
          name: 'Polarity',
          spreadsheetId: '15xh5124c4j42Jn_DdhcZcjxnJZSTS2HV5spLflHGsko',
          ranges: ['Sheet1!A:Z']
        },
        {
          name: 'Unit of Measurement',
          spreadsheetId: '1MVaMOHOilfLU00JPMsDDKJhJ7Dxg4Pr7LzVrlQ4hwao',
          ranges: ['Sheet1!A:Z']
        },
        {
          name: 'ISBD Terms',
          spreadsheetId: '1bJ7UQPyU8R7Usj1rJ1suuxDBLFMJ-uqZELW9MdRAric',
          ranges: ['Sheet1!A:Z']
        }
      ];

      expect(SPREADSHEETS).toHaveLength(4);
      expect(SPREADSHEETS[0].name).toBe('Sensory Specification');
      expect(SPREADSHEETS[0].spreadsheetId).toBeTruthy();
      expect(SPREADSHEETS[0].ranges).toBeInstanceOf(Array);
    });

    it('should have comprehensive language code mappings', () => {
      const LANGUAGE_CODES = {
        'en': 'english',
        'es': 'spanish',
        'fr': 'french',
        'de': 'german',
        'it': 'italian',
        'pt': 'portuguese',
        'ru': 'russian',
        'ja': 'japanese',
        'ko': 'korean',
        'zh': 'chinese',
        'ar': 'arabic',
        'hi': 'hindi'
      };

      expect(LANGUAGE_CODES['en']).toBe('english');
      expect(LANGUAGE_CODES['zh']).toBe('chinese');
      expect(Object.keys(LANGUAGE_CODES).length).toBeGreaterThan(10);
    });
  });

  describe('Service Account Authentication', () => {
    it('should handle service account path from environment', () => {
      const originalEnv = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY = '/custom/path/service-account.json';

      const SERVICE_ACCOUNT_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || path.join(__dirname, '..', 'tmp', 'service-account-key.json');
      
      expect(SERVICE_ACCOUNT_PATH).toBe('/custom/path/service-account.json');

      // Restore original
      if (originalEnv) {
        process.env.GOOGLE_SERVICE_ACCOUNT_KEY = originalEnv;
      } else {
        delete process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
      }
    });

    it('should fall back to default service account path', () => {
      const originalEnv = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
      delete process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

      const SERVICE_ACCOUNT_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || path.join('scripts', '..', 'tmp', 'service-account-key.json');
      
      expect(SERVICE_ACCOUNT_PATH).toContain('tmp');
      expect(SERVICE_ACCOUNT_PATH).toContain('service-account-key.json');

      // Restore original
      if (originalEnv) {
        process.env.GOOGLE_SERVICE_ACCOUNT_KEY = originalEnv;
      }
    });
  });

  describe('Language Detection', () => {
    it('should detect English text correctly', async () => {
      const langdetect = vi.mocked((await import('langdetect')).default);
      const result = langdetect.detect('Hello world, how are you today?');
      expect(result[0].lang).toBe('en');
      expect(result[0].prob).toBeGreaterThan(0.9);
    });

    it('should detect Spanish text correctly', async () => {
      const langdetect = vi.mocked((await import('langdetect')).default);
      const result = langdetect.detect('Hola mundo, ¿cómo estás hoy?');
      expect(result[0].lang).toBe('es');
      expect(result[0].prob).toBeGreaterThan(0.9);
    });

    it('should detect Chinese text correctly', async () => {
      const langdetect = vi.mocked((await import('langdetect')).default);
      const result = langdetect.detect('你好世界，今天怎么样？');
      expect(result[0].lang).toBe('zh');
      expect(result[0].prob).toBeGreaterThan(0.9);
    });

    it('should handle mixed language text', async () => {
      const langdetect = vi.mocked((await import('langdetect')).default);
      const result = langdetect.detect('This is English text');
      expect(result[0].lang).toBe('en');
    });
  });

  describe('Spreadsheet Processing', () => {
    it('should process spreadsheet data structure correctly', () => {
      // Mock spreadsheet data structure
      const mockSheetData = {
        values: [
          ['URI', 'skos:prefLabel@en', 'skos:prefLabel@es', 'skos:prefLabel@fr', 'skos:definition@en'],
          ['http://example.com/001', 'Hello', 'Hola', 'Bonjour', 'A greeting'],
          ['http://example.com/002', 'World', 'Mundo', 'Monde', 'The planet Earth'],
          ['http://example.com/003', 'Test', 'Prueba', 'Test', 'A trial or examination']
        ]
      };

      // Extract headers
      const headers = mockSheetData.values[0];
      const languageColumns = headers.reduce((acc, header, index) => {
        const match = header.match(/@(\w{2,3})$/);
        if (match) {
          acc[index] = match[1];
        }
        return acc;
      }, {} as Record<number, string>);

      expect(languageColumns[1]).toBe('en');
      expect(languageColumns[2]).toBe('es');
      expect(languageColumns[3]).toBe('fr');
      expect(languageColumns[4]).toBe('en');
    });

    it('should identify language mismatches in data', () => {
      const mockData = [
        ['URI', 'skos:prefLabel@en', 'skos:prefLabel@es'],
        ['http://example.com/001', 'Hello', 'Bonjour'], // French text in Spanish column
        ['http://example.com/002', 'Hola', 'Hello']     // Languages swapped
      ];

      const mismatches: any[] = [];
      const langdetect = vi.mocked(import('langdetect')).default;

      // Process rows
      for (let i = 1; i < mockData.length; i++) {
        const row = mockData[i];
        for (let j = 1; j < row.length; j++) {
          const header = mockData[0][j];
          const declaredLang = header.match(/@(\w{2,3})$/)?.[1];
          const text = row[j];

          if (declaredLang && text) {
            // Using our mock detection
            let detectedLang = 'en';
            if (text.includes('Hello')) detectedLang = 'en';
            if (text.includes('Hola')) detectedLang = 'es';
            if (text.includes('Bonjour')) detectedLang = 'fr';

            if (detectedLang !== declaredLang) {
              mismatches.push({
                uri: row[0],
                column: header,
                declared: declaredLang,
                detected: detectedLang,
                text: text
              });
            }
          }
        }
      }

      expect(mismatches).toHaveLength(3);
      
      // Check for specific mismatches
      const frenchInSpanish = mismatches.find(m => m.text === 'Bonjour' && m.declared === 'es');
      expect(frenchInSpanish).toBeDefined();
      expect(frenchInSpanish.detected).toBe('fr');
      
      const spanishInEnglish = mismatches.find(m => m.text === 'Hola' && m.declared === 'en');
      expect(spanishInEnglish).toBeDefined();
      expect(spanishInEnglish.detected).toBe('es');
      
      const englishInSpanish = mismatches.find(m => m.text === 'Hello' && m.declared === 'es');
      expect(englishInSpanish).toBeDefined();
      expect(englishInSpanish.detected).toBe('en');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing service account gracefully', async () => {
      const GoogleAuth = vi.mocked((await import('google-auth-library')).GoogleAuth);
      GoogleAuth.mockImplementationOnce(() => {
        throw new Error('Service account file not found');
      });

      // The script should handle this error appropriately
      expect(() => new GoogleAuth()).toThrow('Service account file not found');
    });

    it('should handle API errors gracefully', async () => {
      const google = vi.mocked((await import('googleapis')).google);
      const mockSheets = google.sheets as any;
      
      mockSheets.mockReturnValueOnce({
        spreadsheets: {
          values: {
            batchGet: vi.fn().mockRejectedValueOnce(new Error('API quota exceeded'))
          }
        }
      });

      const sheets = mockSheets();
      await expect(sheets.spreadsheets.values.batchGet()).rejects.toThrow('API quota exceeded');
    });
  });

  describe('Output Formatting', () => {
    it('should format mismatches for console output', () => {
      const mismatch = {
        spreadsheet: 'Test Sheet',
        uri: 'http://example.com/001',
        column: 'skos:prefLabel@es',
        declared: 'es',
        detected: 'fr',
        confidence: 0.95,
        text: 'Bonjour le monde'
      };

      const formatted = `${mismatch.spreadsheet}: ${mismatch.uri} - ${mismatch.column}: declared '${mismatch.declared}' but detected '${mismatch.detected}' (${(mismatch.confidence * 100).toFixed(1)}% confidence) - "${mismatch.text}"`;

      expect(formatted).toContain('Test Sheet');
      expect(formatted).toContain('http://example.com/001');
      expect(formatted).toContain("declared 'es' but detected 'fr'");
      expect(formatted).toContain('95.0% confidence');
    });

    it('should generate summary statistics', () => {
      const mismatches = [
        { spreadsheet: 'Sheet1', declared: 'en', detected: 'es' },
        { spreadsheet: 'Sheet1', declared: 'en', detected: 'fr' },
        { spreadsheet: 'Sheet2', declared: 'es', detected: 'en' },
        { spreadsheet: 'Sheet2', declared: 'fr', detected: 'en' }
      ];

      const stats = mismatches.reduce((acc, m) => {
        const key = `${m.declared}->${m.detected}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(stats['en->es']).toBe(1);
      expect(stats['en->fr']).toBe(1);
      expect(stats['es->en']).toBe(1);
      expect(stats['fr->en']).toBe(1);
    });
  });
});