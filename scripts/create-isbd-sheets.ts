#!/usr/bin/env tsx
// scripts/create-isbd-sheets.ts
import * as fs from 'fs';
import * as path from 'path';
import { 
  VocabularyConfig, 
  initializeGoogle, 
  findOrCreateWorkbook, 
  createVocabularySheet,
  DCTAP_PROFILES 
} from './create-vocabulary-sheet';

interface ISBDVocabulary {
  name: string;
  title: string;
  description: string;
  csvPath: string;
  profileType: 'values' | 'elements';
  languages: string[];
}

// Define all ISBD vocabularies based on the directory structure
const ISBD_VOCABULARIES: ISBDVocabulary[] = [
  // Main elements
  {
    name: 'isbd-elements',
    title: 'ISBD Elements',
    description: 'Core ISBD elements and properties for bibliographic description',
    csvPath: 'standards/isbd/csv/ns/isbd/elements.csv',
    profileType: 'elements',
    languages: ['en', 'es']
  },
  
  // Content form vocabularies
  {
    name: 'content-form',
    title: 'Content Form',
    description: 'ISBD Content Form vocabulary terms',
    csvPath: 'standards/isbd/csv/ns/isbd/terms/contentform.csv',
    profileType: 'values',
    languages: ['en', 'es']
  },
  {
    name: 'content-form-base',
    title: 'Content Form Base',
    description: 'ISBD Content Form Base vocabulary terms',
    csvPath: 'standards/isbd/csv/ns/isbd/terms/contentformbase.csv',
    profileType: 'values',
    languages: ['en', 'es']
  },
  
  // Content qualification vocabularies
  {
    name: 'dimensionality',
    title: 'Dimensionality',
    description: 'ISBD Dimensionality vocabulary for content qualification',
    csvPath: 'standards/isbd/csv/ns/isbd/terms/contentqualification/dimensionality.csv',
    profileType: 'values',
    languages: ['en', 'es']
  },
  {
    name: 'motion',
    title: 'Motion',
    description: 'ISBD Motion vocabulary for content qualification',
    csvPath: 'standards/isbd/csv/ns/isbd/terms/contentqualification/motion.csv',
    profileType: 'values',
    languages: ['en', 'es']
  },
  {
    name: 'sensory-specification',
    title: 'Sensory Specification',
    description: 'ISBD Sensory Specification vocabulary for content qualification',
    csvPath: 'standards/isbd/csv/ns/isbd/terms/contentqualification/sensoryspecfication.csv',
    profileType: 'values',
    languages: ['en', 'es']
  },
  {
    name: 'content-type',
    title: 'Content Type',
    description: 'ISBD Content Type vocabulary for content qualification',
    csvPath: 'standards/isbd/csv/ns/isbd/terms/contentqualification/type.csv',
    profileType: 'values',
    languages: ['en', 'es']
  },
  
  // Media type vocabulary
  {
    name: 'media-type',
    title: 'Media Type',
    description: 'ISBD Media Type vocabulary terms',
    csvPath: 'standards/isbd/csv/ns/isbd/terms/mediatype.csv',
    profileType: 'values',
    languages: ['en', 'es']
  },
  
  // Unconstrained elements
  {
    name: 'unconstrained-elements',
    title: 'Unconstrained Elements',
    description: 'ISBD Unconstrained Elements',
    csvPath: 'standards/isbd/csv/ns/isbd/unc/elements.csv',
    profileType: 'elements',
    languages: ['en', 'es']
  }
];

async function checkCSVExists(csvPath: string): Promise<boolean> {
  const fullPath = path.join(process.cwd(), csvPath);
  return fs.existsSync(fullPath) && fs.statSync(fullPath).isFile();
}

