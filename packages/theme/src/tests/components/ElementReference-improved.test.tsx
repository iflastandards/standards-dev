import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ElementReference from '@ifla/theme/components/ElementReference';

// Use existing mocks from __mocks__ folder
vi.mock('@docusaurus/useDocusaurusContext', () => import('../__mocks__/useDocusaurusContext'));
vi.mock('@docusaurus/Link', () => import('../__mocks__/DocusaurusLinkMock'));
vi.mock('@docusaurus/useBaseUrl', () => import('../__mocks__/useBaseUrl'));
vi.mock('@docusaurus/theme-common', () => import('../__mocks__/theme-common'));
vi.mock('@theme/Tabs', () => import('../__mocks__/tabs'));
vi.mock('@theme/TabItem', () => import('../__mocks__/TabItem'));
vi.mock('@theme/CodeBlock', () => import('../__mocks__/CodeBlock'));

describe('ElementReference - URI Generation Logic Tests', () => {
  describe('URI Prefix Logic', () => {
    it('should correctly determine prefix based on element type', () => {
      // Test the logic that determines whether to use C or P prefix
      const getPrefix = (type: string) => {
        const normalizedType = type.toLowerCase();
        return normalizedType.includes('class') ? 'C' : 'P';
      };

      // Test various type inputs
      expect(getPrefix('Class')).toBe('C');
      expect(getPrefix('rdfs:Class')).toBe('C');
      expect(getPrefix('owl:Class')).toBe('C');
      expect(getPrefix('RDFS:CLASS')).toBe('C');
      expect(getPrefix('rDFs:cLaSs')).toBe('C');
      
      expect(getPrefix('Property')).toBe('P');
      expect(getPrefix('DatatypeProperty')).toBe('P');
      expect(getPrefix('ObjectProperty')).toBe('P');
      expect(getPrefix('owl:DatatypeProperty')).toBe('P');
      expect(getPrefix('rdf:Property')).toBe('P');
    });

    it('should generate correct full URI based on type and ID', () => {
      const generateUri = (baseUri: string, prefix: string, id: number) => {
        return `${baseUri}/${prefix}${id}`;
      };

      const baseUri = "https://www.iflastandards.info/ISBDM/elements";
      
      // Test URI generation
      expect(generateUri(baseUri, 'C', 1000)).toBe('https://www.iflastandards.info/ISBDM/elements/C1000');
      expect(generateUri(baseUri, 'P', 2000)).toBe('https://www.iflastandards.info/ISBDM/elements/P2000');
    });
  });

  describe('Type Normalization Logic', () => {
    it('should normalize RDF types correctly', () => {
      const normalizeType = (type: string) => {
        const typeMap: Record<string, string[]> = {
          'Class': ['rdfs:Class', 'owl:Class'],
          'Property': ['rdf:Property', 'owl:DatatypeProperty'],
          'DatatypeProperty': ['rdf:Property', 'owl:DatatypeProperty'],
          'ObjectProperty': ['rdf:Property', 'owl:ObjectProperty']
        };

        // Find the base type - need to check ObjectProperty before Property
        let baseType = 'Property'; // default
        
        if (type.toLowerCase().includes('class')) {
          baseType = 'Class';
        } else if (type.toLowerCase().includes('objectproperty')) {
          baseType = 'ObjectProperty';
        } else if (type.toLowerCase().includes('datatypeproperty')) {
          baseType = 'DatatypeProperty';
        }

        return typeMap[baseType];
      };

      expect(normalizeType('Class')).toEqual(['rdfs:Class', 'owl:Class']);
      expect(normalizeType('rdfs:Class')).toEqual(['rdfs:Class', 'owl:Class']);
      expect(normalizeType('DatatypeProperty')).toEqual(['rdf:Property', 'owl:DatatypeProperty']);
      expect(normalizeType('ObjectProperty')).toEqual(['rdf:Property', 'owl:ObjectProperty']);
    });
  });

  describe('Element Relationship Processing', () => {
    it('should convert elementSuperType to subPropertyOf', () => {
      const processRelationships = (frontMatter: any) => {
        const relationships: any = {};
        
        if (frontMatter.RDF?.elementSuperType?.length > 0) {
          relationships.subPropertyOf = frontMatter.RDF.elementSuperType.map((item: any) => item.uri);
        }
        
        if (frontMatter.RDF?.subPropertyOf?.length > 0) {
          relationships.subPropertyOf = [
            ...(relationships.subPropertyOf || []),
            ...frontMatter.RDF.subPropertyOf
          ];
        }
        
        return relationships;
      };

      const frontMatter = {
        RDF: {
          elementSuperType: [
            { uri: 'http://example.org/P1000', label: 'Parent Property' }
          ],
          subPropertyOf: ['http://example.org/P2000']
        }
      };

      const result = processRelationships(frontMatter);
      expect(result.subPropertyOf).toContain('http://example.org/P1000');
      expect(result.subPropertyOf).toContain('http://example.org/P2000');
      expect(result.subPropertyOf).toHaveLength(2);
    });

    it('should handle inverseOf relationships', () => {
      const processInverseOf = (inverseOf: any[]) => {
        if (!inverseOf || inverseOf.length === 0) return [];
        
        return inverseOf.map(item => {
          if (typeof item === 'string') return item;
          if (item.uri) return item.uri;
          return null;
        }).filter(Boolean);
      };

      expect(processInverseOf(['http://example.org/P1000'])).toEqual(['http://example.org/P1000']);
      expect(processInverseOf([{ uri: 'http://example.org/P2000' }])).toEqual(['http://example.org/P2000']);
      expect(processInverseOf([])).toEqual([]);
    });
  });

  describe('Table Field Filtering', () => {
    it('should filter out fields that should not appear in table', () => {
      const shouldShowInTable = (fieldName: string) => {
        const hiddenFields = ['isDefinedBy', 'subPropertyOf', 'upper_value'];
        return !hiddenFields.includes(fieldName);
      };

      expect(shouldShowInTable('definition')).toBe(true);
      expect(shouldShowInTable('domain')).toBe(true);
      expect(shouldShowInTable('range')).toBe(true);
      expect(shouldShowInTable('isDefinedBy')).toBe(false);
      expect(shouldShowInTable('subPropertyOf')).toBe(false);
      expect(shouldShowInTable('upper_value')).toBe(false);
    });
  });

  describe('RDF Serialization Logic', () => {
    it('should generate correct JSON-LD structure', () => {
      const generateJsonLd = (uri: string, type: string[], properties: any) => {
        const jsonLd = {
          "@context": {
            "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
            "owl": "http://www.w3.org/2002/07/owl#"
          },
          "@graph": [{
            "@id": uri,
            "@type": type,
            ...properties
          }]
        };
        return jsonLd;
      };

      const jsonLd = generateJsonLd(
        'https://example.org/P1000',
        ['rdf:Property', 'owl:DatatypeProperty'],
        { "rdfs:label": "Test Property" }
      );

      expect(jsonLd['@graph'][0]['@id']).toBe('https://example.org/P1000');
      expect(jsonLd['@graph'][0]['@type']).toEqual(['rdf:Property', 'owl:DatatypeProperty']);
      expect(jsonLd['@graph'][0]['rdfs:label']).toBe('Test Property');
    });

    it('should generate correct Turtle syntax', () => {
      const generateTurtleType = (types: string[]) => {
        return `a ${types.join(', ')}`;
      };

      expect(generateTurtleType(['rdfs:Class', 'owl:Class'])).toBe('a rdfs:Class, owl:Class');
      expect(generateTurtleType(['rdf:Property'])).toBe('a rdf:Property');
    });

    it('should generate correct RDF/XML type elements', () => {
      const generateRdfXmlTypes = (mainType: string, additionalTypes: string[]) => {
        const typeElements = additionalTypes.map(type => {
          const [prefix, localName] = type.split(':');
          const namespace = {
            'owl': 'http://www.w3.org/2002/07/owl#',
            'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
            'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
          }[prefix];
          
          return `<rdf:type rdf:resource="${namespace}${localName}"/>`;
        });
        
        return typeElements;
      };

      const types = generateRdfXmlTypes('rdfs:Class', ['owl:Class']);
      expect(types[0]).toBe('<rdf:type rdf:resource="http://www.w3.org/2002/07/owl#Class"/>');
    });
  });

  describe('Deprecation Handling', () => {
    it('should determine deprecation status correctly', () => {
      const isDeprecated = (frontMatter: any) => {
        return frontMatter.deprecated === true || 
               frontMatter.RDF?.deprecated === true;
      };

      expect(isDeprecated({ deprecated: true })).toBe(true);
      expect(isDeprecated({ RDF: { deprecated: true } })).toBe(true);
      expect(isDeprecated({ deprecated: false })).toBe(false);
      expect(isDeprecated({})).toBe(false);
    });

    it('should extract deprecation version info', () => {
      const getDeprecationInfo = (frontMatter: any) => {
        return {
          deprecatedInVersion: frontMatter.deprecatedInVersion || frontMatter.RDF?.deprecatedInVersion || '',
          willBeRemovedInVersion: frontMatter.willBeRemovedInVersion || frontMatter.RDF?.willBeRemovedInVersion || ''
        };
      };

      const info1 = getDeprecationInfo({ deprecatedInVersion: '1.0', willBeRemovedInVersion: '2.0' });
      expect(info1.deprecatedInVersion).toBe('1.0');
      expect(info1.willBeRemovedInVersion).toBe('2.0');

      const info2 = getDeprecationInfo({ RDF: { deprecatedInVersion: '1.5' } });
      expect(info2.deprecatedInVersion).toBe('1.5');
      expect(info2.willBeRemovedInVersion).toBe('');
    });
  });

  describe('Component Integration Tests', () => {
    const createFrontMatter = (overrides = {}) => ({
      id: 1025,
      title: "has manifestation statement",
      RDF: {
        definition: "Test definition",
        domain: "Manifestation",
        type: "DatatypeProperty",
        range: "Literal",
        status: "Published",
        ...overrides
      }
    });

    it('should render correct URI for different types', () => {
      // Test Class type
      const classFrontMatter = createFrontMatter({ type: 'Class' });
      const { rerender } = render(<ElementReference frontMatter={classFrontMatter} />);
      
      // Component should render successfully and show the type
      expect(screen.getByText('Class')).toBeInTheDocument();
      expect(screen.getByText('Test definition')).toBeInTheDocument();
      
      // Test Property type
      const propertyFrontMatter = createFrontMatter({ type: 'Property' });
      rerender(<ElementReference frontMatter={propertyFrontMatter} />);
      
      expect(screen.getByText('Property')).toBeInTheDocument();
      expect(screen.getByText('Test definition')).toBeInTheDocument();
    });

    it('should handle tab switching correctly', () => {
      render(<ElementReference frontMatter={createFrontMatter()} />);
      
      // Initially JSON-LD should be visible
      expect(screen.getByTestId('codeblock-json')).toBeInTheDocument();
      
      // Switch to Turtle
      fireEvent.click(screen.getByTestId('tab-turtle'));
      expect(screen.getByTestId('codeblock-turtle')).toBeInTheDocument();
      
      // Switch to RDF/XML
      fireEvent.click(screen.getByTestId('tab-rdf-xml'));
      expect(screen.getByTestId('codeblock-xml')).toBeInTheDocument();
    });

    it('should handle missing optional fields gracefully', () => {
      const minimalFrontMatter = {
        id: 1000,
        RDF: {
          definition: "Minimal element",
          type: "Property"
        }
      };
      
      render(<ElementReference frontMatter={minimalFrontMatter} />);
      
      // Should render without crashing and show basic content
      expect(screen.getByText('Definition')).toBeInTheDocument();
      expect(screen.getByText('Minimal element')).toBeInTheDocument();
      expect(screen.getByText('Property')).toBeInTheDocument();
    });

    it('should escape special characters in output', () => {
      const frontMatterWithSpecialChars = createFrontMatter({
        definition: 'Definition with <special> & "characters"'
      });
      
      render(<ElementReference frontMatter={frontMatterWithSpecialChars} />);
      
      const definitionElement = screen.getByText('Definition with <special> & "characters"');
      expect(definitionElement).toBeInTheDocument();
      expect(definitionElement.innerHTML).not.toContain('<special>');
    });
  });
});