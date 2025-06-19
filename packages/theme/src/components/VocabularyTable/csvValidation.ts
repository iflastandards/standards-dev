import { CSVConceptRow } from './types';
import { 
  getBasePropertyName, 
  isRepeatableProperty,
  isValidPropertyColumn,
  getLanguageFromColumn,
  requiresLanguageTag
} from './profileValidation';

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  details?: string;
}

export interface ValidationResult {
  issues: ValidationIssue[];
  isValid: boolean;
}

export function validateCSVHeaders(headers: string[]): ValidationResult {
  const issues: ValidationIssue[] = [];
  const processedProperties = new Map<string, {
    headers: string[],
    languages: Set<string>,
    hasRepeats: boolean
  }>();
  const allLanguages = new Set<string>();
  
  // Process headers and check for duplicates (only if NOT repeatable)
  headers.forEach((header, index) => {
    const baseProp = getBasePropertyName(header);
    const language = getLanguageFromColumn(header);
    
    if (!isValidPropertyColumn(header) && header !== 'uri') {
      issues.push({
        type: 'warning',
        message: `Unknown column: "${header}"`,
        details: 'This column is not defined in the ISBDM value vocabulary profile'
      });
      return;
    }
    
    // Track languages
    if (language) {
      allLanguages.add(language);
    }
    
    // Initialize property tracking
    if (!processedProperties.has(baseProp)) {
      processedProperties.set(baseProp, {
        headers: [],
        languages: new Set(),
        hasRepeats: false
      });
    }
    
    const propInfo = processedProperties.get(baseProp)!;
    propInfo.headers.push(header);
    
    if (language) {
      propInfo.languages.add(language);
    }
    
    // Check if this is a repeated column (has array notation like [0], [1])
    if (header.match(/\[\d+\]$/)) {
      propInfo.hasRepeats = true;
    }
    
    // Check for true duplicates (same exact header, not array notation)
    const duplicateIndex = headers.findIndex((h, i) => i !== index && h === header);
    if (duplicateIndex !== -1) {
      issues.push({
        type: 'error',
        message: `Duplicate column header found: "${header}"`,
        details: `Found at positions ${duplicateIndex + 1} and ${index + 1}. Use array notation [0], [1] for repeatable properties.`
      });
    }
  });
  
  // Check for required properties
  const requiredProps = ['uri', 'skos:prefLabel'];
  requiredProps.forEach(prop => {
    if (!processedProperties.has(prop)) {
      issues.push({
        type: 'error',
        message: `Missing required column: "${prop}"`,
        details: prop === 'uri' ? 'Each concept must have a unique URI identifier' : 
                'Each concept must have at least one preferred label for each language'
      });
    }
  });
  
  // Check if skos:prefLabel exists for all languages
  if (processedProperties.has('skos:prefLabel') && allLanguages.size > 0) {
    const prefLabelLangs = processedProperties.get('skos:prefLabel')!.languages;
    const missingLangs = Array.from(allLanguages).filter(lang => !prefLabelLangs.has(lang));
    
    if (missingLangs.length > 0) {
      issues.push({
        type: 'error',
        message: 'Missing required skos:prefLabel for some languages',
        details: `Languages without prefLabel: ${missingLangs.join(', ')}. PrefLabel is required for all languages.`
      });
    }
  }
  
  // Check for array notation on non-repeatable properties
  processedProperties.forEach((propInfo, propName) => {
    if (propInfo.hasRepeats && !isRepeatableProperty(propName) && propName !== 'uri') {
      issues.push({
        type: 'error',
        message: `Property "${propName}" is not repeatable`,
        details: 'Array notation [0], [1] should only be used for repeatable properties'
      });
    }
  });
  
  // Check for inconsistent language coverage (warning only)
  processedProperties.forEach((propInfo, propName) => {
    if (requiresLanguageTag(propName) && propInfo.languages.size > 0) {
      const missingLangs = Array.from(allLanguages).filter(lang => !propInfo.languages.has(lang));
      if (missingLangs.length > 0 && missingLangs.length < allLanguages.size) {
        issues.push({
          type: 'warning',
          message: `Inconsistent language coverage for "${propName}"`,
          details: `Missing languages: ${missingLangs.join(', ')}. Available: ${Array.from(propInfo.languages).join(', ')}`
        });
      }
    }
  });
  
  // Recommend skos:definition
  if (!processedProperties.has('skos:definition')) {
    issues.push({
      type: 'warning',
      message: 'Missing "skos:definition" column',
      details: 'Concepts should have definitions for clarity'
    });
  }
  
  return {
    issues,
    isValid: issues.filter(i => i.type === 'error').length === 0
  };
}

