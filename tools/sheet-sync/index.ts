#!/usr/bin/env node

const { join, dirname } = require('path');

// Load environment variables from project root
require('dotenv').config({ path: join(__dirname, '../../.env') });

const { Command } = require('commander');
const { readFileSync, writeFileSync, existsSync } = require('fs');
const { google } = require('googleapis');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

interface SheetConfig {
  sheetUrl?: string;
  sheetId?: string;
}

interface GlobalConfig {
  gsheetsSaKey?: string;
  defaultSpreadsheetId?: string;
}

interface StandardConfig {
  name: string;
  csvDir: string;
  configPath: string;
}

// Get project root directory (two levels up from tools/sheet-sync)
const PROJECT_ROOT = join(__dirname, '../../');

// Standard configurations
const STANDARDS: Record<string, StandardConfig> = {
  ISBDM: {
    name: 'ISBDM',
    csvDir: join(PROJECT_ROOT, 'standards/ISBDM/static/vocabs/xml_csv_new/ns/isbd'),
    configPath: join(PROJECT_ROOT, 'standards/ISBDM/.config/sheet.json')
  },
  LRM: {
    name: 'LRM',
    csvDir: join(PROJECT_ROOT, 'standards/LRM/csv'),
    configPath: join(PROJECT_ROOT, 'standards/LRM/.config/sheet.json')
  },
  FRBR: {
    name: 'FRBR',
    csvDir: join(PROJECT_ROOT, 'standards/FRBR/csv'),
    configPath: join(PROJECT_ROOT, 'standards/FRBR/.config/sheet.json')
  },
  isbd: {
    name: 'isbd',
    csvDir: join(PROJECT_ROOT, 'standards/isbd/csv'),
    configPath: join(PROJECT_ROOT, 'standards/isbd/.config/sheet.json')
  },
  muldicat: {
    name: 'muldicat',
    csvDir: join(PROJECT_ROOT, 'standards/muldicat/csv'),
    configPath: join(PROJECT_ROOT, 'standards/muldicat/.config/sheet.json')
  },
  unimarc: {
    name: 'unimarc',
    csvDir: join(PROJECT_ROOT, 'standards/unimarc/csv'),
    configPath: join(PROJECT_ROOT, 'standards/unimarc/.config/sheet.json')
  }
};

class SheetSyncError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SheetSyncError';
  }
}

class SheetSync {
  private sheets: any;
  private globalConfig: GlobalConfig;

  constructor() {
    // Load global configuration from environment
    this.globalConfig = {
      gsheetsSaKey: process.env.GSHEETS_SA_KEY,
      defaultSpreadsheetId: process.env.SPREADSHEET_ID
    };
  }

  private initializeAuth() {
    if (this.sheets) {
      return; // Already initialized
    }

    if (!this.globalConfig.gsheetsSaKey) {
      throw new SheetSyncError('GSHEETS_SA_KEY environment variable is required');
    }

    try {
      const credentials = JSON.parse(
        Buffer.from(this.globalConfig.gsheetsSaKey, 'base64').toString('utf8')
      );

      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      this.sheets = google.sheets({ version: 'v4', auth });
    } catch (error) {
      throw new SheetSyncError(`Failed to initialize Google Sheets auth: ${error}`);
    }
  }

  private getStandardConfig(standard: string): StandardConfig {
    const config = STANDARDS[standard.toUpperCase()];
    if (!config) {
      throw new SheetSyncError(
        `Unknown standard: ${standard}. Available: ${Object.keys(STANDARDS).join(', ')}`
      );
    }
    return config;
  }

  private loadSheetConfig(configPath: string): SheetConfig {
    let localConfig: SheetConfig = {};

    // Try to load local configuration
    if (existsSync(configPath)) {
      try {
        localConfig = JSON.parse(readFileSync(configPath, 'utf8'));
      } catch (error) {
        throw new SheetSyncError(`Failed to parse sheet config: ${error}`);
      }
    }

    // Use local sheetUrl/sheetId if available, otherwise fall back to global default
    const config: SheetConfig = {
      sheetUrl: localConfig.sheetUrl,
      sheetId: localConfig.sheetId || this.globalConfig.defaultSpreadsheetId
    };

    // Validate that we have either a sheetUrl or sheetId
    if (!config.sheetUrl && !config.sheetId) {
      throw new SheetSyncError(
        `No sheet configuration found. Either set sheetUrl in ${configPath} or SPREADSHEET_ID in .env`
      );
    }

    return config;
  }

