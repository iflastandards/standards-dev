import React, { useState, useMemo, JSX, Fragment } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { 
  VocabularyTableProps, 
  ConceptProps,
  VocabularyDefaults,
  DEFAULT_LANGUAGE_CONFIG 
} from './types';
import { 
  parseCSVToConcepts, 
  createSlug, 
  getLocalizedText,
  getAllLocalizedText,
  generateTOCFromProps,
  exportToCSV 
} from './utils';
import { useCsvLoader } from './hooks/useCsvLoader';
import { useMultilingualText } from './hooks/useMultilingualText';
import { validateCSV, ValidationResult } from './csvValidation';
import styles from './styles.module.scss';

export function VocabularyTable({
  vocabularyId,
  title,
  prefix,
  uri,
  description,
  scopeNote,
  RDF,
  concepts,
  csvData,
  csvFile,
  csvUrl,
  startCounter,
  uriStyle,
  caseStyle,
  showTitle,
  showFilter,
  showURIs,
  showLanguageSelector,
  showCSVErrors,
  filterPlaceholder,
  defaultLanguage,
  availableLanguages,
  languageConfig = DEFAULT_LANGUAGE_CONFIG,
  preferCsvData = false,
}: VocabularyTableProps): JSX.Element {
  // Get site config for default values and current locale
  const { siteConfig, i18n } = useDocusaurusContext();
  const defaults = (siteConfig.customFields?.vocabularyDefaults as VocabularyDefaults) || {};
  
  // Get current locale from Docusaurus, fallback to 'en'
  const currentLocale = i18n?.currentLocale || 'en';

  // Use props with fallback to defaults from config, then fallback to hardcoded defaults
  const resolvedPrefix = prefix || defaults.prefix || 'isbdm';
  const resolvedStartCounter = startCounter ?? defaults.startCounter ?? 1000;
  const resolvedUriStyle = uriStyle || defaults.uriStyle || 'numeric';
  const resolvedCaseStyle = caseStyle || defaults.caseStyle || 'kebab-case';
  const resolvedShowTitle = showTitle ?? defaults.showTitle ?? false;
  const resolvedShowFilter = showFilter ?? defaults.showFilter ?? true;
  const resolvedShowURIs = showURIs ?? defaults.showURIs ?? true;
  const resolvedShowLanguageSelector = showLanguageSelector ?? defaults.showLanguageSelector ?? true;
  const resolvedShowCSVErrors = showCSVErrors ?? defaults.showCSVErrors ?? true;
  // Use current locale as default language, with fallbacks
  const resolvedDefaultLanguage = defaultLanguage || defaults.defaultLanguage || currentLocale;

  // Determine the concepts array to use (CSV first if preferred, then concepts, then RDF.values)
  const baseConceptsArray = useMemo(() => {
    if (preferCsvData && csvData) {
      return parseCSVToConcepts(csvData);
    }
    return concepts || RDF?.values || [];
  }, [concepts, RDF?.values, csvData, preferCsvData]);

  // Load CSV file if csvFile prop is provided
  const { data: loadedCsvData, loading: csvLoading, error: csvError } = useCsvLoader(csvFile);

  // Determine the final concepts array to use
  const finalConceptsArray = useMemo(() => {
    // If csvFile is provided and loaded successfully, use that
    if (csvFile && loadedCsvData.length > 0) {
      return parseCSVToConcepts(loadedCsvData);
    }
    
    // Otherwise use the base concepts array
    return baseConceptsArray;
  }, [csvFile, loadedCsvData, baseConceptsArray]);

  // Validate CSV data if applicable
  const csvValidation = useMemo<ValidationResult | null>(() => {
    // Only validate if we're using CSV data
    if ((csvFile && loadedCsvData.length > 0) || (preferCsvData && csvData)) {
      const dataToValidate = csvFile && loadedCsvData.length > 0 ? loadedCsvData : csvData;
      return validateCSV(dataToValidate || []);
    }
    return null;
  }, [csvFile, loadedCsvData, csvData, preferCsvData]);

  // Auto-generate vocabularyId from csvFile if not provided
  const resolvedVocabularyId = vocabularyId || (csvFile ? 
    csvFile.split('/').pop()?.replace(/\.[^/.]+$/, "") || 'vocabulary' : 
    'vocabulary'
  );

  // Use multilingual text hook
  const {
    localizedConcepts,
    detectedLanguages,
    resolvedAvailableLanguages,
    getLanguageDisplayName
  } = useMultilingualText({
    concepts: finalConceptsArray,
    currentLanguage: resolvedDefaultLanguage,
    defaultLanguage: resolvedDefaultLanguage,
    availableLanguages,
    languageConfig
  });

  // Current language state
  const [currentLanguage, setCurrentLanguage] = useState(resolvedDefaultLanguage);

  // Get color mode - call hook unconditionally
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === 'dark';

  const [filterText, setFilterText] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Get localized filter placeholder
  const resolvedFilterPlaceholder = getLocalizedText(
    filterPlaceholder || defaults.filterPlaceholder || 'Filter values...',
    currentLanguage,
    resolvedDefaultLanguage
  );

  // Re-localize concepts when language changes
  const currentLocalizedConcepts = useMemo(() => {
    return finalConceptsArray.map(concept => ({
      value: getLocalizedText(concept.value, currentLanguage, resolvedDefaultLanguage),
      definition: getLocalizedText(concept.definition, currentLanguage, resolvedDefaultLanguage),
      scopeNote: getLocalizedText(concept.scopeNote, currentLanguage, resolvedDefaultLanguage),
      notation: getLocalizedText(concept.notation, currentLanguage, resolvedDefaultLanguage),
      example: getLocalizedText(concept.example, currentLanguage, resolvedDefaultLanguage),
      changeNote: getLocalizedText(concept.changeNote, currentLanguage, resolvedDefaultLanguage),
      historyNote: getLocalizedText(concept.historyNote, currentLanguage, resolvedDefaultLanguage),
      editorialNote: getLocalizedText(concept.editorialNote, currentLanguage, resolvedDefaultLanguage),
      altLabel: getLocalizedText(concept.altLabel, currentLanguage, resolvedDefaultLanguage),
      allAltLabels: getAllLocalizedText(concept.altLabel, currentLanguage, resolvedDefaultLanguage),
      originalConcept: concept,
    }));
  }, [finalConceptsArray, currentLanguage, resolvedDefaultLanguage]);

  // Generate URIs for concepts with SKOS relationships and apply filtering
  const conceptsWithUris = useMemo(() => {
    return currentLocalizedConcepts
      .map((concept, index) => {
        const termId = resolvedStartCounter + index;
        let identifier;

        // Get the value in current language for slug generation
        const valueText = concept.value;

        if (resolvedUriStyle === 'numeric') {
          identifier = `t${termId}`;
        } else {
          identifier = createSlug(valueText, resolvedCaseStyle);
        }

        // Use existing URI from CSV if available, otherwise generate one
        const conceptUri = concept.originalConcept.uri || `${resolvedPrefix}:${resolvedVocabularyId}#${identifier}`;

        return {
          ...concept,
          uri: conceptUri,
          id: identifier,
          // SKOS relationships
          'rdf:type': 'skos:Concept',
          'skos:inScheme': `${resolvedPrefix}:${resolvedVocabularyId}`,
          'skos:topConceptOf': `${resolvedPrefix}:${resolvedVocabularyId}`
        };
      })
      .filter(entry => {
        if (!filterText) return true;

        const searchText = filterText.toLowerCase();
        return (
          entry.value.toLowerCase().includes(searchText) ||
          entry.definition.toLowerCase().includes(searchText) ||
          (entry.scopeNote || '').toLowerCase().includes(searchText) ||
          (entry.allAltLabels && entry.allAltLabels.some(alt => alt.toLowerCase().includes(searchText)))
        );
      });
  }, [currentLocalizedConcepts, resolvedStartCounter, resolvedUriStyle, resolvedCaseStyle, resolvedPrefix, resolvedVocabularyId, filterText]);

  // Handle filter input change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value);
  };

  // Handle language change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentLanguage(e.target.value);
    setExpandedRows(new Set()); // Collapse all expanded rows when changing language
  };

  // Check if a concept has additional details
  const hasAdditionalDetails = (concept: any): boolean => {
    return !!(concept.notation || concept.example || concept.changeNote || 
              concept.historyNote || concept.editorialNote || 
              (concept.allAltLabels && concept.allAltLabels.length > 0));
  };

  // Check if any concept has additional details (to show/hide detail column)
  const hasAnyAdditionalDetails = useMemo(() => {
    return conceptsWithUris.some(hasAdditionalDetails);
  }, [conceptsWithUris]);

  // Toggle expanded state for a row
  const toggleRowExpansion = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  // Get localized title and description
  const localizedTitle = getLocalizedText(title, currentLanguage, resolvedDefaultLanguage);
  const localizedDescription = getLocalizedText(description, currentLanguage, resolvedDefaultLanguage);
  const localizedScopeNote = getLocalizedText(scopeNote, currentLanguage, resolvedDefaultLanguage);

  return (
    <div className={styles.vocabularyContainer} id={`vocabulary-${resolvedVocabularyId}`}>
      {resolvedShowTitle && localizedTitle && <h3>{localizedTitle}</h3>}

      <div className={styles.vocabularyHeader}>
        <div className={styles.vocabularyDescription}>
          {localizedDescription && <p>{localizedDescription}</p>}
          {localizedScopeNote && <p>{localizedScopeNote}</p>}
        </div>

        {resolvedShowLanguageSelector && resolvedAvailableLanguages.length > 1 && (
          <div className={styles.languageSelector}>
            <label htmlFor={`language-select-${resolvedVocabularyId}`} className={styles.languageLabel}>
              Language:
            </label>
            <select
              id={`language-select-${resolvedVocabularyId}`}
              className={styles.languageSelect}
              value={currentLanguage}
              onChange={handleLanguageChange}
              aria-label="Select display language"
            >
              {resolvedAvailableLanguages.map(langCode => (
                <option key={langCode} value={langCode}>
                  {getLanguageDisplayName(langCode)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Show CSV validation issues as collapsible error badge */}
      {resolvedShowCSVErrors && csvValidation && csvValidation.issues.length > 0 && (
        <details className={styles.errorBadgeContainer}>
          <summary className={`${styles.errorBadge} ${csvValidation.issues.some(issue => issue.type === 'error') ? styles.errorBadgeError : styles.errorBadgeWarning}`}>
            <span className={styles.errorBadgeIcon}>
              {csvValidation.issues.some(issue => issue.type === 'error') ? '❌' : '⚠️'}
            </span>
            <span className={styles.errorBadgeText}>
              {csvValidation.issues.length} validation issue{csvValidation.issues.length > 1 ? 's' : ''} found
            </span>
            <span className={styles.errorBadgeChevron}>▼</span>
          </summary>
          <div className={styles.errorBadgeContent}>
            <div className={styles.validationIssues}>
              {csvValidation.issues.map((issue, index) => (
                <div 
                  key={index} 
                  className={`${styles.validationIssue} ${styles[issue.type]}`}
                >
                  <span className={styles.issueType}>
                    {issue.type === 'error' ? '❌ Error' : '⚠️ Warning'}:
                  </span>
                  <span className={styles.issueMessage}>{issue.message}</span>
                  {issue.details && (
                    <div className={styles.issueDetails}>{issue.details}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </details>
      )}

      {/* Show CSV loading state */}
      {csvLoading && (
        <div className={styles.loadingState}>
          <p>Loading vocabulary data...</p>
        </div>
      )}

      {/* Show CSV error state */}
      {csvError && (
        <div className={styles.errorState}>
          <p>Error loading vocabulary: {csvError}</p>
        </div>
      )}

      {!csvLoading && !csvError && (
        <>
          {resolvedShowFilter && (
            <section className={styles.vocabularyControls}>
              <div className={styles.searchFilter}>
                <input
                  type="text"
                  className={styles.vocabularyFilterInput}
                  placeholder={resolvedFilterPlaceholder}
                  value={filterText}
                  onChange={handleFilterChange}
                  aria-label="Filter vocabulary terms"
                />
              </div>
            </section>
          )}

          <div className={`${styles.tableContainer} ${isDarkTheme ? styles.darkMode : ''}`}>
            <div className={styles.headerRow}>
              {hasAnyAdditionalDetails && <div className={styles.headerDetails}>Detail</div>}
              <div className={styles.headerValue}>Value</div>
              <div className={styles.headerDefinition}>Definition</div>
              <div className={styles.headerScopeNote}>Scope note</div>
            </div>

            {conceptsWithUris.length > 0 ? (
              conceptsWithUris.map((entry, index) => (
                <React.Fragment key={`${entry.id}-${currentLanguage}`}>
                  <div 
                    className={styles.dataRow} 
                    id={entry.id}
                    data-concept-id={entry.uri}
                  >
                    {hasAnyAdditionalDetails && (
                      <div className={styles.detailsCell}>
                        {hasAdditionalDetails(entry) && (
                          <button
                            className={styles.detailsToggle}
                            onClick={() => toggleRowExpansion(index)}
                            aria-expanded={expandedRows.has(index)}
                            aria-controls={`details-${index}`}
                            aria-label={expandedRows.has(index) ? 'Collapse details' : 'Expand details'}
                          >
                            {expandedRows.has(index) ? '−' : '+'}
                          </button>
                        )}
                      </div>
                    )}
                    <div className={styles.valueCell}>
                      <p className={styles.valueText}>
                        {entry.value}
                        {entry.allAltLabels && entry.allAltLabels.length > 0 && (
                          <span className={styles.altLabel}> ({entry.allAltLabels.join(', ')})</span>
                        )}
                        {entry.uri && resolvedShowURIs && <span className={styles.uriText}><br/>({entry.uri})</span>}
                      </p>
                    </div>
                    <div className={styles.definitionCell}>
                      <p>{entry.definition}</p>
                    </div>
                    <div className={styles.scopeNoteCell}>
                      <p>{entry.scopeNote || ''}</p>
                    </div>
                  </div>
                  {hasAdditionalDetails(entry) && expandedRows.has(index) && (
                    <div 
                      className={styles.detailsRow} 
                      id={`details-${index}`}
                      role="region"
                      aria-label="Additional details"
                    >
                      <div className={styles.detailsContent}>
                        {entry.allAltLabels && entry.allAltLabels.length > 0 && (
                          <div className={styles.detailItem}>
                            <strong>Alternate label{entry.allAltLabels.length > 1 ? 's' : ''}:</strong> {entry.allAltLabels.join(', ')}
                          </div>
                        )}
                        {entry.notation && (
                          <div className={styles.detailItem}>
                            <strong>Notation:</strong> {entry.notation}
                          </div>
                        )}
                        {entry.example && (
                          <div className={styles.detailItem}>
                            <strong>Example:</strong> {entry.example}
                          </div>
                        )}
                        {entry.changeNote && (
                          <div className={styles.detailItem}>
                            <strong>Change note:</strong> {entry.changeNote}
                          </div>
                        )}
                        {entry.historyNote && (
                          <div className={styles.detailItem}>
                            <strong>History note:</strong> {entry.historyNote}
                          </div>
                        )}
                        {entry.editorialNote && (
                          <div className={styles.detailItem}>
                            <strong>Editorial note:</strong> {entry.editorialNote}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))
            ) : (
              <div className={styles.noResults}>
                <p>No matching terms found.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Static method to generate TOC from props
VocabularyTable.generateTOC = generateTOCFromProps;

// CSV Export functionality
VocabularyTable.exportToCSV = exportToCSV;

export default VocabularyTable;