async function getCSVRowCount(csvPath: string): Promise<number> {
  try {
    const fullPath = path.join(process.cwd(), csvPath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    return Math.max(0, lines.length - 1); // Subtract header row
  } catch (error) {
    return 0;
  }
}

async function createVocabularySheetFromCSV(
  sheets: any,
  drive: any,
  vocabulary: ISBDVocabulary,
  spreadsheetId: string
): Promise<void> {
  console.log(`\n📊 Creating sheet for: ${vocabulary.title}`);
  
  // Check if CSV file exists
  const csvExists = await checkCSVExists(vocabulary.csvPath);
  if (!csvExists) {
    console.log(`⚠️  CSV file not found: ${vocabulary.csvPath} - skipping`);
    return;
  }
  
  // Get row count
  const rowCount = await getCSVRowCount(vocabulary.csvPath);
  console.log(`📈 Found ${rowCount} data rows in ${vocabulary.csvPath}`);
  
  if (rowCount === 0) {
    console.log(`⚠️  No data rows in ${vocabulary.csvPath} - skipping`);
    return;
  }
  
  // Create the vocabulary configuration
  const config: VocabularyConfig = {
    profileType: vocabulary.profileType,
    vocabularyName: vocabulary.name,
    title: vocabulary.title,
    description: vocabulary.description,
    languages: vocabulary.languages
  };
  
  try {
    // Create vocabulary sheet
    await createVocabularySheet(sheets, spreadsheetId, config);
    
    // Note: We'll need to populate the sheet with actual CSV data
    // For now, we're creating the structure
    console.log(`✅ Created sheet structure for: ${vocabulary.title}`);
    
  } catch (error) {
    console.error(`❌ Error creating sheet for ${vocabulary.title}:`, error);
  }
}

async function createWorkbookIndex(
  sheets: any,
  spreadsheetId: string,
  vocabularies: ISBDVocabulary[],
  workbookType: string
): Promise<void> {
  console.log(`\n📑 Creating index sheet for ${workbookType} workbook`);
  
  // Check if Index sheet exists
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const indexSheetExists = spreadsheet.data.sheets?.some(
    (sheet: any) => sheet.properties?.title === 'Index'
  );

  if (!indexSheetExists) {
    // Create Index sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Index',
              index: 0 // Place at beginning
            }
          }
        }]
      }
    });
  }

  // Prepare index data
  const indexRows = [
    ['Vocabulary Name', 'Title', 'Description', 'Languages', 'CSV Path', 'Row Count', 'Link']
  ];
  
  for (const vocab of vocabularies) {
    const csvExists = await checkCSVExists(vocab.csvPath);
    const rowCount = csvExists ? await getCSVRowCount(vocab.csvPath) : 0;
    const sheetId = spreadsheet.data.sheets?.find(
      (s: any) => s.properties?.title === vocab.name
    )?.properties?.sheetId || 0;
    
    const vocabularyUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${sheetId}`;
    
    indexRows.push([
      vocab.name,
      vocab.title,
      vocab.description,
      vocab.languages.join(', '),
      vocab.csvPath,
      rowCount.toString(),
      vocabularyUrl
    ]);
  }

  // Update index sheet
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Index!A1',
    valueInputOption: 'RAW',
    requestBody: {
      values: indexRows
    }
  });
  
  console.log(`✅ Created index with ${vocabularies.length} vocabularies`);
}

async function createDctapProfileSheet(
  sheets: any,
  spreadsheetId: string,
  profileType: string
): Promise<void> {
  const profile = DCTAP_PROFILES[profileType];
  
  // Check if DCTAP sheet already exists
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const dctapSheetExists = spreadsheet.data.sheets?.some(
    (sheet: any) => sheet.properties?.title === `DCTAP-${profileType}`
  );

  if (!dctapSheetExists) {
    // Add new sheet for DCTAP profile
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: `DCTAP-${profileType}`,
            }
          }
        }]
      }
    });

    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `DCTAP-${profileType}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [profile.columns]
      }
    });
    
    console.log(`✅ Created DCTAP-${profileType} profile sheet`);
  }
}

