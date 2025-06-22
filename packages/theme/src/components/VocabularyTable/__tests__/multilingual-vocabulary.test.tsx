import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VocabularyTable } from '../index';
import { expect, describe, it, vi, beforeEach } from 'vitest';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { VocabularyDefaults } from '../types';

// Augment the Window interface for testing purposes
declare global {
  interface Window {
    __DOCUSAURUS__?: {
      siteConfig: {
        customFields?: {
          vocabularyDefaults?: VocabularyDefaults;
          [key: string]: any;
        };
      };
    };
  }
}

// Mock the useColorMode hook
vi.mock('@docusaurus/theme-common', () => ({
  useColorMode: () => ({
    colorMode: 'light',
  }),
}));

// Centralized mock for Docusaurus context
const mockSiteConfig = {
  customFields: {
    vocabularyDefaults: {
      prefix: 'isbdm',
      startCounter: 1000,
      uriStyle: 'numeric' as const,
      caseStyle: 'kebab-case' as const,
      showFilter: true,
      filterPlaceholder: 'Filter values...',
      showTitle: false,
      showURIs: true,
      defaultLanguage: 'en',
      availableLanguages: ['en', 'fr', 'es'],
      showLanguageSelector: true,
    },
  },
};

// Mock the useDocusaurusContext hook
vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({
    siteConfig: mockSiteConfig as any,
    i18n: {
      currentLocale: 'en',
      locales: ['en', 'fr', 'es'],
    },
  }),
}));