export function validateCSVData(data: CSVConceptRow[], headers: string[]): ValidationResult {
  const issues: ValidationIssue[] = [];
  
  // Get all languages from headers
  const allLanguages = new Set<string>();
  headers.forEach(header => {
    const lang = getLanguageFromColumn(header);
    if (lang) allLanguages.add(lang);
  });
  
  // Check for empty rows
  const emptyRowIndices: number[] = [];
  data.forEach((row, index) => {
    const hasContent = Object.values(row).some(value => value && value.toString().trim() !== '');
    if (!hasContent) {
      emptyRowIndices.push(index + 2); // +2 for header row and 1-based indexing
    }
  });
  
  if (emptyRowIndices.length > 0) {
    issues.push({
      type: 'warning',
      message: `Found ${emptyRowIndices.length} empty row(s)`,
      details: `Empty rows at line(s): ${emptyRowIndices.slice(0, 5).join(', ')}${emptyRowIndices.length > 5 ? '...' : ''}`
    });
  }
  
  // Check for missing required values
  const missingUris: number[] = [];
  const missingLabelsPerLang = new Map<string, number[]>();
  
  // Initialize tracking for each language
  allLanguages.forEach(lang => {
    missingLabelsPerLang.set(lang, []);
  });
  
  data.forEach((row, index) => {
    const rowNum = index + 2;
    
    // Check URI
    if (!row.uri || row.uri.trim() === '') {
      missingUris.push(rowNum);
    }
    
    // Check prefLabel for each language that exists in the CSV
    allLanguages.forEach(lang => {
      const prefLabelColumns = headers.filter(h => 
        getBasePropertyName(h) === 'skos:prefLabel' && 
        getLanguageFromColumn(h) === lang
      );
      
      const hasLabelForLang = prefLabelColumns.some(col => 
        row[col] && row[col].trim() !== ''
      );
      
      if (!hasLabelForLang) {
        missingLabelsPerLang.get(lang)!.push(rowNum);
      }
    });
  });
  
  // Report missing URIs
  if (missingUris.length > 0) {
    issues.push({
      type: 'error',
      message: `Missing URI in ${missingUris.length} row(s)`,
      details: `Rows without URI: ${missingUris.slice(0, 5).join(', ')}${missingUris.length > 5 ? '...' : ''}`
    });
  }
  
  // Report missing labels per language
  missingLabelsPerLang.forEach((rows, lang) => {
    if (rows.length > 0) {
      issues.push({
        type: 'error',
        message: `Missing skos:prefLabel@${lang} in ${rows.length} row(s)`,
        details: `Rows without ${lang} label: ${rows.slice(0, 5).join(', ')}${rows.length > 5 ? '...' : ''}`
      });
    }
  });
  
  // Check for inconsistent data within rows (for optional properties)
  const inconsistentRows = new Set<number>();
  const languageProperties = new Map<string, string[]>();
  
  // Group columns by property and track languages (excluding prefLabel as it's required)
  headers.forEach(header => {
    const baseProp = getBasePropertyName(header);
    const lang = getLanguageFromColumn(header);
    
    if (lang && baseProp !== 'skos:prefLabel' && requiresLanguageTag(baseProp)) {
      if (!languageProperties.has(baseProp)) {
        languageProperties.set(baseProp, []);
      }
      languageProperties.get(baseProp)!.push(header);
    }
  });
  
  // Check each row for consistency in optional properties
  data.forEach((row, rowIndex) => {
    let hasInconsistency = false;
    
    languageProperties.forEach((columns) => {
      const filledColumns = columns.filter(col => row[col] && row[col].trim() !== '');
      const emptyColumns = columns.filter(col => !row[col] || row[col].trim() === '');
      
      // If some but not all language columns are filled, it's inconsistent
      if (filledColumns.length > 0 && emptyColumns.length > 0) {
        hasInconsistency = true;
      }
    });
    
    if (hasInconsistency) {
      inconsistentRows.add(rowIndex + 2);
    }
  });
  
  if (inconsistentRows.size > 0) {
    const rowNumbers = Array.from(inconsistentRows).sort((a, b) => a - b);
    issues.push({
      type: 'warning',
      message: `Found ${inconsistentRows.size} row(s) with inconsistent language data`,
      details: `Rows with missing translations: ${rowNumbers.slice(0, 5).join(', ')}${rowNumbers.length > 5 ? '...' : ''}`
    });
  }
  
  // Check for invalid URIs
  const invalidUris: string[] = [];
  data.forEach((row, index) => {
    if (row.uri && !isValidUri(row.uri)) {
      invalidUris.push(`Line ${index + 2}: ${row.uri}`);
    }
  });
  
  if (invalidUris.length > 0) {
    issues.push({
      type: 'warning',
      message: `Found ${invalidUris.length} invalid URI(s)`,
      details: invalidUris.slice(0, 3).join('; ') + (invalidUris.length > 3 ? '...' : '')
    });
  }
  
  return {
    issues,
    isValid: issues.filter(i => i.type === 'error').length === 0
  };
}

function isValidUri(uri: string): boolean {
  // Basic URI validation - check for namespace:localName pattern or full HTTP(S) URI
  const namespacePattern = /^[a-zA-Z][a-zA-Z0-9]*:[a-zA-Z0-9_\-]+$/;
  const httpPattern = /^https?:\/\//;
  
  return namespacePattern.test(uri) || httpPattern.test(uri);
}

export function validateCSV(csvData: CSVConceptRow[]): ValidationResult {
  if (!csvData || csvData.length === 0) {
    return {
      issues: [{
        type: 'error',
        message: 'No data found in CSV file',
        details: 'The CSV file appears to be empty or could not be parsed'
      }],
      isValid: false
    };
  }
  
  // Get headers from the first row's keys
  const headers = Object.keys(csvData[0]);
  
  // Validate headers
  const headerValidation = validateCSVHeaders(headers);
  
  // Validate data
  const dataValidation = validateCSVData(csvData, headers);
  
  // Combine results
  return {
    issues: [...headerValidation.issues, ...dataValidation.issues],
    isValid: headerValidation.isValid && dataValidation.isValid
  };
}