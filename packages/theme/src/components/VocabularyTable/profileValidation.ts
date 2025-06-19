// Profile-based validation for ISBDM Value vocabularies

export interface ProfileProperty {
  propertyID: string;
  propertyLabel: string;
  mandatory: boolean;
  repeatable: boolean;
  valueDataType?: string;
  valueConstraint?: string;
  valueConstraintType?: string;
  note?: string;
}

// Profile for Concept shape from isbdm-values-profile-revised.csv
export const CONCEPT_PROFILE: ProfileProperty[] = [
  {
    propertyID: 'skos:inScheme',
    propertyLabel: 'In Scheme',
    mandatory: true,
    repeatable: false
  },
  {
    propertyID: 'rdf:type',
    propertyLabel: 'RDF Type',
    mandatory: true,
    repeatable: false,
    valueConstraint: 'skos:Concept',
    valueConstraintType: 'pattern'
  },
  {
    propertyID: 'skos:prefLabel',
    propertyLabel: 'Preferred Label',
    mandatory: true,
    repeatable: true,
    valueDataType: 'langString',
    valueConstraint: 'Unique lang tags per item',
    note: 'Preferred label of the term with language tags'
  },
  {
    propertyID: 'skos:altLabel',
    propertyLabel: 'Alternate Label',
    mandatory: false,
    repeatable: true,
    valueDataType: 'langString',
    note: 'Alternate labels for the term'
  },
  {
    propertyID: 'skos:definition',
    propertyLabel: 'Term Definition',
    mandatory: false,
    repeatable: true,
    valueDataType: 'langString',
    note: 'Definition of the term with language tags'
  },
  {
    propertyID: 'skos:scopeNote',
    propertyLabel: 'Term Scope Note',
    mandatory: false,
    repeatable: true,
    valueDataType: 'langString',
    note: 'Additional scope information for the term with language tags'
  },
  {
    propertyID: 'skos:notation',
    propertyLabel: 'Term Notation',
    mandatory: false,
    repeatable: true,
    valueDataType: 'string',
    note: 'Notation or code for the term'
  },
  {
    propertyID: 'skos:example',
    propertyLabel: 'Term Example',
    mandatory: false,
    repeatable: true,
    valueDataType: 'langString',
    note: 'Example of the term\'s usage with language tags'
  },
  {
    propertyID: 'skos:changeNote',
    propertyLabel: 'Change Note',
    mandatory: false,
    repeatable: true,
    valueDataType: 'langString',
    note: 'Note about modifications to the term with language tags'
  },
  {
    propertyID: 'skos:historyNote',
    propertyLabel: 'History Note',
    mandatory: false,
    repeatable: true,
    valueDataType: 'langString',
    note: 'Note about past state or meaning of the term with language tags'
  },
  {
    propertyID: 'skos:editorialNote',
    propertyLabel: 'Editorial Note',
    mandatory: false,
    repeatable: true,
    valueDataType: 'langString',
    note: 'Note for editors or maintainers about the term with language tags'
  },
  {
    propertyID: 'skos:topConceptOf',
    propertyLabel: 'Top Concept Of',
    mandatory: true,
    repeatable: false,
    note: 'Reference to the parent ConceptScheme'
  }
];

// Helper to check if a property is repeatable
export function isRepeatableProperty(propertyID: string): boolean {
  const prop = CONCEPT_PROFILE.find(p => p.propertyID === propertyID);
  return prop?.repeatable ?? false;
}

// Helper to check if a property is mandatory
export function isMandatoryProperty(propertyID: string): boolean {
  const prop = CONCEPT_PROFILE.find(p => p.propertyID === propertyID);
  return prop?.mandatory ?? false;
}

// Helper to extract base property name from column header (removes language tag and array index)
export function getBasePropertyName(columnHeader: string): string {
  // Remove array notation like [0], [1], etc.
  let baseName = columnHeader.replace(/\[\d+\]$/, '');
  // Remove language tag like @en, @fr, etc.
  baseName = baseName.replace(/@[a-z]{2}(-[A-Z]{2})?$/, '');
  return baseName;
}

// Helper to check if a column header represents a valid property
export function isValidPropertyColumn(columnHeader: string): boolean {
  const baseName = getBasePropertyName(columnHeader);
  return baseName === 'uri' || CONCEPT_PROFILE.some(p => p.propertyID === baseName);
}

// Helper to extract language from column header
export function getLanguageFromColumn(columnHeader: string): string | null {
  const match = columnHeader.match(/@([a-z]{2}(-[A-Z]{2})?)/);
  return match ? match[1] : null;
}

// Check if a property requires language tags
export function requiresLanguageTag(propertyID: string): boolean {
  const prop = CONCEPT_PROFILE.find(p => p.propertyID === propertyID);
  return prop?.valueDataType === 'langString';
}