import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VocabularyTable } from '@ifla/theme';

// Mock fetch for CSV data - using actual sensory-test.csv structure
const mockCSVContent = `uri,rdf:type,skos:prefLabel@en,skos:prefLabel@fr,skos:prefLabel@es,skos:definition@en[0],skos:definition@fr[0],skos:definition@es[0],skos:altLabel@fr[0],skos:altLabel@es[0],skos:notation@en[0],skos:notation@fr[0],skos:notation@es[0],skos:example@en[0],skos:example@fr[0],skos:example@es[0]
sensoryspec:T1001,http://www.w3.org/2004/02/skos/core#Concept,aural,auditif,auditiva,"Content that is intended to be perceived through hearing.","Contenu prévu pour être perçu par le sens de l'ouïe.","Contenido para que se perciba a través de la audición.",auditive,auditivo,AUR,AUR,AUR,"Audiobooks, music recordings, sound effects","Livres audio, enregistrements musicaux, effets sonores","Audiolibros, grabaciones musicales, efectos de sonido"
sensoryspec:T1002,http://www.w3.org/2004/02/skos/core#Concept,gustatory,gustatif,gustativa,"Content that is intended to be perceived through taste.","Contenu prévu pour être perçu par le sens du goût.","Contenido para que se perciba a través del gusto.",gustative,gustativo,GUS,GUS,GUS,"Wine tasting notes, flavor descriptions in cookbooks","Notes de dégustation de vin, descriptions de saveurs dans les livres de cuisine","Notas de cata de vino, descripciones de sabores en libros de cocina"
sensoryspec:T1003,http://www.w3.org/2004/02/skos/core#Concept,tactile,tactile,táctil,"Content that is intended to be perceived through touch.","Contenu prévu pour être perçu par le sens du toucher.","Contenido para que se perciba a través del tacto.",,,,,,,"Braille books, textured artworks, tactile maps","Livres en braille, œuvres d'art texturées, cartes tactiles","Libros en braille, obras de arte texturizadas, mapas táctiles"`;

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve(mockCSVContent)
  })
) as any;

