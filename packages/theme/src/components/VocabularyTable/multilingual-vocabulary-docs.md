# VocabularyTable Component

The `VocabularyTable` component displays a value vocabulary with its terms, definitions, and scope notes in a tabular format. It includes multilingual support, filtering capabilities, and CSV import/export functionality to help users work with multilingual vocabularies efficiently.

## Key Features

- **Multilingual Support**: Display content in multiple languages with automatic language detection
- **Locale-Aware Defaults**: Automatically uses current Docusaurus locale as default language
- **Language Selector**: Dropdown to switch between available languages
- **CSV Import/Export**: Import vocabulary data from CSV files or export to CSV format
- **Simplified CSV Loading**: Load CSV files directly with `csvFile` prop
- **Flexible Data Sources**: Support for front matter, concepts array, or CSV data as source of truth
- **Filtering**: Search across multilingual content including alternative labels
- **Expandable Details**: View additional SKOS properties in expandable sections
- **RTL Support**: Proper display for right-to-left languages

## Simplified CSV Usage

The easiest way to use CSV data is with the `csvFile` prop:

```mdx
<!-- Ultra-simple usage -->
<VocabularyTable csvFile="vocabularies/csv/sensoryspecification.csv" />

<!-- With minimal configuration -->
<VocabularyTable 
  csvFile="vocabularies/csv/sensoryspecification.csv"
  showTitle={false}
  showURIs={false}
/>

<!-- With title override -->
<VocabularyTable 
  csvFile="vocabularies/csv/sensoryspecification.csv"
  title={{
    en: "Sensory Specification",
    fr: "Spécification sensorielle"
  }}
  showTitle={true}
/>
```

When using `csvFile`, the component will:
- Automatically fetch and parse the CSV file
- Use the CSV data as the source of truth for RDF
- Auto-generate a `vocabularyId` from the filename
- Show loading and error states during CSV processing
- Detect available languages from the CSV content

## Locale-Aware Language Selection

The component automatically detects the current Docusaurus locale and uses it as the default language:

```mdx
<!-- On English pages (/en/...) -->
<VocabularyTable csvFile="terms.csv" />
<!-- ^ Will default to English interface -->

<!-- On French pages (/FR/...) -->
<VocabularyTable csvFile="terms.csv" />
<!-- ^ Will default to French interface if available, otherwise English -->
```

You can override this behavior:

```mdx
<VocabularyTable 
  csvFile="terms.csv"
  defaultLanguage="es"  // Force Spanish as default
/>
```

## Usage

The component supports multilingual content through several data formats and provides global defaults from docusaurus.config.ts:

### Global Defaults

The component uses defaults from `customFields.vocabularyDefaults` in docusaurus.config.ts:

```typescript
// docusaurus.config.ts
const config = {
  // ...other config
  customFields: {
    vocabularyDefaults: {
      prefix: "isbdm",
      startCounter: 1000,
      uriStyle: "numeric",
      caseStyle: "kebab-case",
      showFilter: true,
      filterPlaceholder: "Filter vocabulary terms...",
      showTitle: false,
      showLanguageSelector: true,
      defaultLanguage: "en",
      availableLanguages: ["en", "fr", "es", "de"],
      RDF: {
        "rdf:type": ["skos:ConceptScheme"]
      }
    }
  }
};
```

### Basic Multilingual Usage

```mdx
---
vocabularyId: "1275"
title: 
  en: ISBDM Extent of Unitary Structure value vocabulary
  fr: Vocabulaire des valeurs d'étendue de structure unitaire ISBDM
  es: Vocabulario de valores de extensión de estructura unitaria ISBDM
description:
  en: This value vocabulary is a source of values for a has extent of unitary structure element.
  fr: Ce vocabulaire de valeurs est une source de valeurs pour un élément d'étendue de structure unitaire.
  es: Este vocabulario de valores es una fuente de valores para un elemento de extensión de estructura unitaria.
concepts:
  - value:
      en: "activity card"
      fr: "carte d'activité"
      es: "tarjeta de actividad"
    definition:
      en: "A unit of extent of unitary structure that is a card to be used as a basis for performing a specific activity."
      fr: "Une unité d'étendue de structure unitaire qui est une carte à utiliser comme base pour effectuer une activité spécifique."
      es: "Una unidad de extensión de estructura unitaria que es una tarjeta que se utilizará como base para realizar una actividad específica."
    scopeNote:
      en: "An activity card may be part of a set of cards, and usually embodies a text or a still image."
      fr: "Une carte d'activité peut faire partie d'un ensemble de cartes et incarne généralement un texte ou une image fixe."
      es: "Una tarjeta de actividad puede ser parte de un conjunto de tarjetas y generalmente incorpora un texto o una imagen fija."
    altLabel:
      fr: "fiche d'activité"
      es: "ficha de actividad"
---

# {frontMatter.title.en}

<VocabularyTable {...frontMatter} />
```

