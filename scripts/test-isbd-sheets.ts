#!/usr/bin/env tsx
// scripts/test-isbd-sheets.ts
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ISBD_VOCABULARIES, checkCSVExists, getCSVRowCount } from './create-isbd-sheets';
import { loadCSVData } from './populate-isbd-sheets';

describe('ISBD Sheets Setup', () => {
  const outputDir = path.join(process.cwd(), 'output', 'isbd-sheets');
  
  it('should have created output directory', () => {
    expect(fs.existsSync(outputDir)).toBe(true);
  });
  
  it('should have created both workbook directories', () => {
    expect(fs.existsSync(path.join(outputDir, 'isbd-elements'))).toBe(true);
    expect(fs.existsSync(path.join(outputDir, 'isbd-values'))).toBe(true);
  });
  
  it('should have correct number of vocabularies', () => {
    const elementVocabs = ISBD_VOCABULARIES.filter(v => v.profileType === 'elements');
    const valueVocabs = ISBD_VOCABULARIES.filter(v => v.profileType === 'values');
    
    expect(elementVocabs).toHaveLength(2);
    expect(valueVocabs).toHaveLength(7);
    expect(ISBD_VOCABULARIES).toHaveLength(9);
  });
  
  it('should have all CSV files exist', async () => {
    for (const vocab of ISBD_VOCABULARIES) {
      const exists = await checkCSVExists(vocab.csvPath);
      expect(exists, `CSV should exist: ${vocab.csvPath}`).toBe(true);
    }
  });
  
  it('should have reasonable row counts', async () => {
    // Elements should have substantial data
    const elementsRowCount = await getCSVRowCount('standards/isbd/csv/ns/isbd/elements.csv');
    expect(elementsRowCount).toBeGreaterThan(100);
    
    // Values should have some data
    const contentFormRowCount = await getCSVRowCount('standards/isbd/csv/ns/isbd/terms/contentform.csv');
    expect(contentFormRowCount).toBeGreaterThan(5);
  });
  
  it('should have created output CSV files', () => {
    const elementsDir = path.join(outputDir, 'isbd-elements');
    const valuesDir = path.join(outputDir, 'isbd-values');
    
    // Check elements files
    expect(fs.existsSync(path.join(elementsDir, 'isbd-elements.csv'))).toBe(true);
    expect(fs.existsSync(path.join(elementsDir, 'unconstrained-elements.csv'))).toBe(true);
    expect(fs.existsSync(path.join(elementsDir, 'index.csv'))).toBe(true);
    
    // Check values files
    expect(fs.existsSync(path.join(valuesDir, 'content-form.csv'))).toBe(true);
    expect(fs.existsSync(path.join(valuesDir, 'media-type.csv'))).toBe(true);
    expect(fs.existsSync(path.join(valuesDir, 'index.csv'))).toBe(true);
  });
  
  it('should have valid CSV structure', async () => {
    // Test loading elements CSV
    const elementsData = await loadCSVData('standards/isbd/csv/ns/isbd/elements.csv');
    expect(elementsData.length).toBeGreaterThan(0);
    expect(elementsData[0]).toHaveProperty('uri');
    
    // Test loading a values CSV
    const contentFormData = await loadCSVData('standards/isbd/csv/ns/isbd/terms/contentform.csv');
    expect(contentFormData.length).toBeGreaterThan(0);
    expect(contentFormData[0]).toHaveProperty('uri');
  });
  
  it('should have multilingual content', async () => {
    const elementsData = await loadCSVData('standards/isbd/csv/ns/isbd/elements.csv');
    const firstRow = elementsData.find(row => row['skos:prefLabel@en'] && row['skos:prefLabel@es']);
    
    expect(firstRow).toBeTruthy();
    expect(firstRow?.['skos:prefLabel@en']).toBeTruthy();
    expect(firstRow?.['skos:prefLabel@es']).toBeTruthy();
  });
  
  it('should have proper ISBD URIs', async () => {
    const elementsData = await loadCSVData('standards/isbd/csv/ns/isbd/elements.csv');
    const uriRows = elementsData.filter(row => row.uri && row.uri.includes('isbd:'));
    
    expect(uriRows.length).toBeGreaterThan(0);
    expect(uriRows[0].uri).toMatch(/^isbd:/);
  });
});

// Run the tests
if (require.main === module) {
  // Note: To run this test file, use: pnpm vitest scripts/test-isbd-sheets.ts
  console.log('To run this test file, use: pnpm vitest scripts/test-isbd-sheets.ts');
}