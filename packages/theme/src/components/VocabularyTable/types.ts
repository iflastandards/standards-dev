// Language configuration interface
export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  rtl?: boolean;
}

// Multilingual content interface
export interface MultilingualText {
  [languageCode: string]: string | string[];
}

// Concept (term) properties with multilingual support
export interface ConceptProps {
  value: string | MultilingualText;      // Maps to skos:prefLabel
  definition: string | MultilingualText; // Maps to skos:definition
  scopeNote?: string | MultilingualText; // Maps to skos:scopeNote
  notation?: string | MultilingualText;  // Maps to skos:notation
  example?: string | MultilingualText;   // Maps to skos:example
  changeNote?: string | MultilingualText; // Maps to skos:changeNote
  historyNote?: string | MultilingualText; // Maps to skos:historyNote
  editorialNote?: string | MultilingualText; // Maps to skos:editorialNote
  altLabel?: string | MultilingualText; // Maps to skos:altLabel
  uri?: string; // Full URI for the concept
}

// CSV row structure matching the uploaded format
export interface CSVConceptRow {
  uri: string;
  'rdf:type': string;
  [key: string]: string | null | undefined; // For all the @lang[index] columns
}

export interface TOCItem {
  value: string;
  id: string;
  children: TOCItem[];
  level: number; // Required by Docusaurus
}

export type UriCaseStyle = 'kebab-case' | 'snake_case' | 'camelCase' | 'PascalCase';

export interface RDFMetadata {
  'rdf:type'?: string[];
  'skos:prefLabel'?: MultilingualText;
  'skos:definition'?: MultilingualText;
  'skos:scopeNote'?: MultilingualText;
  values?: ConceptProps[];
}

export interface VocabularyTableProps {
  // ConceptScheme (vocabulary) properties
  vocabularyId?: string; // Make optional when using csvFile
  title?: string | MultilingualText;
  prefix?: string;
  uri?: string;
  type?: string;
  description?: string | MultilingualText;
  scopeNote?: string | MultilingualText;
  isDefinedBy?: string;
  
  // Either use the legacy RDF structure, new concepts array, or CSV data
  RDF?: RDFMetadata;
  concepts?: ConceptProps[];
  csvData?: CSVConceptRow[]; // CSV data as source of truth
  csvFile?: string; // Path to CSV file to load automatically
  csvUrl?: string; // URL to fetch CSV data
  
  // Component configuration (UI only)
  startCounter?: number;
  uriStyle?: 'numeric' | 'slug';
  caseStyle?: UriCaseStyle;
  showTitle?: boolean;
  showFilter?: boolean;
  showURIs?: boolean; // Whether to display URIs in the table
  showLanguageSelector?: boolean;
  showCSVErrors?: boolean; // Whether to display CSV validation errors
  filterPlaceholder?: string | MultilingualText;
  defaultLanguage?: string;
  availableLanguages?: string[];
  languageConfig?: LanguageConfig[];
  preferCsvData?: boolean; // Whether to prefer CSV data over front matter
}

// Default language configurations
export const DEFAULT_LANGUAGE_CONFIG: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' }
];

// Vocabulary defaults interface for site configuration
export interface VocabularyDefaults {
  prefix?: string;
  startCounter?: number;
  uriStyle?: 'numeric' | 'slug';
  caseStyle?: UriCaseStyle;
  showFilter?: boolean;
  filterPlaceholder?: string;
  showTitle?: boolean;
  showURIs?: boolean;
  showCSVErrors?: boolean;
  defaultLanguage?: string;
  availableLanguages?: string[];
  showLanguageSelector?: boolean;
}

// Window type declaration for Docusaurus
declare global {
  interface Window {
    __DOCUSAURUS__?: {
      siteConfig: {
        customFields?: {
          vocabularyDefaults?: VocabularyDefaults;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          [key: string]: any;
        };
      };
    };
  }
}