  private extractSheetId(sheetConfig: SheetConfig): string {
    // If we have a direct sheetId, use it
    if (sheetConfig.sheetId) {
      return sheetConfig.sheetId;
    }

    // Otherwise, extract from URL
    if (sheetConfig.sheetUrl) {
      const match = sheetConfig.sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) {
        throw new SheetSyncError(`Invalid Google Sheets URL: ${sheetConfig.sheetUrl}`);
      }
      return match[1];
    }

    throw new SheetSyncError('No sheet ID or URL available');
  }

  async pull(standard: string): Promise<void> {
    console.log(`🔄 Pulling sheets for ${standard}...`);

    const config = this.getStandardConfig(standard);
    const sheetConfig = this.loadSheetConfig(config.configPath);
    const sheetId = this.extractSheetId(sheetConfig);

    // Initialize auth only when needed
    this.initializeAuth();

    try {
      // Get spreadsheet metadata to list all sheets
      const spreadsheet = await this.sheets.spreadsheets.get({ spreadsheetId: sheetId });
      const sheets = spreadsheet.data.sheets || [];

      console.log(`📊 Found ${sheets.length} sheets in workbook`);

      for (const sheet of sheets) {
        const sheetName = sheet.properties?.title;
        if (!sheetName || sheetName === 'Index') {
          continue; // Skip index sheets
        }

        console.log(`📥 Pulling sheet: ${sheetName}`);
        await this.pullSheet(sheetId, sheetName, config.csvDir);
      }

      console.log(`✅ Successfully pulled all sheets for ${standard}`);
    } catch (error) {
      throw new SheetSyncError(`Failed to pull sheets: ${error}`);
    }
  }

  private async pullSheet(sheetId: string, sheetName: string, csvDir: string): Promise<void> {
    try {
      // Get sheet data
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:ZZ`
      });

      const rows = response.data.values || [];
      if (rows.length === 0) {
        console.log(`⚠️  Sheet ${sheetName} is empty, skipping`);
        return;
      }

      // Convert to CSV
      const csvContent = stringify(rows);

      // Write to file
      const csvPath = join(csvDir, `${sheetName}.csv`);
      writeFileSync(csvPath, csvContent, 'utf8');

      console.log(`💾 Saved ${sheetName} to ${csvPath} (${rows.length} rows)`);
    } catch (error) {
      console.error(`❌ Failed to pull sheet ${sheetName}: ${error}`);
    }
  }

  async push(standard: string): Promise<void> {
    console.log(`🔄 Pushing CSV files for ${standard}...`);

    const config = this.getStandardConfig(standard);
    const sheetConfig = this.loadSheetConfig(config.configPath);
    const sheetId = this.extractSheetId(sheetConfig);

    // Initialize auth only when needed
    this.initializeAuth();

    try {
      // Find all CSV files in the directory
      const { readdirSync } = require('fs');
      const files = readdirSync(config.csvDir).filter((file: string) => file.endsWith('.csv'));

      console.log(`📁 Found ${files.length} CSV files to push`);

      for (const file of files) {
        const sheetName = file.replace('.csv', '');
        const csvPath = join(config.csvDir, file);

        console.log(`📤 Pushing ${file} to sheet: ${sheetName}`);
        await this.pushSheet(sheetId, sheetName, csvPath);
      }

      console.log(`✅ Successfully pushed all CSV files for ${standard}`);
    } catch (error) {
      throw new SheetSyncError(`Failed to push CSV files: ${error}`);
    }
  }

  private async pushSheet(sheetId: string, sheetName: string, csvPath: string): Promise<void> {
    try {
      // Read CSV file
      const csvContent = readFileSync(csvPath, 'utf8');
      const rows = parse(csvContent, { skip_empty_lines: true });

      if (rows.length === 0) {
        console.log(`⚠️  CSV file ${csvPath} is empty, skipping`);
        return;
      }

      // Check if sheet exists, create if not
      await this.ensureSheetExists(sheetId, sheetName);

      // Clear existing data
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:ZZ`
      });

      // Upload new data
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        requestBody: { values: rows }
      });

      console.log(`💾 Updated sheet ${sheetName} with ${rows.length} rows`);
    } catch (error) {
      console.error(`❌ Failed to push sheet ${sheetName}: ${error}`);
    }
  }

  private async ensureSheetExists(sheetId: string, sheetName: string): Promise<void> {
    try {
      // Get spreadsheet metadata
      const spreadsheet = await this.sheets.spreadsheets.get({ spreadsheetId: sheetId });
      const existingSheets = spreadsheet.data.sheets || [];

      // Check if sheet already exists
      const sheetExists = existingSheets.some(
        (sheet: any) => sheet.properties?.title === sheetName
      );

      if (!sheetExists) {
        console.log(`📋 Creating new sheet: ${sheetName}`);
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: sheetId,
          requestBody: {
            requests: [{
              addSheet: {
                properties: { title: sheetName }
              }
            }]
          }
        });
      }
    } catch (error) {
      console.error(`❌ Failed to ensure sheet exists: ${error}`);
    }
  }

  async status(standard: string): Promise<void> {
    console.log(`📊 Status for ${standard}:`);

    const config = this.getStandardConfig(standard);

    try {
      const sheetConfig = this.loadSheetConfig(config.configPath);

      // Show configuration details
      console.log(`📁 Config file: ${config.configPath}`);
      console.log(`📁 CSV directory: ${config.csvDir}`);

      if (sheetConfig.sheetUrl) {
        console.log(`📋 Sheet URL: ${sheetConfig.sheetUrl}`);
      }

      const sheetId = this.extractSheetId(sheetConfig);
      console.log(`🆔 Sheet ID: ${sheetId}`);

      // Check CSV directory
      if (existsSync(config.csvDir)) {
        const { readdirSync } = require('fs');
        const csvFiles = readdirSync(config.csvDir).filter((file: string) => file.endsWith('.csv'));
        console.log(`📁 CSV files: ${csvFiles.length} found in ${config.csvDir}`);
        csvFiles.forEach((file: string) => console.log(`   - ${file}`));
      } else {
        console.log(`❌ CSV directory not found: ${config.csvDir}`);
      }

      // Try to access the sheet (only if credentials are available)
      if (this.globalConfig.gsheetsSaKey) {
        try {
          this.initializeAuth();
          const spreadsheet = await this.sheets.spreadsheets.get({ spreadsheetId: sheetId });
          const sheets = spreadsheet.data.sheets || [];
          console.log(`📊 Google Sheets: ${sheets.length} sheets found`);
          sheets.forEach((sheet: any) => {
            const title = sheet.properties?.title;
            if (title) console.log(`   - ${title}`);
          });
        } catch (error) {
          console.log(`❌ Error accessing sheet: ${error}`);
        }
      } else {
        console.log(`⚠️  GSHEETS_SA_KEY not set - cannot access Google Sheets`);
      }

    } catch (error) {
      console.log(`❌ Error: ${error}`);
    }
  }
}