### CSV Data Import

```mdx
---
vocabularyId: "sensory-spec"
title: "Sensory Specification Vocabulary"
description: "Content perceived through various senses"
csvData: []  # Will be populated from CSV file
preferCsvData: true
csvUrl: "./data/sensory-specification.csv"  # Optional: URL to fetch CSV
---

import VocabularyTable from '@site/src/components/global/VocabularyTable';
import csvData from './data/sensory-specification.csv';

# Sensory Specification Vocabulary

<VocabularyTable 
  {...frontMatter}
  csvData={csvData}
  preferCsvData={true}
/>
```

### CSV Format

The component supports CSV files with the following structure:

```csv
uri,rdf:type,skos:prefLabel@en,skos:prefLabel@fr,skos:prefLabel@es,skos:definition@en[0],skos:definition@fr[0],skos:definition@es[0],skos:altLabel@fr[0],skos:altLabel@es[0]
sensoryspec:T1001,http://www.w3.org/2004/02/skos/core#Concept,aural,auditif,auditiva,"Content that is intended to be perceived through hearing.","Contenu prévu pour être perçu par le sens de l'ouïe.","Contenido para que se perciba a través de la audición.",auditive,auditivo
sensoryspec:T1002,http://www.w3.org/2004/02/skos/core#Concept,visual,visuel,visual,"Content that is intended to be perceived through sight.","Contenu prévu pour être perçu par la vue.","Contenido destinado a ser percibido a través de la vista.",,
```

**CSV Column Format:**
- `skos:property@language[index]` for multilingual properties
- Index `[0]` for primary values, `[1]`, `[2]` etc. for additional values
- Supported properties: `prefLabel`, `definition`, `scopeNote`, `altLabel`, `notation`, `example`, `changeNote`, `historyNote`, `editorialNote`

## Props

The component accepts the entire front matter structure with multilingual extensions:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `vocabularyId` | string | No* | Unique identifier for the vocabulary (auto-generated from csvFile if not provided) |
| `title` | string \| MultilingualText | No | The title of the vocabulary |
| `prefix` | string | No | Namespace prefix for URIs (default: 'isbdm') |
| `uri` | string | No | The base URI of the vocabulary |
| `type` | string | No | The type of the vocabulary |
| `description` | string \| MultilingualText | No | The main description of the vocabulary |
| `scopeNote` | string \| MultilingualText | No | Additional notes about the vocabulary's scope |
| `isDefinedBy` | string | No | URI that defines the vocabulary |
| `RDF` | RDFMetadata | No** | RDF metadata and vocabulary values (legacy format) |
| `concepts` | ConceptProps[] | No** | Array of concepts (alternative to RDF.values) |
| `csvData` | CSVConceptRow[] | No** | CSV data as source of truth |
| `csvFile` | string | No** | Path to CSV file to load automatically |
| `csvUrl` | string | No | URL to fetch CSV data |
| `preferCsvData` | boolean | No | Whether to prefer CSV data over front matter (default: false, true when csvFile is used) |
| `startCounter` | number | No | Starting number for term IDs (default: 1000) |
| `uriStyle` | 'numeric' \| 'slug' | No | Method for generating URIs (default: 'numeric') |
| `caseStyle` | UriCaseStyle | No | Case style for slug URIs (default: 'kebab-case') |
| `showTitle` | boolean | No | Whether to display the title (default: false) |
| `showFilter` | boolean | No | Whether to display the filter input (default: true) |
| `showURIs` | boolean | No | Whether to display URIs in the table (default: true) |
| `showLanguageSelector` | boolean | No | Whether to show language selector (default: true) |
| `filterPlaceholder` | string \| MultilingualText | No | Placeholder text for filter input |
| `defaultLanguage` | string | No | Default display language (defaults to current Docusaurus locale, then 'en') |
| `availableLanguages` | string[] | No | Available languages (auto-detected if not provided) |
| `languageConfig` | LanguageConfig[] | No | Language configuration for display names |