describe('Multilingual VocabularyTable', () => {
  // Mock window.__DOCUSAURUS__ for generateTOC tests
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.__DOCUSAURUS__ = {
        siteConfig: mockSiteConfig,
      };
    }
  });

  // Sample multilingual data
  const multilingualFrontMatter = {
    vocabularyId: "sensory-spec",
    title: {
      en: "Sensory Specification Vocabulary",
      fr: "Vocabulaire de spécification sensorielle",
      es: "Vocabulario de especificación sensorial"
    },
    description: {
      en: "Content intended to be perceived through various senses",
      fr: "Contenu destiné à être perçu par divers sens",
      es: "Contenido destinado a ser percibido a través de varios sentidos"
    },
    concepts: [
      {
        value: {
          en: "aural",
          fr: "auditif",
          es: "auditiva"
        },
        definition: {
          en: "Content that is intended to be perceived through hearing.",
          fr: "Contenu prévu pour être perçu par le sens de l'ouïe.",
          es: "Contenido para que se perciba a través de la audición."
        },
        scopeNote: {
          en: "Includes spoken word, music, and sound effects.",
          fr: "Comprend la parole, la musique et les effets sonores.",
          es: "Incluye palabra hablada, música y efectos de sonido."
        },
        altLabel: {
          fr: "auditive",
          es: "auditivo"
        }
      },
      {
        value: {
          en: "visual",
          fr: "visuel",
          es: "visual"
        },
        definition: {
          en: "Content that is intended to be perceived through sight.",
          fr: "Contenu prévu pour être perçu par la vue.",
          es: "Contenido destinado a ser percibido a través de la vista."
        }
      }
    ]
  };

  // CSV test data matching the uploaded format
  const csvTestData = [
    {
      uri: "sensoryspec:T1001",
      "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
      "skos:prefLabel@en": "aural",
      "skos:prefLabel@fr": "auditif",
      "skos:prefLabel@es": "auditiva",
      "skos:definition@en[0]": "Content that is intended to be perceived through hearing.",
      "skos:definition@fr[0]": "Contenu prévu pour être perçu par le sens de l'ouïe.",
      "skos:definition@es[0]": "Contenido para que se perciba a través de la audición.",
      "skos:altLabel@fr[0]": "auditive",
      "skos:altLabel@es[0]": "auditivo"
    },
    {
      uri: "sensoryspec:T1002",
      "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
      "skos:prefLabel@en": "visual",
      "skos:prefLabel@fr": "visuel",
      "skos:prefLabel@es": "visual",
      "skos:definition@en[0]": "Content that is intended to be perceived through sight.",
      "skos:definition@fr[0]": "Contenu prévu pour être perçu par la vue.",
      "skos:definition@es[0]": "Contenido destinado a ser percibido a través de la vista."
    }
  ];

  describe('Language Selection', () => {
    it('renders language selector by default', () => {
      render(<VocabularyTable {...multilingualFrontMatter} />);
      
      expect(screen.getByLabelText('Select display language')).toBeInTheDocument();
      expect(screen.getByDisplayValue('English (English)')).toBeInTheDocument();
    });

    it('hides language selector when showLanguageSelector is false', () => {
      render(<VocabularyTable {...multilingualFrontMatter} showLanguageSelector={false} />);
      
      expect(screen.queryByLabelText('Select display language')).not.toBeInTheDocument();
    });

    it('shows all available languages in selector', () => {
      render(<VocabularyTable {...multilingualFrontMatter} />);
      
      const selector = screen.getByLabelText('Select display language');
      expect(selector).toBeInTheDocument();
      
      // Check for language options
      expect(screen.getByText('English (English)')).toBeInTheDocument();
      expect(screen.getByText('Français (French)')).toBeInTheDocument();
      expect(screen.getByText('Español (Spanish)')).toBeInTheDocument();
    });

    it('changes display language when selector is changed', async () => {
      render(<VocabularyTable {...multilingualFrontMatter} />);
      
      // Initially shows English content
      expect(screen.getByText('aural')).toBeInTheDocument();
      expect(screen.getByText('Content that is intended to be perceived through hearing.')).toBeInTheDocument();
      
      // Change to French
      const selector = screen.getByLabelText('Select display language');
      fireEvent.change(selector, { target: { value: 'fr' } });
      
      await waitFor(() => {
        expect(screen.getByText('auditif')).toBeInTheDocument();
        expect(screen.getByText('Contenu prévu pour être perçu par le sens de l\'ouïe.')).toBeInTheDocument();
      });
    });

    it('displays alternative labels when available', () => {
      render(<VocabularyTable {...multilingualFrontMatter} />);
      
      // Change to French to see altLabel
      const selector = screen.getByLabelText('Select display language');
      fireEvent.change(selector, { target: { value: 'fr' } });
      
      // Should show altLabel in parentheses
      expect(screen.getByText('(auditive)')).toBeInTheDocument();
    });
  });

  describe('Multilingual Content Display', () => {
    it('displays content in default language', () => {
      render(<VocabularyTable {...multilingualFrontMatter} />);
      
      expect(screen.getByText('aural')).toBeInTheDocument();
      expect(screen.getByText('visual')).toBeInTheDocument();
      expect(screen.getByText('Content that is intended to be perceived through hearing.')).toBeInTheDocument();
    });

    it('falls back to English when requested language is not available', () => {
      const partialData = {
        ...multilingualFrontMatter,
        concepts: [
          {
            value: {
              en: "test term",
              fr: "terme test"
              // No Spanish translation
            },
            definition: {
              en: "Test definition",
              fr: "Définition de test"
              // No Spanish translation
            }
          }
        ]
      };

      render(<VocabularyTable {...partialData} defaultLanguage="es" />);
      
      // Should fall back to English when Spanish is not available
      expect(screen.getByText('test term')).toBeInTheDocument();
      expect(screen.getByText('Test definition')).toBeInTheDocument();
    });

    it('displays multilingual title and description', () => {
      render(<VocabularyTable {...multilingualFrontMatter} showTitle={true} />);
      
      expect(screen.getByText('Sensory Specification Vocabulary')).toBeInTheDocument();
      expect(screen.getByText('Content intended to be perceived through various senses')).toBeInTheDocument();
      
      // Change to French
      const selector = screen.getByLabelText('Select display language');
      fireEvent.change(selector, { target: { value: 'fr' } });
      
      expect(screen.getByText('Vocabulaire de spécification sensorielle')).toBeInTheDocument();
      expect(screen.getByText('Contenu destiné à être perçu par divers sens')).toBeInTheDocument();
    });
  });

  describe('CSV Data Support', () => {
    it('parses CSV data correctly', () => {
      const csvProps = {
        vocabularyId: "csv-test",
        title: "CSV Test Vocabulary",
        description: "Testing CSV data parsing",
        csvData: csvTestData,
        preferCsvData: true
      };

      render(<VocabularyTable {...csvProps} />);
      
      expect(screen.getByText('aural')).toBeInTheDocument();
      expect(screen.getByText('visual')).toBeInTheDocument();
      expect(screen.getByText('Content that is intended to be perceived through hearing.')).toBeInTheDocument();
    });

    it('switches languages with CSV data', async () => {
      const csvProps = {
        vocabularyId: "csv-test",
        title: "CSV Test Vocabulary",
        description: "Testing CSV data parsing",
        csvData: csvTestData,
        preferCsvData: true
      };

      render(<VocabularyTable {...csvProps} />);
      
      // Initially English
      expect(screen.getByText('aural')).toBeInTheDocument();
      
      // Change to French
      const selector = screen.getByLabelText('Select display language');
      fireEvent.change(selector, { target: { value: 'fr' } });
      
      await waitFor(() => {
        expect(screen.getByText('auditif')).toBeInTheDocument();
        expect(screen.getByText('Contenu prévu pour être perçu par la vue.')).toBeInTheDocument();
      });
    });

    it('uses CSV URIs when available', () => {
      const csvProps = {
        vocabularyId: "csv-test",
        title: "CSV Test Vocabulary",
        description: "Testing CSV data parsing",
        csvData: csvTestData,
        preferCsvData: true
      };

      render(<VocabularyTable {...csvProps} />);
      
      expect(screen.getByText('(sensoryspec:T1001)')).toBeInTheDocument();
      expect(screen.getByText('(sensoryspec:T1002)')).toBeInTheDocument();
    });
  });

  describe('Filtering with Multilingual Content', () => {
    it('filters content in current language', async () => {
      render(<VocabularyTable {...multilingualFrontMatter} />);
      
      const filterInput = screen.getByPlaceholderText('Filter values...');
      
      // Filter for "visual" in English
      fireEvent.change(filterInput, { target: { value: 'visual' } });
      
      expect(screen.getByText('visual')).toBeInTheDocument();
      expect(screen.queryByText('aural')).not.toBeInTheDocument();
      
      // Change to French and filter
      const selector = screen.getByLabelText('Select display language');
      fireEvent.change(selector, { target: { value: 'fr' } });
      
      await waitFor(() => {
        // Clear and search for French term
        fireEvent.change(filterInput, { target: { value: '' } });
        fireEvent.change(filterInput, { target: { value: 'auditif' } });
        
        expect(screen.getByText('auditif')).toBeInTheDocument();
        expect(screen.queryByText('visuel')).not.toBeInTheDocument();
      });
    });

    it('filters by alternative labels', () => {
      render(<VocabularyTable {...multilingualFrontMatter} />);
      
      // Change to French to access altLabels
      const selector = screen.getByLabelText('Select display language');
      fireEvent.change(selector, { target: { value: 'fr' } });
      
      const filterInput = screen.getByPlaceholderText('Filter values...');
      fireEvent.change(filterInput, { target: { value: 'auditive' } });
      
      // Should find the term by its alternative label
      expect(screen.getByText('auditif')).toBeInTheDocument();
      expect(screen.getByText('(auditive)')).toBeInTheDocument();
    });
  });

  describe('TOC Generation with Multilingual Data', () => {
    it('generates TOC in default language', () => {
      const toc = VocabularyTable.generateTOC(multilingualFrontMatter);
      
      expect(toc).toHaveLength(2);
      expect(toc[0].value).toBe('aural');
      expect(toc[1].value).toBe('visual');
      expect(toc[0].id).toBe('t1000');
      expect(toc[1].id).toBe('t1001');
    });

    it('generates TOC with specified language', () => {
      const frenchToc = VocabularyTable.generateTOC({
        ...multilingualFrontMatter,
        defaultLanguage: 'fr'
      });
      
      expect(frenchToc).toHaveLength(2);
      expect(frenchToc[0].value).toBe('auditif');
      expect(frenchToc[1].value).toBe('visuel');
    });

    it('generates TOC from CSV data', () => {
      const csvProps = {
        vocabularyId: "csv-test",
        title: "CSV Test",
        description: "Test",
        csvData: csvTestData,
        preferCsvData: true
      };

      const toc = VocabularyTable.generateTOC(csvProps);
      
      expect(toc).toHaveLength(2);
      expect(toc[0].value).toBe('aural');
      expect(toc[1].value).toBe('visual');
    });
  });

  describe('CSV Export Functionality', () => {
    it('exports multilingual data to CSV format', () => {
      const csv = VocabularyTable.exportToCSV(multilingualFrontMatter);
      
      expect(csv).toContain('"uri","rdf:type"');
      expect(csv).toContain('"skos:prefLabel@en","skos:prefLabel@es","skos:prefLabel@fr"');
      expect(csv).toContain('"skos:definition@en","skos:definition@es","skos:definition@fr"');
      // The values are in the CSV, just in different columns based on language
      expect(csv).toContain('"Content that is intended to be perceived through hearing."');
    });

    it('handles empty concepts array gracefully', () => {
      const emptyProps = {
        vocabularyId: "empty",
        title: "Empty Vocabulary",
        description: "No concepts",
        concepts: []
      };

      const csv = VocabularyTable.exportToCSV(emptyProps);
      expect(csv).toBe('');
    });
  });

  describe('Locale-Aware Language Selection', () => {
    it.skip('uses current Docusaurus locale as default language', () => {
      // Mock French locale
      const mockContextWithFrench = {
        siteConfig: mockSiteConfig as any,
        i18n: {
          currentLocale: 'fr',
          locales: ['en', 'fr', 'es']
        }
      };
      
      // Temporarily mock for this test  
      const original = vi.mocked(useDocusaurusContext);
      vi.mocked(useDocusaurusContext).mockImplementationOnce(() => ({
        ...mockContextWithFrench,
        siteMetadata: {},
        globalData: {},
        codeTranslations: {},
      } as any));
      
      render(<VocabularyTable {...multilingualFrontMatter} />);
      
      // Should display French content by default due to currentLocale
      expect(screen.getByText('auditif')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Français (French)')).toBeInTheDocument();
    });

    it.skip('falls back to English when current locale is not available in data', () => {
      // Mock German locale (not available in test data)
      const mockContextWithGerman = {
        siteConfig: mockSiteConfig as any,
        i18n: {
          currentLocale: 'de',
          locales: ['en', 'fr', 'es', 'de']
        }
      };
      
      vi.mocked(useDocusaurusContext).mockImplementationOnce(() => ({
        ...mockContextWithGerman,
        siteMetadata: {},
        globalData: {},
        codeTranslations: {},
      } as any));
      
      render(<VocabularyTable {...multilingualFrontMatter} />);
      
      // Should fall back to English since German is not available in data
      expect(screen.getByText('aural')).toBeInTheDocument();
      expect(screen.getByDisplayValue('English (English)')).toBeInTheDocument();
    });
  });

  describe('CSV File Loading', () => {
    // Mock fetch for CSV file loading tests
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('loads CSV file automatically when csvFile prop is provided', async () => {
      const csvContent = `uri,rdf:type,skos:prefLabel@en,skos:definition@en[0]
sensoryspec:T1001,http://www.w3.org/2004/02/skos/core#Concept,aural,"Content perceived through hearing"
sensoryspec:T1002,http://www.w3.org/2004/02/skos/core#Concept,visual,"Content perceived through sight"`;

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(csvContent),
      } as Response);

      render(<VocabularyTable csvFile="test.csv" />);

      // Should show loading state initially
      expect(screen.getByText('Loading vocabulary data...')).toBeInTheDocument();

      // Wait for CSV to load
      await waitFor(() => {
        expect(screen.getByText('aural')).toBeInTheDocument();
        expect(screen.getByText('visual')).toBeInTheDocument();
      });

      expect(fetch).toHaveBeenCalledWith('/test.csv');
    });

    it('shows error state when CSV file fails to load', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      render(<VocabularyTable csvFile="nonexistent.csv" />);

      await waitFor(() => {
        expect(screen.getByText(/Error loading vocabulary/)).toBeInTheDocument();
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });
    });

    it('auto-generates vocabularyId from CSV filename', async () => {
      const csvContent = `uri,rdf:type,skos:prefLabel@en,skos:definition@en[0]
test:T1001,http://www.w3.org/2004/02/skos/core#Concept,term1,"Definition 1"`;

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(csvContent),
      } as Response);

      const { container } = render(<VocabularyTable csvFile="vocabularies/csv/sensoryspecification.csv" />);

      await waitFor(() => {
        expect(screen.getByText('term1')).toBeInTheDocument();
      });

      // Check that vocabulary container has the auto-generated ID
      expect(container.querySelector('#vocabulary-sensoryspecification')).toBeInTheDocument();
    });
  });

  describe('Simplified CSV Usage', () => {
    it('works with minimal props when using csvFile', async () => {
      const csvContent = `uri,rdf:type,skos:prefLabel@en,skos:definition@en[0]
test:T1001,http://www.w3.org/2004/02/skos/core#Concept,simple,"Simple definition"`;

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(csvContent),
      } as Response);

      // This should work with just the csvFile prop
      render(<VocabularyTable csvFile="simple.csv" />);

      await waitFor(() => {
        expect(screen.getByText('simple')).toBeInTheDocument();
        expect(screen.getByText('Simple definition')).toBeInTheDocument();
      });
    });
  });

  describe('Data Source Priority', () => {
    it('prefers CSV data when preferCsvData is true', () => {
      const mixedProps = {
        vocabularyId: "mixed-test",
        title: "Mixed Data Test",
        description: "Testing data source priority",
        concepts: [
          {
            value: "concept term",
            definition: "From concepts array"
          }
        ],
        csvData: csvTestData,
        preferCsvData: true
      };

      render(<VocabularyTable {...mixedProps} />);
      
      // Should show CSV data, not concepts data
      expect(screen.getByText('aural')).toBeInTheDocument();
      expect(screen.queryByText('concept term')).not.toBeInTheDocument();
    });

    it('uses concepts data when preferCsvData is false', () => {
      const mixedProps = {
        vocabularyId: "mixed-test",
        title: "Mixed Data Test",
        description: "Testing data source priority",
        concepts: [
          {
            value: "concept term",
            definition: "From concepts array"
          }
        ],
        csvData: csvTestData,
        preferCsvData: false
      };

      render(<VocabularyTable {...mixedProps} />);
      
      // Should show concepts data, not CSV data
      expect(screen.getByText('concept term')).toBeInTheDocument();
      expect(screen.queryByText('aural')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles malformed multilingual data gracefully', () => {
      const malformedData = {
        vocabularyId: "malformed",
        title: "Malformed Test",
        description: "Testing error handling",
        concepts: [
          {
            value: "" as any, // Invalid value
            definition: {
              en: "Valid definition"
            }
          },
          {
            value: {
              en: "Valid term"
            },
            definition: "" as any // Invalid definition
          }
        ]
      };

      render(<VocabularyTable {...malformedData} />);
      
      // Component should render without crashing
      expect(screen.getByText('Testing error handling')).toBeInTheDocument();
    });

    it('handles language switching when expanded details are open', async () => {
      const dataWithDetails = {
        vocabularyId: "details-test",
        title: "Details Test",
        description: "Testing expanded details",
        concepts: [
          {
            value: {
              en: "detailed term",
              fr: "terme détaillé"
            },
            definition: {
              en: "A term with details",
              fr: "Un terme avec des détails"
            },
            notation: {
              en: "DT",
              fr: "TD"
            },
            example: {
              en: "Example usage",
              fr: "Exemple d'utilisation"
            }
          }
        ]
      };

      render(<VocabularyTable {...dataWithDetails} />);
      
      // Expand details
      const expandButton = screen.getByLabelText('Expand details');
      fireEvent.click(expandButton);
      
      expect(screen.getByText('Notation:')).toBeInTheDocument();
      expect(screen.getByText('DT')).toBeInTheDocument();
      
      // Change language
      const selector = screen.getByLabelText('Select display language');
      fireEvent.change(selector, { target: { value: 'fr' } });
      
      await waitFor(() => {
        expect(screen.getByText('terme détaillé')).toBeInTheDocument();
        // Details should be collapsed after language change
        expect(screen.queryByText('Notation:')).not.toBeInTheDocument();
      });
    });
  });
});