// Mock API responses for Google Sheets and external services
export const mockGoogleSheetsResponse = {
  sheets: [
    {
      properties: {
        title: "ISBDM Vocabulary",
        sheetId: 0,
        index: 0
      }
    },
    {
      properties: {
        title: "Element Definitions", 
        sheetId: 1,
        index: 1
      }
    }
  ]
};

export const mockSheetDataResponse = {
  values: [
    ["uri", "skos:prefLabel@en", "skos:prefLabel@fr", "skos:definition@en[0]"],
    ["isbdm:T1001", "manifestation", "manifestation", "A physical embodiment of an expression"],
    ["isbdm:T1002", "item", "exemplaire", "A single exemplar of a manifestation"]
  ]
};

export const mockEmptySheetResponse = {
  values: []
};

export const mockNetworkError = {
  error: {
    code: 403,
    message: "The caller does not have permission"
  }
};

// Vocabulary comparison tool mock responses
export const mockAvailableSheetsResponse = [
  {
    id: "sheet1",
    name: "ISBDM Elements",
    token: "ISBDM",
    title: "ISBDM Element Vocabulary"
  },
  {
    id: "sheet2", 
    name: "LRM Entities",
    token: "LRM",
    title: "IFLA LRM Entity Definitions"
  }
];

export const mockVocabularyData = [
  {
    token: "isbdm:T1001",
    uri: "https://iflastandards.info/ns/isbdm/T1001",
    "skos:prefLabel@en": "manifestation",
    "skos:prefLabel@fr": "manifestation",
    "skos:definition@en[0]": "A physical embodiment of an expression"
  }
];

// RDF parsing mock responses
export const mockRdfTriples = [
  {
    subject: { value: "https://iflastandards.info/ns/isbdm/T1001" },
    predicate: { value: "http://www.w3.org/2004/02/skos/core#prefLabel" },
    object: { value: "manifestation", language: "en" }
  },
  {
    subject: { value: "https://iflastandards.info/ns/isbdm/T1001" },
    predicate: { value: "http://www.w3.org/2004/02/skos/core#definition" },
    object: { value: "A physical embodiment of an expression", language: "en" }
  }
];

// Create mock fetch functions for different scenarios
export const createMockGoogleSheetsApi = () => {
  const fetchMock = vi.fn();
  
  // Mock sheet metadata endpoint
  fetchMock.mockImplementation((url: string) => {
    if (url.includes('/sheets')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGoogleSheetsResponse)
      });
    }
    
    // Mock sheet data endpoint
    if (url.includes('/values')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSheetDataResponse)
      });
    }
    
    return Promise.reject(new Error('Unknown endpoint'));
  });
  
  return fetchMock;
};

export const createMockFailedApi = (errorCode: number = 403) => {
  return vi.fn(() => 
    Promise.resolve({
      ok: false,
      status: errorCode,
      json: () => Promise.resolve(mockNetworkError)
    })
  );
};