describe('Sensory Test Vocabulary Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic VocabularyTable', () => {
    it('should render the basic vocabulary table with all items', async () => {
      render(
        <VocabularyTable 
          csvFile="/data/CSV/sensory-test.csv"
          title="Basic Vocabulary Table"
          showTitle={true}
        />
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Basic Vocabulary Table')).toBeInTheDocument();
      });

      // Wait for CSV data to load and check that vocabulary items are rendered
      await waitFor(() => {
        expect(screen.getByText('aural')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      expect(screen.getByText('gustatory')).toBeInTheDocument();
      expect(screen.getByText('tactile')).toBeInTheDocument();
    });

    it('should display definitions for each vocabulary item', async () => {
      render(
        <VocabularyTable 
          csvFile="/data/CSV/sensory-test.csv"
          title="Basic Vocabulary Table"
          showTitle={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Content that is intended to be perceived through hearing/)).toBeInTheDocument();
        expect(screen.getByText(/Content that is intended to be perceived through taste/)).toBeInTheDocument();
      });
    });

    it('should filter vocabulary items based on search input', async () => {
      render(
        <VocabularyTable 
          csvFile="/data/CSV/sensory-test.csv"
          title="Basic Vocabulary Table"
          showTitle={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('aural')).toBeInTheDocument();
      });

      // Find and use the search input
      const searchInput = screen.getByPlaceholderText(/Filter values/i);
      fireEvent.change(searchInput, { target: { value: 'aural' } });

      // Check that only matching items are visible
      await waitFor(() => {
        expect(screen.getByText('aural')).toBeInTheDocument();
        expect(screen.queryByText('gustatory')).not.toBeInTheDocument();
        expect(screen.queryByText('tactile')).not.toBeInTheDocument();
      });
    });
  });

  describe('Custom Configuration VocabularyTable', () => {
    it('should render with custom display options', async () => {
      render(
        <VocabularyTable 
          csvFile="/data/CSV/sensory-test.csv"
          title="Custom Configuration"
          showTitle={true}
          showURIs={false}
          defaultLanguage="fr"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Custom Configuration')).toBeInTheDocument();
      });

      // Check that French labels are displayed
      expect(screen.getByText('auditif')).toBeInTheDocument();
      expect(screen.getByText('gustatif')).toBeInTheDocument();
      expect(screen.getByText('tactile')).toBeInTheDocument();
    });

    it('should handle different language settings', async () => {
      render(
        <VocabularyTable 
          csvFile="/data/CSV/sensory-test.csv"
          title="Spanish Configuration"
          showTitle={true}
          defaultLanguage="es"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Spanish Configuration')).toBeInTheDocument();
      });

      // Check that Spanish labels are displayed
      expect(screen.getByText('auditiva')).toBeInTheDocument();
      expect(screen.getByText('gustativa')).toBeInTheDocument();
      expect(screen.getByText('táctil')).toBeInTheDocument();
    });
  });

  describe('Glossary Style VocabularyTable', () => {
    it('should render with simplified glossary settings', async () => {
      render(
        <VocabularyTable 
          csvFile="/data/CSV/sensory-test.csv"
          title="Glossary Style View"
          showTitle={true}
          showURIs={false}
          showLanguageSelector={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Glossary Style View')).toBeInTheDocument();
      });

      // Check that items are displayed
      expect(screen.getByText('aural')).toBeInTheDocument();
      expect(screen.getByText('gustatory')).toBeInTheDocument();
      expect(screen.getByText('tactile')).toBeInTheDocument();
    });

    it('should load and display vocabulary data from CSV', async () => {
      render(
        <VocabularyTable 
          csvFile="/data/CSV/sensory-test.csv"
          title="CSV Data Test"
          showTitle={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('CSV Data Test')).toBeInTheDocument();
      });

      // Check that definitions are shown
      expect(screen.getByText(/Content that is intended to be perceived through hearing/)).toBeInTheDocument();
      expect(screen.getByText(/Content that is intended to be perceived through taste/)).toBeInTheDocument();
    });
  });

  describe('Multilingual Support', () => {
    it('should display content in different languages', async () => {
      render(
        <VocabularyTable 
          csvFile="/data/CSV/sensory-test.csv"
          title="Multilingual Table"
          showTitle={true}
          availableLanguages={['en', 'fr', 'es']}
          defaultLanguage="en"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Multilingual Table')).toBeInTheDocument();
      });

      // Check that English labels are displayed by default
      expect(screen.getByText('aural')).toBeInTheDocument();
      expect(screen.getByText('gustatory')).toBeInTheDocument();
      expect(screen.getByText('tactile')).toBeInTheDocument();
    });

    it('should show proper search functionality', async () => {
      render(
        <VocabularyTable 
          csvFile="/data/CSV/sensory-test.csv"
          title="Search Test Table"
          showTitle={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Search Test Table')).toBeInTheDocument();
      });

      // Find and use the search input
      const searchInput = screen.getByPlaceholderText(/Filter values/i);
      expect(searchInput).toBeInTheDocument();
      
      // Test search functionality
      fireEvent.change(searchInput, { target: { value: 'taste' } });
      
      // Should filter to show only gustatory items that contain "taste" in definition
      await waitFor(() => {
        expect(screen.getByText('gustatory')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      render(
        <VocabularyTable 
          csvFile="/data/CSV/sensory-test.csv"
          title="Accessible Table"
          showTitle={true}
        />
      );

      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: 'Accessible Table' });
        expect(heading).toBeInTheDocument();
      });
    });

    it('should have proper ARIA labels for interactive elements', async () => {
      render(
        <VocabularyTable 
          csvFile="/data/CSV/sensory-test.csv"
          title="Accessible Table"
          showTitle={true}
        />
      );

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/Filter values/i);
        expect(searchInput).toHaveAttribute('aria-label');
      });
    });

    it('should show no results message when appropriate', async () => {
      render(
        <VocabularyTable 
          csvFile="/data/CSV/sensory-test.csv"
          title="No Results Test"
          showTitle={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No Results Test')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Filter values/i);
      fireEvent.change(searchInput, { target: { value: 'nonexistentterm12345' } });

      // Should show no results message
      await waitFor(() => {
        expect(screen.getByText(/No matching terms found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle CSV loading errors gracefully', async () => {
      // Mock fetch to return error
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;

      render(
        <VocabularyTable 
          csvFile="/data/CSV/sensory-test.csv"
          title="Error Test Table"
          showTitle={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Error Test Table')).toBeInTheDocument();
      });

      // Should show error message when CSV fails to load
      await waitFor(() => {
        expect(screen.getByText(/Error loading vocabulary/i)).toBeInTheDocument();
      });
    });

    it('should render empty state when no data is available', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve('')
        })
      ) as any;

      render(
        <VocabularyTable 
          csvFile="/data/CSV/empty-test.csv"
          title="Empty Data Test"
          showTitle={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Empty Data Test')).toBeInTheDocument();
      });

      expect(screen.getByText(/No matching terms found/i)).toBeInTheDocument();
    });
  });
});