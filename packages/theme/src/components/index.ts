// Main component exports for IFLA theme

// Core components
export { default as ElementReference } from './ElementReference';
export { 
  VocabularyTable as default,
  VocabularyTable,
  CSVVocabulary,
  VocabularyTableFromCSV
} from './VocabularyTable';

// Management components
export { default as SiteManagement } from './SiteManagement';
export { default as SiteConfigBuilder } from './SiteConfigBuilder';

// Link components
export { default as InLink } from './InLink';
export { default as OutLink } from './OutLink';

// Content components
export { default as SeeAlso } from './SeeAlso';
export { default as Mandatory } from './Mandatory';
export { default as Unique } from './Unique';
export { default as Figure } from './Figure';
export { ExampleTable } from './ExampleTable';


// Legacy exports for backward compatibility
export { default as DownloadPanel } from './DownloadPanel';
export { default as QuickStart } from './QuickStart';

// Note: VocabularyTable utilities are available from @ifla/theme/utils and @ifla/theme/hooks

// Re-export types from main types and VocabularyTable
export type {
  ElementReferenceProps,
  InLinkProps,
  OutLinkProps,
  SeeAlsoProps,
  MandatoryProps,
  UniqueProps,
  FigureProps,
  ExampleTableProps,
  RDFData,
  IFLAThemeConfig,
  VocabularyDefaults
} from '../types';

// Export component-specific types
export type { DownloadPanelProps } from './DownloadPanel';
export type { QuickStartProps } from './QuickStart';
export type { SiteManagementProps } from './SiteManagement';

// Re-export VocabularyTable-specific types
export type {
  VocabularyTableProps,
  ConceptProps,
  MultilingualText,
  LanguageConfig,
  CSVConceptRow,
  TOCItem,
  UriCaseStyle,
  RDFMetadata
} from './VocabularyTable';