// CLI Interface
const program = new Command();

program
  .name('sheet-sync')
  .description('Sync CSV files with Google Sheets for IFLA standards')
  .version('1.0.0');

program
  .command('pull <standard>')
  .description('Pull data from Google Sheets to CSV files')
  .action(async (standard: string) => {
    try {
      const sync = new SheetSync();
      await sync.pull(standard);
    } catch (error) {
      if (error instanceof SheetSyncError) {
        console.error(`❌ ${error.message}`);
        process.exit(1);
      } else {
        console.error(`❌ Unexpected error: ${error}`);
        process.exit(1);
      }
    }
  });

program
  .command('push <standard>')
  .description('Push CSV files to Google Sheets')
  .action(async (standard: string) => {
    try {
      const sync = new SheetSync();
      await sync.push(standard);
    } catch (error) {
      if (error instanceof SheetSyncError) {
        console.error(`❌ ${error.message}`);
        process.exit(1);
      } else {
        console.error(`❌ Unexpected error: ${error}`);
        process.exit(1);
      }
    }
  });

program
  .command('status <standard>')
  .description('Show status and configuration for a standard')
  .action(async (standard: string) => {
    try {
      const sync = new SheetSync();
      await sync.status(standard);
    } catch (error) {
      if (error instanceof SheetSyncError) {
        console.error(`❌ ${error.message}`);
        process.exit(1);
      } else {
        console.error(`❌ Unexpected error: ${error}`);
        process.exit(1);
      }
    }
  });

program
  .command('list')
  .description('List all available standards')
  .action(() => {
    console.log('📋 Available standards:');
    Object.entries(STANDARDS).forEach(([key, config]) => {
      console.log(`   - ${key}: ${config.name}`);
      console.log(`     CSV: ${config.csvDir}`);
      console.log(`     Config: ${config.configPath}`);
      console.log();
    });
  });

// Parse command line arguments
if (require.main === module) {
  program.parse();
}