*vocabularyId is optional when csvFile is provided - it will be auto-generated from the filename
**Either `RDF.values`, `concepts`, or `csvFile`/`csvData` must be provided.

### MultilingualText Interface

```typescript
interface MultilingualText {
  [languageCode: string]: string | string[];
}
```

### LanguageConfig Interface

```typescript
interface LanguageConfig {
  code: string;        // ISO language code (e.g., 'en', 'fr')
  name: string;        // English name (e.g., 'French')
  nativeName: string;  // Native name (e.g., 'Français')
  rtl?: boolean;       // Right-to-left script
}
```

### ConceptProps Interface (Multilingual)

```typescript
interface ConceptProps {
  value: string | MultilingualText;           // Maps to skos:prefLabel
  definition: string | MultilingualText;      // Maps to skos:definition
  scopeNote?: string | MultilingualText;      // Maps to skos:scopeNote
  notation?: string | MultilingualText;       // Maps to skos:notation
  example?: string | MultilingualText;        // Maps to skos:example
  changeNote?: string | MultilingualText;     // Maps to skos:changeNote
  historyNote?: string | MultilingualText;    // Maps to skos:historyNote
  editorialNote?: string | MultilingualText;  // Maps to skos:editorialNote
  altLabel?: string | MultilingualText;       // Maps to skos:altLabel
  uri?: string;                               // Full URI for the concept
}
```

## Language Handling

### Automatic Language Detection

The component automatically detects available languages from the vocabulary data and populates the language selector accordingly.

### Language Fallback

When content is not available in the selected language:
1. Try the requested language
2. Fall back to the default language (usually 'en')
3. Fall back to the first available language

### Language Selector

The language selector appears automatically when:
- Multiple languages are detected in the data
- `showLanguageSelector` is not explicitly set to `false`
- More than one language is available

## CSV Import/Export

### Importing CSV Data

```typescript
// Method 1: Direct CSV data
<VocabularyTable 
  vocabularyId="my-vocab"
  csvData={csvDataArray}
  preferCsvData={true}
/>

// Method 2: Using CSV as source of truth
<VocabularyTable 
  vocabularyId="my-vocab"
  concepts={frontMatterConcepts}
  csvData={csvDataArray}
  preferCsvData={true}  // CSV takes precedence
/>
```

### Exporting to CSV

```typescript
// Export current vocabulary to CSV format
const csvString = VocabularyTable.exportToCSV(frontMatterProps);

// Download as file
const blob = new Blob([csvString], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'vocabulary.csv';
a.click();
```

## Examples

### Multilingual Vocabulary with Alternative Labels

```mdx
---
vocabularyId: "content-type"
title:
  en: "Content Type Vocabulary"
  fr: "Vocabulaire des types de contenu"
  de: "Inhaltstyp-Vokabular"
description:
  en: "Types of content found in manifestations"
  fr: "Types de contenu trouvés dans les manifestations"
  de: "Arten von Inhalten in Manifestationen"
concepts:
  - value:
      en: "text"
      fr: "texte"
      de: "Text"
    definition:
      en: "Content expressed through language in textual form."
      fr: "Contenu exprimé par le langage sous forme textuelle."
      de: "Inhalt, der durch Sprache in Textform ausgedrückt wird."
    altLabel:
      en: ["written text", "textual content"]
      fr: ["texte écrit", "contenu textuel"]
      de: ["geschriebener Text", "textueller Inhalt"]
    example:
      en: "Books, articles, manuscripts"
      fr: "Livres, articles, manuscrits"
      de: "Bücher, Artikel, Handschriften"
---

# {frontMatter.title.en}

<VocabularyTable {...frontMatter} />
```

### Using CSV Data with Custom Language Configuration

