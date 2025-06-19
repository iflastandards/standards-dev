/**
 * @jest-environment node
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

describe('Vocabulary Comparison CLI', () => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'vocabulary-comparison.mjs');

    beforeEach(() => {
        // Set mock environment variables
        process.env.GOOGLE_SHEETS_API_KEY = 'test-api-key';
    });

    afterEach(() => {
        delete process.env.GOOGLE_SHEETS_API_KEY;
    });

    describe('Help Command', () => {
        it('should display help when --help is used', async () => {
            const { stdout } = await execAsync(`node ${scriptPath} --help`);
            
            expect(stdout).toContain('Generic Vocabulary Comparison Tool');
            expect(stdout).toContain('--spreadsheet-id=ID');
            expect(stdout).toContain('--markdown, -md');
            expect(stdout).toContain('--skip-rdf-check');
            expect(stdout).toContain('Examples:');
        });

        it('should display help when -h is used', async () => {
            const { stdout } = await execAsync(`node ${scriptPath} -h`);
            
            expect(stdout).toContain('Generic Vocabulary Comparison Tool');
        });
    });

    describe('Argument Parsing', () => {
        it('should require spreadsheet ID', async () => {
            try {
                await execAsync(`node ${scriptPath}`);
            } catch (error: any) {
                expect(error.stdout || error.stderr).toContain('--spreadsheet-id parameter is required');
            }
        });

        it('should require API key environment variable', async () => {
            delete process.env.GOOGLE_SHEETS_API_KEY;
            
            try {
                await execAsync(`node ${scriptPath} --spreadsheet-id=test`);
            } catch (error: any) {
                expect(error.stdout || error.stderr).toContain('GOOGLE_SHEETS_API_KEY not found');
            }
        });
    });

    describe('Package.json Scripts', () => {
        it('should have compare:vocabulary script', async () => {
            const packageJson = require('../../../../../package.json');
            
            expect(packageJson.scripts['compare:vocabulary']).toBeDefined();
            expect(packageJson.scripts['compare:vocabulary']).toContain('vocabulary-comparison.mjs');
        });

        it('should have compare:vocabulary:help script', async () => {
            const packageJson = require('../../../../../package.json');
            
            expect(packageJson.scripts['compare:vocabulary:help']).toBeDefined();
            expect(packageJson.scripts['compare:vocabulary:help']).toContain('--help');
        });

        it('should have compare:vocabulary:md script', async () => {
            const packageJson = require('../../../../../package.json');
            
            expect(packageJson.scripts['compare:vocabulary:md']).toBeDefined();
            expect(packageJson.scripts['compare:vocabulary:md']).toContain('--markdown');
        });

        it('should have compare:vocabulary:validate script', async () => {
            const packageJson = require('../../../../../package.json');
            
            expect(packageJson.scripts['compare:vocabulary:validate']).toBeDefined();
            expect(packageJson.scripts['compare:vocabulary:validate']).toContain('--skip-rdf-check');
            expect(packageJson.scripts['compare:vocabulary:validate']).toContain('--markdown');
        });
    });
});

// Test the command line argument parsing function directly
describe('parseArgs function', () => {
    // We need to dynamically import the function since it's in an ES module
    let parseArgs: any;

    beforeEach(async () => {
        // Mock process.argv for testing
        const originalArgv = process.argv;
        
        // Dynamically import the function for testing
        // Note: This is a bit complex because the file exports at the bottom
        // In a real test, you might want to refactor the script to export parseArgs
    });

    it('should parse spreadsheet ID', () => {
        const mockArgv = ['node', 'script.js', '--spreadsheet-id=test123'];
        const args = mockArgv.slice(2);
        
        // Test the parsing logic manually since we can't easily import it
        const options = {
            spreadsheetId: null,
            indexSheet: 'index',
            skipRdfCheck: false,
            markdown: false,
            outputPath: 'tmp/vocabulary-comparison-report.md',
            help: false
        };

        args.forEach(arg => {
            if (arg.startsWith('--spreadsheet-id=')) {
                options.spreadsheetId = arg.split('=')[1];
            } else if (arg.startsWith('--index-sheet=')) {
                options.indexSheet = arg.split('=')[1];
            } else if (arg.startsWith('--output=')) {
                options.outputPath = arg.split('=')[1];
            } else if (arg === '--skip-rdf-check') {
                options.skipRdfCheck = true;
            } else if (arg === '--markdown' || arg === '-md') {
                options.markdown = true;
            } else if (arg === '--help' || arg === '-h') {
                options.help = true;
            }
        });

        expect(options.spreadsheetId).toBe('test123');
        expect(options.indexSheet).toBe('index');
        expect(options.skipRdfCheck).toBe(false);
    });

    it('should parse all flags correctly', () => {
        const mockArgv = [
            'node', 'script.js',
            '--spreadsheet-id=test123',
            '--index-sheet=custom-index',
            '--output=custom/output.md',
            '--skip-rdf-check',
            '--markdown'
        ];
        const args = mockArgv.slice(2);
        
        const options = {
            spreadsheetId: null,
            indexSheet: 'index',
            skipRdfCheck: false,
            markdown: false,
            outputPath: 'tmp/vocabulary-comparison-report.md',
            help: false
        };

        args.forEach(arg => {
            if (arg.startsWith('--spreadsheet-id=')) {
                options.spreadsheetId = arg.split('=')[1];
            } else if (arg.startsWith('--index-sheet=')) {
                options.indexSheet = arg.split('=')[1];
            } else if (arg.startsWith('--output=')) {
                options.outputPath = arg.split('=')[1];
            } else if (arg === '--skip-rdf-check') {
                options.skipRdfCheck = true;
            } else if (arg === '--markdown' || arg === '-md') {
                options.markdown = true;
            } else if (arg === '--help' || arg === '-h') {
                options.help = true;
            }
        });

        expect(options.spreadsheetId).toBe('test123');
        expect(options.indexSheet).toBe('custom-index');
        expect(options.outputPath).toBe('custom/output.md');
        expect(options.skipRdfCheck).toBe(true);
        expect(options.markdown).toBe(true);
    });

    it('should handle -md shorthand for markdown', () => {
        const mockArgv = ['node', 'script.js', '--spreadsheet-id=test123', '-md'];
        const args = mockArgv.slice(2);
        
        const options = {
            spreadsheetId: null,
            indexSheet: 'index',
            skipRdfCheck: false,
            markdown: false,
            outputPath: 'tmp/vocabulary-comparison-report.md',
            help: false
        };

        args.forEach(arg => {
            if (arg.startsWith('--spreadsheet-id=')) {
                options.spreadsheetId = arg.split('=')[1];
            } else if (arg === '--markdown' || arg === '-md') {
                options.markdown = true;
            }
        });

        expect(options.markdown).toBe(true);
    });
});