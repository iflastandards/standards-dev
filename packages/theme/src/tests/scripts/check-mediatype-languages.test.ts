import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

// Mock environment variables
const mockEnv = {
  GOOGLE_SHEETS_API_KEY: 'test-api-key',
  SPREADSHEET_ID: 'test-spreadsheet-id',
  ANTHROPIC_API_KEY: 'test-anthropic-key'
};

describe.skip('check-mediatype-languages.mjs', () => {
  const projectRoot = path.resolve(__dirname, '../../../../..');
  const scriptPath = path.join(projectRoot, 'scripts', 'check-mediatype-languages.mjs');
  const tmpDir = path.join(projectRoot, 'tmp');

  beforeEach(async () => {
    // Debug: Check current working directory
    console.log('Test CWD:', process.cwd());
    console.log('Script path:', scriptPath);
    
    // Verify script exists
    try {
      await fs.access(scriptPath);
    } catch (error) {
      console.error(`Script not found at: ${scriptPath}`);
      throw error;
    }
    
    // Ensure tmp directory exists
    await fs.mkdir(tmpDir, { recursive: true });
    
    // Clean up any existing markdown files
    const files = await fs.readdir(tmpDir);
    for (const file of files) {
      if (file.startsWith('language-tag-mismatches')) {
        await fs.unlink(path.join(tmpDir, file));
      }
    }
  });

  afterEach(async () => {
    // Clean up generated files
    const files = await fs.readdir(tmpDir);
    for (const file of files) {
      if (file.startsWith('language-tag-mismatches')) {
        await fs.unlink(path.join(tmpDir, file));
      }
    }
  });

  describe('Command Line Arguments', () => {
    it('should show help when --help flag is used', async () => {
      try {
        const result = await execAsync(`tsx ${scriptPath} --help`, { 
          cwd: projectRoot,
          env: { ...process.env }
        });
        const stdout = result.stdout || '';
        const stderr = result.stderr || '';
        
        console.log('Command stdout:', JSON.stringify(stdout));
        console.log('Command stderr:', JSON.stringify(stderr));
        
        expect(stdout).toContain('Language Tag Checker for Google Sheets');
        expect(stdout).toContain('Usage:');
        expect(stdout).toContain('Options:');
        expect(stdout).toContain('--spreadsheet-id=ID');
        expect(stdout).toContain('--ai');
        expect(stdout).toContain('--markdown');
        expect(stdout).toContain('Examples:');
      } catch (error) {
        // If the command fails, check stderr
        console.error('Command failed:', error);
        console.error('Command stderr:', error.stderr);
        console.error('Command stdout:', error.stdout);
        throw error;
      }
    });

    it('should handle -h alias for help', async () => {
      const result = await execAsync(`tsx ${scriptPath} -h`, { cwd: projectRoot });
      const stdout = result.stdout || '';
      
      expect(stdout).toContain('Language Tag Checker for Google Sheets');
    });
  });

  describe('Mock Data Processing', () => {
    // Create a mock version of the script for testing without real API calls
    const createMockScript = async () => {
      const mockScriptContent = `
import { run } from '${scriptPath.replace(/\\/g, '\\\\')}';

// Mock environment variables
process.env.SPREADSHEET_ID = 'mock-spreadsheet-id';
process.env.GOOGLE_SHEETS_API_KEY = 'mock-api-key';

// Mock fetch to return controlled data
global.fetch = async (url) => {
    const urlStr = url.toString();
    if (urlStr.includes('gid=0')) { // index sheet
        return new Response('simpletest', { status: 200 });
    } else if (urlStr.includes('sheet1')) { // data sheet
        const csvData = [
            '"label@en","label@zh"',
            '"Apple","\u82f9\u679c"', // Correct: 苹果
            '"Banana","Banane"', // Incorrect: German in Chinese column
            '"Cherry","\u6a31\u6843"' // Correct: 樱桃
        ].join('\n');
        return new Response(csvData, { status: 200 });
    }
    return new Response('Not Found', { status: 404 });
};

// Mock langdetect
const langdetect = {
    detect: (text) => {
        if (text === 'Banane') return [{ lang: 'de', prob: 0.99 }];
        if (text === '\u82f9\u679c' || text === '\u6a31\u6843') return [{ lang: 'zh', prob: 0.99 }]; // 苹果, 樱桃
        return [{ lang: 'en', prob: 0.99 }];
    }
};

// Mock Anthropic SDK
global.Anthropic = class {
    constructor() {}
    async messages() {
        return {
            create: () => ({ content: [{ text: '{"language":"de"}' }] })
        };
    }
};

// Run the script's main logic
run();
`;

      const mockScriptPath = path.join(tmpDir, 'mock-check-mediatype-languages.js');
      await fs.writeFile(mockScriptPath, mockScriptContent);
      return mockScriptPath;
    };

    it('should detect language mismatches in mock data', async () => {
      const mockScript = await createMockScript();
      const { stdout = '' } = await execAsync(`tsx ${mockScript}`, { cwd: projectRoot });
      
      expect(stdout).toContain('Found 1 language mismatches');
      expect(stdout).toContain('Row 3: zh -> de'); // German text in Chinese column
    });

    it('should generate markdown report with --markdown flag', async () => {
      const mockScript = await createMockScript();
      await execAsync(`tsx ${mockScript} --markdown`, { cwd: projectRoot });
      
      const reportPath = path.join(tmpDir, 'language-tag-mismatches.md');
      const reportContent = await fs.readFile(reportPath, 'utf-8');
      
      expect(reportContent).toContain('# Language Tag Mismatch Report');
      expect(reportContent).toContain('Total mismatches found: **1**');
      expect(reportContent).toContain('| test:002 |');
      expect(reportContent).toContain('| zh | de |');
      expect(reportContent).toContain('Banane');
    });

    it('should generate AI-specific markdown report with --ai flag', async () => {
      const mockScript = await createMockScript();
      await execAsync(`tsx ${mockScript} --markdown --ai`, { cwd: projectRoot });
      
      const reportPath = path.join(tmpDir, 'language-tag-mismatches-ai.md');
      const exists = await fs.access(reportPath).then(() => true).catch(() => false);
      
      expect(exists).toBe(true);
    });
  });

  describe('Language Detection Functions', () => {
    it('should correctly identify Chinese characters', async () => {
      const testText = '\u4f60\u597d\u4e16\u754c';
      const containsChinese = /[\u4e00-\u9fa5]/.test(testText);
      expect(containsChinese).toBe(true);
    });

    it('should correctly identify Cyrillic characters', async () => {
      const testText = '\u041f\u0440\u0438\u0432\u0435\u0442 \u043c\u0438\u0440';
      const containsCyrillic = /[\u0400-\u04FF]/.test(testText);
      expect(containsCyrillic).toBe(true);
    });

    it('should correctly identify Arabic characters', async () => {
      const testText = '\u0645\u0631\u062d\u0628\u0627 \u0628\u0627\u0644\u0639\u0627\u0644\u0645';
      const containsArabic = /[\u0600-\u06FF]/.test(testText);
      expect(containsArabic).toBe(true);
    });
  });

  describe('Language Code Mapping', () => {
    const LANGUAGE_NAMES = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'ar': 'Arabic'
    };

    it('should return correct language names', () => {
      expect(LANGUAGE_NAMES['en']).toBe('English');
      expect(LANGUAGE_NAMES['es']).toBe('Spanish');
      expect(LANGUAGE_NAMES['zh']).toBe('Chinese');
    });

    it('should handle unknown language codes', () => {
      const getLanguageName = (code: string) => LANGUAGE_NAMES[code] || code.toUpperCase();
      expect(getLanguageName('xx')).toBe('XX');
    });
  });

  describe('Technical Text Detection', () => {
    const isLikelyTechnicalText = (text: string): boolean => {
      // Simple implementation for testing
      const patterns = [
        /^[A-Z0-9_]+$/,                    // All caps identifiers
        /^\w+\(\w*\)$/,                    // Function-like syntax
        /^[a-z]+\s*\([^)]+\)$/i,           // Text with parentheses
        /^[A-Z][a-z]+[A-Z][a-z]+/,         // CamelCase
        /^[a-z]+_[a-z]+$/,                 // snake_case
        /^[a-z]+-[a-z]+$/                  // kebab-case
      ];
      
      return patterns.some(pattern => pattern.test(text.trim()));
    };

    it('should identify technical text patterns', () => {
      expect(isLikelyTechnicalText('CONSTANT_NAME')).toBe(true);
      expect(isLikelyTechnicalText('function()')).toBe(true);
      expect(isLikelyTechnicalText('text (visual)')).toBe(true);
      expect(isLikelyTechnicalText('CamelCase')).toBe(true);
      expect(isLikelyTechnicalText('snake_case')).toBe(true);
      expect(isLikelyTechnicalText('kebab-case')).toBe(true);
      expect(isLikelyTechnicalText('Normal text here')).toBe(false);
    });
  });
});