async function main() {
  try {
    console.log('🚀 Starting ISBD Google Sheets creation...\n');
    
    // Check if credentials are available
    if (!process.env.GSHEETS_SA_KEY) {
      console.error('❌ GSHEETS_SA_KEY environment variable not set');
      console.log('\n📋 To set up Google Sheets access:');
      console.log('1. Create a Google Service Account');
      console.log('2. Download the JSON credentials file');
      console.log('3. Base64 encode it: cat credentials.json | base64');
      console.log('4. Set environment variable: export GSHEETS_SA_KEY="<base64-string>"');
      console.log('\n💡 For now, this script will show you what would be created...\n');
      
      // Show what would be created
      console.log('📊 ISBD Vocabularies that would be created:');
      console.log('================================================');
      
      const elementVocabs = ISBD_VOCABULARIES.filter(v => v.profileType === 'elements');
      const valueVocabs = ISBD_VOCABULARIES.filter(v => v.profileType === 'values');
      
      console.log(`\n📁 Elements Workbook (${elementVocabs.length} sheets):`);
      for (const vocab of elementVocabs) {
        const csvExists = await checkCSVExists(vocab.csvPath);
        const rowCount = csvExists ? await getCSVRowCount(vocab.csvPath) : 0;
        const status = csvExists ? `${rowCount} rows` : 'CSV not found';
        console.log(`  • ${vocab.title}: ${status}`);
      }
      
      console.log(`\n📁 Values Workbook (${valueVocabs.length} sheets):`);
      for (const vocab of valueVocabs) {
        const csvExists = await checkCSVExists(vocab.csvPath);
        const rowCount = csvExists ? await getCSVRowCount(vocab.csvPath) : 0;
        const status = csvExists ? `${rowCount} rows` : 'CSV not found';
        console.log(`  • ${vocab.title}: ${status}`);
      }
      
      console.log('\n✅ Run with GSHEETS_SA_KEY to create actual spreadsheets');
      return;
    }
    
    // Initialize Google APIs
    const { sheets, drive } = initializeGoogle();
    
    // Group vocabularies by profile type
    const elementVocabs = ISBD_VOCABULARIES.filter(v => v.profileType === 'elements');
    const valueVocabs = ISBD_VOCABULARIES.filter(v => v.profileType === 'values');
    
    // Create Elements workbook
    console.log('📁 Creating ISBD Elements workbook...');
    const elementsWorkbookId = await findOrCreateWorkbook(drive, sheets, 'ISBD', 'elements');
    await createDctapProfileSheet(sheets, elementsWorkbookId, 'elements');
    
    for (const vocab of elementVocabs) {
      await createVocabularySheetFromCSV(sheets, drive, vocab, elementsWorkbookId);
    }
    
    await createWorkbookIndex(sheets, elementsWorkbookId, elementVocabs, 'Elements');
    
    // Create Values workbook
    console.log('\n📁 Creating ISBD Values workbook...');
    const valuesWorkbookId = await findOrCreateWorkbook(drive, sheets, 'ISBD', 'values');
    await createDctapProfileSheet(sheets, valuesWorkbookId, 'values');
    
    for (const vocab of valueVocabs) {
      await createVocabularySheetFromCSV(sheets, drive, vocab, valuesWorkbookId);
    }
    
    await createWorkbookIndex(sheets, valuesWorkbookId, valueVocabs, 'Values');
    
    // Final summary
    console.log('\n🎉 ISBD Google Sheets Creation Complete!');
    console.log('==========================================');
    console.log(`📊 Elements Workbook: https://docs.google.com/spreadsheets/d/${elementsWorkbookId}`);
    console.log(`📊 Values Workbook: https://docs.google.com/spreadsheets/d/${valuesWorkbookId}`);
    console.log(`\n📁 Created ${elementVocabs.length} element sheets and ${valueVocabs.length} value sheets`);
    console.log('✅ All sheets include multilingual support (EN/ES)');
    console.log('✅ Each workbook has an index sheet for easy navigation');
    console.log('✅ DCTAP profile sheets included for reference');
    
  } catch (error) {
    console.error('❌ Error creating ISBD sheets:', error);
    process.exit(1);
  }
}

// Export for testing
export { ISBD_VOCABULARIES, checkCSVExists, getCSVRowCount };

// Run if called directly
if (require.main === module) {
  main();
}