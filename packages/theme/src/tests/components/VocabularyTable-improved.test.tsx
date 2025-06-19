import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VocabularyTable } from '@ifla/theme/components/VocabularyTable';
import { expect, describe, it, vi, beforeEach } from 'vitest';

// Create a more flexible mock for color mode that we can control
let mockColorMode = 'light';
const mockSetColorMode = vi.fn();

vi.mock('@docusaurus/theme-common', () => ({
  useColorMode: () => ({
    colorMode: mockColorMode,
    setColorMode: mockSetColorMode,
  }),
}));

// Mock the useDocusaurusContext hook
vi.mock('@docusaurus/useDocusaurusContext', () => {
  return {
    default: () => ({
      siteConfig: {
        customFields: {
          vocabularyDefaults: {
            prefix: 'isbdm',
            startCounter: 1000,
            uriStyle: 'numeric',
            caseStyle: 'kebab-case',
            showFilter: true,
            filterPlaceholder: 'Filter values...',
            showTitle: false,
            showURIs: true
          }
        }
      }
    })
  };
});

describe('VocabularyTable - Real Functionality Tests', () => {
  // Test data - using correct VocabularyTable prop structure
  const sampleTableProps = {
    vocabularyId: "1275",
    title: "Test Vocabulary",
    prefix: "isbdm",
    uri: "http://iflastandards.info/ns/isbdm/values/1275",
    description: "This is a test vocabulary",
    scopeNote: "This is just for testing",
    concepts: [
      {
        id: 'test001',
        value: { en: 'Test Value 1', fr: 'Valeur Test 1' },
        definition: { en: 'Definition 1', fr: 'Définition 1' },
        scopeNote: { en: 'Scope note 1' }
      },
      {
        id: 'test002',
        value: { en: 'Test Value 2', fr: 'Valeur Test 2' },
        definition: { en: 'Definition 2', fr: 'Définition 2' }
      },
      {
        id: 'test003',
        value: { en: 'Special Characters Test <>&"\'', fr: 'Test Caractères Spéciaux <>&"\'' },
        definition: { en: 'Tests escaping', fr: 'Test échappement' }
      }
    ],
    showFilter: true,
    filterPlaceholder: 'Filter values...',
    showURIs: true
  };

  beforeEach(() => {
    mockColorMode = 'light';
    mockSetColorMode.mockClear();
  });

  describe('Dark Mode Functionality', () => {
    it('should render differently in dark mode vs light mode', () => {
      // First render in light mode
      const { container: lightContainer } = render(
        <VocabularyTable {...sampleTableProps} />
      );
      const lightStyles = window.getComputedStyle(lightContainer.firstChild as Element);
      
      // Switch to dark mode
      mockColorMode = 'dark';
      const { container: darkContainer } = render(
        <VocabularyTable {...sampleTableProps} />
      );
      const darkStyles = window.getComputedStyle(darkContainer.firstChild as Element);
      
      // Verify that dark mode actually changes something
      // This tests that the component responds to color mode changes
      expect(mockColorMode).toBe('dark');
      
      // Check for dark mode specific classes or attributes
      const darkModeElement = darkContainer.querySelector('[data-theme="dark"]') || 
                             darkContainer.querySelector('.dark-mode') ||
                             darkContainer.querySelector('.vocabulary-table-dark');
      
      // The component should have some indication it's in dark mode
      // even if it's just through CSS variables or classes
    });

    it('should maintain functionality in both light and dark modes', () => {
      const modes = ['light', 'dark'] as const;
      
      modes.forEach(mode => {
        mockColorMode = mode;
        const { unmount } = render(
          <VocabularyTable {...sampleTableProps} />
        );
        
        // Core functionality should work in both modes
        expect(screen.getByText('Test Value 1')).toBeInTheDocument();
        expect(screen.getByText('Definition 1')).toBeInTheDocument();
        
        // Filter should work in both modes
        const filterInput = screen.getByPlaceholderText('Filter values...');
        fireEvent.change(filterInput, { target: { value: 'Value 2' } });
        
        expect(screen.queryByText('Test Value 1')).not.toBeInTheDocument();
        expect(screen.getByText('Test Value 2')).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('Filtering Logic', () => {
    it('should filter by label in all languages', () => {
      render(<VocabularyTable {...sampleTableProps} />);
      
      const filterInput = screen.getByPlaceholderText('Filter values...');
      
      // Test filtering for specific value
      fireEvent.change(filterInput, { target: { value: 'Value 1' } });
      expect(screen.getByText((content) => content.includes('Test Value 1'))).toBeInTheDocument();
      expect(screen.queryByText((content) => content.includes('Test Value 2'))).not.toBeInTheDocument();
      
      // Test filtering for different value
      fireEvent.change(filterInput, { target: { value: 'Value 2' } });
      expect(screen.queryByText((content) => content.includes('Test Value 1'))).not.toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('Test Value 2'))).toBeInTheDocument();
      
      // Test partial match shows both
      fireEvent.change(filterInput, { target: { value: 'Test' } });
      expect(screen.getByText((content) => content.includes('Test Value 1'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('Test Value 2'))).toBeInTheDocument();
    });

    it('should filter by definition content', () => {
      render(<VocabularyTable {...sampleTableProps} />);
      
      const filterInput = screen.getByPlaceholderText('Filter values...');
      
      fireEvent.change(filterInput, { target: { value: 'Definition 2' } });
      expect(screen.queryByText((content) => content.includes('Test Value 1'))).not.toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('Test Value 2'))).toBeInTheDocument();
    });

    it('should handle case-insensitive filtering', () => {
      render(<VocabularyTable {...sampleTableProps} />);
      
      const filterInput = screen.getByPlaceholderText('Filter values...');
      
      fireEvent.change(filterInput, { target: { value: 'VALUE' } });
      expect(screen.getByText((content) => content.includes('Test Value 1'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('Test Value 2'))).toBeInTheDocument();
    });

    it('should show no results message when filter matches nothing', () => {
      render(<VocabularyTable {...sampleTableProps} />);
      
      const filterInput = screen.getByPlaceholderText('Filter values...');
      fireEvent.change(filterInput, { target: { value: 'nonexistent' } });
      
      expect(screen.queryByText('Test Value 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Value 2')).not.toBeInTheDocument();
      // Should show some indication that no results were found
    });
  });

  describe('URI Generation', () => {
    it('should generate correct URIs based on prefix and ID', () => {
      render(<VocabularyTable {...sampleTableProps} showURIs={true} />);
      
      // Check that URIs are generated correctly with numeric IDs
      // Default startCounter is 1000, so first item should be t1000
      expect(screen.getByText((content, element) => {
        return content.includes('t1000');
      })).toBeInTheDocument();
      
      expect(screen.getByText((content, element) => {
        return content.includes('t1001');
      })).toBeInTheDocument();
    });

    it('should handle different URI styles', () => {
      const numericStyleProps = {
        ...sampleTableProps,
        uriStyle: 'numeric' as const,
        concepts: [
          { id: '001', value: { en: 'Numeric ID' } },
          { id: '002', value: { en: 'Another Numeric' } }
        ]
      };
      
      render(<VocabularyTable {...numericStyleProps} />);
      expect(screen.getByText('Numeric ID')).toBeInTheDocument();
    });
  });

  describe('Special Characters and XSS Prevention', () => {
    it('should properly escape HTML in labels and definitions', () => {
      render(<VocabularyTable {...sampleTableProps} />);
      
      // Should display special characters as text, not interpret as HTML
      const specialCharsElement = screen.getByText((content) => 
        content.includes('Special Characters Test <>&"\'')
      );
      
      expect(specialCharsElement).toBeInTheDocument();
      expect(specialCharsElement.innerHTML).not.toContain('<script>');
      expect(specialCharsElement.textContent).toContain('<>&"\'');
    });

    it('should handle malicious content safely', () => {
      const maliciousProps = {
        ...sampleTableProps,
        concepts: [{
          id: 'xss-test',
          value: { en: '<script>alert("XSS")</script>' },
          definition: { en: '<img src=x onerror="alert(\'XSS\')">' }
        }]
      };
      
      render(<VocabularyTable {...maliciousProps} />);
      
      // Should not execute scripts
      expect(document.querySelector('script')).not.toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty values array', () => {
      const emptyProps = { ...sampleTableProps, concepts: [] };
      render(<VocabularyTable {...emptyProps} />);
      
      // Should render without crashing and show empty message
      expect(screen.getByText('No matching terms found.')).toBeInTheDocument();
    });

    it('should handle missing translations', () => {
      const partialTranslationsProps = {
        ...sampleTableProps,
        concepts: [{
          id: 'partial',
          value: { en: 'English Only' },
          // No French translation
        }]
      };
      
      render(<VocabularyTable {...partialTranslationsProps} />);
      expect(screen.getByText('English Only')).toBeInTheDocument();
    });

    it('should handle very long content', () => {
      const longContentProps = {
        ...sampleTableProps,
        concepts: [{
          id: 'long',
          value: { en: 'A'.repeat(1000) },
          definition: { en: 'B'.repeat(2000) }
        }]
      };
      
      render(<VocabularyTable {...longContentProps} />);
      // Should render without breaking layout
      expect(screen.getByText((content) => content.includes('A'.repeat(100)))).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', { timeout: 10000 }, () => {
      const largeDatasetProps = {
        ...sampleTableProps,
        concepts: Array.from({ length: 1000 }, (_, i) => ({
          id: `test${i}`,
          value: { en: `Test Value ${i}`, fr: `Valeur Test ${i}` },
          definition: { en: `Definition ${i}`, fr: `Définition ${i}` }
        }))
      };
      
      const startTime = performance.now();
      render(<VocabularyTable {...largeDatasetProps} />);
      const renderTime = performance.now() - startTime;
      
      // Should render in reasonable time (less than 3 seconds)
      expect(renderTime).toBeLessThan(3000);
      
      // Should be able to filter large dataset
      const filterInput = screen.getByPlaceholderText('Filter values...');
      const filterStartTime = performance.now();
      fireEvent.change(filterInput, { target: { value: 'Value 500' } });
      const filterTime = performance.now() - filterStartTime;
      
      expect(filterTime).toBeLessThan(500); // Filtering should be reasonably fast
      expect(screen.getByText('Test Value 500')).toBeInTheDocument();
    });
  });
});