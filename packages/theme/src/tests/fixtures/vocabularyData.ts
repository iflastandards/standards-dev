// Standard vocabulary test data for VocabularyTable component testing
export const mockCSVContent = `uri,rdf:type,skos:prefLabel@en,skos:prefLabel@fr,skos:prefLabel@es,skos:definition@en[0],skos:definition@fr[0],skos:definition@es[0],skos:example@en[0]
sensoryspec:T1001,http://www.w3.org/2004/02/skos/core#Concept,aural,auditif,auditiva,"Content intended for hearing","Contenu destiné à l'audition","Contenido destinado a la audición","Audiobooks, music recordings"
sensoryspec:T1002,http://www.w3.org/2004/02/skos/core#Concept,visual,visuel,visual,"Content intended for sight","Contenu destiné à la vue","Contenido destinado a la vista","Books, images, videos"
sensoryspec:T1003,http://www.w3.org/2004/02/skos/core#Concept,tactile,tactile,táctil,"Content intended for touch","Contenu destiné au toucher","Contenido destinado al tacto","Braille materials, textured objects"
sensoryspec:T1004,http://www.w3.org/2004/02/skos/core#Concept,gustatory,gustatif,gustativo,"Content intended for taste","Contenu destiné au goût","Contenido destinado al gusto","Food samples, flavor guides"
sensoryspec:T1005,http://www.w3.org/2004/02/skos/core#Concept,olfactory,olfactif,olfativo,"Content intended for smell","Contenu destiné à l'odorat","Contenido destinado al olfato","Perfume samples, scent guides"`;

export const mockEmptyCSV = `uri,skos:prefLabel@en,skos:definition@en[0]`;

export const mockMalformedCSV = `uri,skos:prefLabel@en
invalid-line-without-proper-columns
another-invalid-line`;

export const vocabularyTestData = [
  {
    uri: "sensoryspec:T1001",
    "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
    "skos:prefLabel@en": "aural",
    "skos:prefLabel@fr": "auditif",
    "skos:prefLabel@es": "auditiva",
    "skos:definition@en[0]": "Content intended for hearing",
    "skos:definition@fr[0]": "Contenu destiné à l'audition",
    "skos:definition@es[0]": "Contenido destinado a la audición",
    "skos:example@en[0]": "Audiobooks, music recordings"
  },
  {
    uri: "sensoryspec:T1002", 
    "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
    "skos:prefLabel@en": "visual",
    "skos:prefLabel@fr": "visuel",
    "skos:prefLabel@es": "visual",
    "skos:definition@en[0]": "Content intended for sight",
    "skos:definition@fr[0]": "Contenu destiné à la vue",
    "skos:definition@es[0]": "Contenido destinado a la vista",
    "skos:example@en[0]": "Books, images, videos"
  }
];

export const vocabularyTableProps = {
  basic: {
    csvFile: "/data/CSV/sensory-test.csv",
    title: "Basic Vocabulary Table",
    showTitle: true
  },
  multilingual: {
    csvFile: "/data/CSV/sensory-test.csv",
    title: "Multilingual Table",
    showTitle: true,
    defaultLanguage: "fr" as const,
    availableLanguages: ['en', 'fr', 'es'] as const
  },
  glossary: {
    csvFile: "/data/CSV/sensory-test.csv",
    title: "Glossary View",
    showTitle: true,
    showURIs: false,
    showLanguageSelector: false
  }
};

// Mock fetch function for vocabulary data
export const createMockFetch = (csvContent: string = mockCSVContent) => {
  return vi.fn(() =>
    Promise.resolve({
      ok: true,
      text: () => Promise.resolve(csvContent)
    })
  ) as any;
};

export const createFailedFetch = (errorMessage: string = 'Network error') => {
  return vi.fn(() => Promise.reject(new Error(errorMessage))) as any;
};