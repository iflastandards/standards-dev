#!/usr/bin/env tsx
// scripts/populate-isbd-sheets.ts
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { initializeGoogle } from './create-vocabulary-sheet';

interface CSVRow {
  [key: string]: string;
}

async function loadCSVData(csvPath: string): Promise<CSVRow[]> {
  const fullPath = path.join(process.cwd(), csvPath);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }
  
  const csvContent = fs.readFileSync(fullPath, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    comment: '#',
  }) as CSVRow[];
  
  return records;
}

async function findSheetByName(sheets: any, spreadsheetId: string, sheetName: string): Promise<number | null> {
  try {
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = spreadsheet.data.sheets?.find(
      (s: any) => s.properties?.title === sheetName
    );
    return sheet?.properties?.sheetId || null;
  } catch (error) {
    console.error(`Error finding sheet ${sheetName}:`, error);
    return null;
  }
}

async function getSheetHeaders(sheets: any, spreadsheetId: string, sheetName: string): Promise<string[]> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!1:1`,
    });
    
    return response.data.values?.[0] || [];
  } catch (error) {
    console.error(`Error getting headers for ${sheetName}:`, error);
    return [];
  }
}

async function populateSheetWithCSVData(
  sheets: any,
  spreadsheetId: string,
  sheetName: string,
  csvData: CSVRow[]
): Promise<void> {
  if (csvData.length === 0) {
    console.log(`⚠️  No data to populate for ${sheetName}`);
    return;
  }
  
  console.log(`📝 Populating ${sheetName} with ${csvData.length} rows...`);
  
  // Get current sheet headers
  const headers = await getSheetHeaders(sheets, spreadsheetId, sheetName);
  
  if (headers.length === 0) {
    console.error(`❌ No headers found for ${sheetName}`);
    return;
  }
  
  console.log(`📋 Found ${headers.length} columns in ${sheetName}`);
  
  // Convert CSV data to match sheet structure
  const rows: string[][] = [];
  
  for (const csvRow of csvData) {
    const row: string[] = [];
    
    for (const header of headers) {
      // Map CSV columns to sheet columns
      let value = '';
      
      if (csvRow[header]) {
        value = csvRow[header];
      } else {
        // Try to find a matching column with different casing or format
        const csvKeys = Object.keys(csvRow);
        const matchingKey = csvKeys.find(key => 
          key.toLowerCase() === header.toLowerCase() ||
          key.replace(/[_@\[\]]/g, '') === header.replace(/[_@\[\]]/g, '')
        );
        
        if (matchingKey) {
          value = csvRow[matchingKey];
        }
      }
      
      row.push(value || '');
    }
    
    rows.push(row);
  }
  
  // Clear existing data (except headers)
  try {
    const range = `${sheetName}!A2:ZZ${rows.length + 1}`;
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });
  } catch (error) {
    console.log(`⚠️  Could not clear existing data in ${sheetName} (may not exist yet)`);
  }
  
  // Populate with new data
  if (rows.length > 0) {
    const range = `${sheetName}!A2:${String.fromCharCode(65 + headers.length - 1)}${rows.length + 1}`;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: rows
      }
    });
    
    console.log(`✅ Populated ${sheetName} with ${rows.length} data rows`);
  } else {
    console.log(`⚠️  No valid data rows for ${sheetName}`);
  }
}

async function populateWorkbook(
  spreadsheetId: string,
  vocabularies: Array<{
    name: string;
    title: string;
    csvPath: string;
  }>
): Promise<void> {
  const { sheets } = initializeGoogle();
  
  console.log(`\n📊 Populating workbook: ${spreadsheetId}`);
  
  for (const vocab of vocabularies) {
    try {
      // Check if sheet exists
      const sheetId = await findSheetByName(sheets, spreadsheetId, vocab.name);
      
      if (sheetId === null) {
        console.log(`⚠️  Sheet '${vocab.name}' not found - skipping`);
        continue;
      }
      
      // Load CSV data
      const csvData = await loadCSVData(vocab.csvPath);
      
      // Populate sheet
      await populateSheetWithCSVData(sheets, spreadsheetId, vocab.name, csvData);
      
    } catch (error) {
      console.error(`❌ Error populating ${vocab.name}:`, error);
    }
  }
}

async function main() {
  if (!process.env.GSHEETS_SA_KEY) {
    console.error('❌ GSHEETS_SA_KEY environment variable not set');
    console.log('Please set up Google Service Account credentials first.');
    process.exit(1);
  }
  
  // Define the vocabularies (same as create-isbd-sheets.ts)
  const elementVocabs = [
    {
      name: 'isbd-elements',
      title: 'ISBD Elements',
      csvPath: 'standards/isbd/csv/ns/isbd/elements.csv'
    },
    {
      name: 'unconstrained-elements',
      title: 'Unconstrained Elements',
      csvPath: 'standards/isbd/csv/ns/isbd/unc/elements.csv'
    }
  ];
  
  const valueVocabs = [
    {
      name: 'content-form',
      title: 'Content Form',
      csvPath: 'standards/isbd/csv/ns/isbd/terms/contentform.csv'
    },
    {
      name: 'content-form-base',
      title: 'Content Form Base',
      csvPath: 'standards/isbd/csv/ns/isbd/terms/contentformbase.csv'
    },
    {
      name: 'dimensionality',
      title: 'Dimensionality',
      csvPath: 'standards/isbd/csv/ns/isbd/terms/contentqualification/dimensionality.csv'
    },
    {
      name: 'motion',
      title: 'Motion',
      csvPath: 'standards/isbd/csv/ns/isbd/terms/contentqualification/motion.csv'
    },
    {
      name: 'sensory-specification',
      title: 'Sensory Specification',
      csvPath: 'standards/isbd/csv/ns/isbd/terms/contentqualification/sensoryspecfication.csv'
    },
    {
      name: 'content-type',
      title: 'Content Type',
      csvPath: 'standards/isbd/csv/ns/isbd/terms/contentqualification/type.csv'
    },
    {
      name: 'media-type',
      title: 'Media Type',
      csvPath: 'standards/isbd/csv/ns/isbd/terms/mediatype.csv'
    }
  ];
  
  // Get spreadsheet IDs from command line arguments or environment
  const elementsSpreadsheetId = process.argv[2] || process.env.ISBD_ELEMENTS_SHEET_ID;
  const valuesSpreadsheetId = process.argv[3] || process.env.ISBD_VALUES_SHEET_ID;
  
  if (!elementsSpreadsheetId && !valuesSpreadsheetId) {
    console.error('❌ No spreadsheet IDs provided');
    console.log('Usage: npx tsx scripts/populate-isbd-sheets.ts <elements-sheet-id> <values-sheet-id>');
    console.log('Or set environment variables: ISBD_ELEMENTS_SHEET_ID and ISBD_VALUES_SHEET_ID');
    process.exit(1);
  }
  
  try {
    console.log('🚀 Starting ISBD sheet population...');
    
    if (elementsSpreadsheetId) {
      console.log('\n📁 Populating Elements workbook...');
      await populateWorkbook(elementsSpreadsheetId, elementVocabs);
    }
    
    if (valuesSpreadsheetId) {
      console.log('\n📁 Populating Values workbook...');
      await populateWorkbook(valuesSpreadsheetId, valueVocabs);
    }
    
    console.log('\n🎉 ISBD sheet population complete!');
    console.log('✅ All vocabularies have been populated with CSV data');
    console.log('✅ Sheets are ready for editor use');
    
  } catch (error) {
    console.error('❌ Error populating ISBD sheets:', error);
    process.exit(1);
  }
}

// Export for testing
export { loadCSVData, populateSheetWithCSVData };

// Run if called directly
if (require.main === module) {
  main();
}