```mdx
---
vocabularyId: "geographic-terms"
title: "Geographic Terms"
description: "Geographic terms for content classification"
preferCsvData: true
defaultLanguage: "en"
languageConfig:
  - code: "en"
    name: "English"
    nativeName: "English"
  - code: "ar"
    name: "Arabic"
    nativeName: "العربية"
    rtl: true
  - code: "zh"
    name: "Chinese"
    nativeName: "中文"
---

import csvData from './geographic-terms.csv';

# Geographic Classification Terms

<VocabularyTable 
  {...frontMatter}
  csvData={csvData}
/>
```

### Minimal Multilingual Example

```mdx
---
vocabularyId: "simple-vocab"
title: 
  en: "Simple Vocabulary"
  es: "Vocabulario Simple"
description:
  en: "A simple multilingual vocabulary example"
  es: "Un ejemplo de vocabulario multilingüe simple"
concepts:
  - value:
      en: "example"
      es: "ejemplo"
    definition:
      en: "A representative case"
      es: "Un caso representativo"
---

# {frontMatter.title.en}

<VocabularyTable {...frontMatter} />
```

### Vocabulary with Expandable Details

```mdx
---
vocabularyId: "detailed-vocab"
title: "Detailed Vocabulary Example"
concepts:
  - value:
      en: "monograph"
      fr: "monographie"
    definition:
      en: "A resource complete in one part"
      fr: "Une ressource complète en une partie"
    scopeNote:
      en: "Typically used for books and similar publications"
      fr: "Généralement utilisé pour les livres et publications similaires"
    notation:
      en: "MON"
      fr: "MON"
    example:
      en: "A single-volume novel, a biography"
      fr: "Un roman en un volume, une biographie"
    historyNote:
      en: "Term adopted from traditional library cataloging"
      fr: "Terme adopté du catalogage traditionnel de bibliothèque"
    editorialNote:
      en: "Consider relationship with serial publications"
      fr: "Considérer la relation avec les publications en série"
---

# Detailed Vocabulary

<VocabularyTable {...frontMatter} />
```

## Advanced Features

### TOC Generation for Multilingual Content

```mdx
import VocabularyTable from '@site/src/components/global/VocabularyTable';

# Multilingual Glossary

<VocabularyTable 
  {...frontMatter}
  showURIs={false}
  defaultLanguage="en"
/>

// Generate TOC in specific language
export const toc = VocabularyTable.generateTOC({
  ...frontMatter,
  defaultLanguage: "en"
});
```

### Custom Language Display

```mdx
<VocabularyTable 
  {...frontMatter}
  languageConfig={[
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true }
  ]}
  defaultLanguage="en"
/>
```

### Filtering Multilingual Content

The filter works across all text fields in the current language:
- Primary labels (`value`)
- Definitions
- Scope notes
- Alternative labels (`altLabel`)
- Examples and other expanded details

### RTL Language Support

The component automatically applies RTL layout when:
- A language is configured with `rtl: true`
- The user selects an RTL language
- The layout adjusts spacing, alignment, and direction

## Migration from Previous Version

### Updating Existing Vocabularies

```mdx
<!-- Before (single language) -->
---
vocabularyId: "1275"
title: "My Vocabulary"
description: "Vocabulary description"
concepts:
  - value: "term"
    definition: "Term definition"
---

<!-- After (multilingual) -->
---
vocabularyId: "1275"
title:
  en: "My Vocabulary"
  fr: "Mon Vocabulaire"
description:
  en: "Vocabulary description"
  fr: "Description du vocabulaire"
concepts:
  - value:
      en: "term"
      fr: "terme"
    definition:
      en: "Term definition"
      fr: "Définition du terme"
---
```

### Backward Compatibility

The component maintains full backward compatibility:
- Single-language strings continue to work
- Existing `RDF.values` format is supported
- Legacy configurations remain functional

## Performance Considerations

- Language switching rebuilds the filtered list but maintains component state
- Large CSV files are processed once and cached
- Filtering is performed on the current language only
- TOC generation happens during build time

## Accessibility

- Language selector is properly labeled and accessible via keyboard
- Screen readers announce language changes
- RTL languages receive proper directional markup
- Filter functionality works with assistive technologies
- Expandable details include proper ARIA attributes

**Remember to commit your changes after implementing these updates!**
