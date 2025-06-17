# Sheet Sync CLI

A command-line tool for synchronizing CSV files with Google Sheets for IFLA standards.

## Usage

### Prerequisites

1. Set up the `GSHEETS_SA_KEY` environment variable with your Google Service Account credentials (base64 encoded)
2. Configure the sheet URL in each standard's `.config/sheet.json` file

### Commands

#### Pull data from Google Sheets to CSV files
```bash
# Using the sheet-sync tool directly
npx ts-node tools/sheet-sync/index.ts pull ISBDM

# Using the standards CLI
pnpm standards sync-sheet pull ISBDM
```

#### Push CSV files to Google Sheets
```bash
# Using the sheet-sync tool directly
npx ts-node tools/sheet-sync/index.ts push ISBDM

# Using the standards CLI
pnpm standards sync-sheet push ISBDM
```

#### Check status and configuration
```bash
# Using the sheet-sync tool directly
npx ts-node tools/sheet-sync/index.ts status ISBDM

# Using the standards CLI
pnpm standards sync-sheet status ISBDM
```

#### List available standards
```bash
# Using the sheet-sync tool directly
npx ts-node tools/sheet-sync/index.ts list

# Using the standards CLI
pnpm standards sync-sheet list
```

## Supported Standards

- **ISBDM**: International Standard Bibliographic Description for Manifestation
- **LRM**: Library Reference Model
- **FRBR**: IFLA FR Family of Models
- **isbd**: International Standard Bibliographic Description
- **muldicat**: Multilingual Dictionary of Cataloguing Terms
- **unimarc**: Universal MARC Format

## Configuration

The tool uses a hybrid configuration approach with both global and local settings:

### Global Configuration (.env file)
```bash
# Required for authentication
GSHEETS_SA_KEY=<base64-encoded-service-account-json>

# Optional: Default spreadsheet ID for all standards
SPREADSHEET_ID=<your-default-spreadsheet-id>
```

### Local Configuration (per standard)
Each standard can optionally have a `.config/sheet.json` file for site-specific settings:

```json
{
  "sheetUrl": "https://docs.google.com/spreadsheets/d/YOUR_SPECIFIC_SHEET_ID/edit",
  "sheetId": "YOUR_SPECIFIC_SHEET_ID"
}
```

**Configuration Priority:**
1. Local `sheetUrl` or `sheetId` in `.config/sheet.json` (highest priority)
2. Global `SPREADSHEET_ID` from .env file (fallback)

## Environment Variables

- `GSHEETS_SA_KEY`: Base64-encoded Google Service Account JSON credentials (required)
- `SPREADSHEET_ID`: Default spreadsheet ID used when no local configuration exists (optional)

## How it Works

1. **Pull**: Downloads all sheets from the configured Google Sheets workbook and saves them as CSV files in the standard's CSV directory
2. **Push**: Uploads all CSV files from the standard's CSV directory to the configured Google Sheets workbook
3. **Status**: Shows configuration details and checks connectivity
4. **List**: Shows all available standards and their configurations

## Error Handling

The tool provides clear error messages for common issues:
- Missing or invalid Google Service Account credentials
- Missing or invalid sheet configuration
- Network connectivity issues
- Permission problems with Google Sheets

## Integration with Epic 3

This tool is part of Epic 3 (CSV ⇆ Google Sheet Integration) and supports:
- Bidirectional synchronization between CSV files and Google Sheets
- Configuration management through `.config/sheet.json` files
- Integration with GitHub Actions for automated workflows
- Portal button integration for manual sync operations
