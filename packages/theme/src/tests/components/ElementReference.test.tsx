// src/tests/components/ElementReference.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ElementReference from '@ifla/theme/components/ElementReference';

// Mock Docusaurus hooks and components
vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({
    siteConfig: {
      customFields: {
        elementDefaults: {
          uri: "https://www.iflastandards.info/ISBDM/elements",
          prefix: "isbdm",
          classPrefix: "C", 
          propertyPrefix: "P",
        }
      }
    }
  })
}));

describe('ElementReference component', () => {
  // Base test frontmatter structure matching the template
  const createTemplatedFrontMatter = (overrides = {}) => {
    const baseFrontMatter = {
      // Docusaurus metadata
      id: 1025,
      title: "has manifestation statement",
      sidebar_position: 4,
      sidebar_level: 1,
      
      // Core element metadata in RDF
      RDF: {
        definition: "Relates a manifestation to a statement that appears in a manifestation to represent aspects of itself.",
        domain: "Manifestation",
        type: "DatatypeProperty",
        scopeNote: "",
        range: "Literal",
        equivalentProperty: [],
        inverseOf: [],
        elementSubType: [
          {
            uri: "http://iflastandards.info/ns/isbdm/elements/P1029",
            url: "/docs/statements/1029",
            label: "has manifestation statement of edition"
          }
        ],
        elementSuperType: [],
        isDefinedBy: "https://www.iflastandards.info/ISBDM/elements/",
        status: "Published",
        subPropertyOf: ["https://www.iflastandards.info/ISBDM/elements/P1000"],
      },
      
      // Deprecation information at root level
      deprecated: false,
      deprecatedInVersion: "",
      willBeRemovedInVersion: "",
    };

    // Apply overrides with deep merge for RDF
    const mergedFrontMatter = {
      ...baseFrontMatter,
      ...overrides,
      RDF: {
        ...baseFrontMatter.RDF,
        ...(overrides.RDF || {}),
      }
    };

    return mergedFrontMatter;
  };

  // Test variables
  let templatedFrontMatter;

  beforeEach(() => {
    // Reset for each test
    templatedFrontMatter = createTemplatedFrontMatter();
  });

  describe('URI generation by type', () => {
    it('generates Class URI with C prefix for type:Class', () => {
      const frontMatter = createTemplatedFrontMatter({
        id: 2000,
        RDF: { 
          type: "Class"
        }
      });
      
      render(<ElementReference frontMatter={frontMatter} />);
      
      expect(screen.getByText('URI')).toBeInTheDocument();
      expect(screen.getByText('https://www.iflastandards.info/ISBDM/elements/C2000')).toBeInTheDocument();
      
      // Click on the JSON-LD tab to specifically test the content there
      const jsonLdTab = screen.getByTestId('tab-json-ld');
      jsonLdTab.click();
      
      const jsonLdContent = screen.getByTestId('codeblock-json');
      expect(jsonLdContent.textContent).toContain('"rdfs:Class"');
      expect(jsonLdContent.textContent).toContain('"owl:Class"');
    });

    it('generates Class URI with C prefix for type with mixed case "class"', () => {
      const frontMatter = createTemplatedFrontMatter({
        id: 2001,
        RDF: { 
          type: "rDFs:cLaSs"
        }
      });
      
      render(<ElementReference frontMatter={frontMatter} />);
      
      expect(screen.getByText('URI')).toBeInTheDocument();
      expect(screen.getByText('https://www.iflastandards.info/ISBDM/elements/C2001')).toBeInTheDocument();
      
      // Click on the JSON-LD tab to specifically test the content there
      const jsonLdTab = screen.getByTestId('tab-json-ld');
      jsonLdTab.click();
      
      const jsonLdContent = screen.getByTestId('codeblock-json');
      expect(jsonLdContent.textContent).toContain('"rdfs:Class"');
      expect(jsonLdContent.textContent).toContain('"owl:Class"');
    });

    it('generates Property URI with P prefix for type:DatatypeProperty', () => {
      const frontMatter = createTemplatedFrontMatter({
        id: 3000,
        RDF: { 
          type: "DatatypeProperty"
        }
      });
      
      render(<ElementReference frontMatter={frontMatter} />);
      
      expect(screen.getByText('URI')).toBeInTheDocument();
      expect(screen.getByText('https://www.iflastandards.info/ISBDM/elements/P3000')).toBeInTheDocument();
      
      // Click on the JSON-LD tab to specifically test the content there
      const jsonLdTab = screen.getByTestId('tab-json-ld');
      jsonLdTab.click();
      
      const jsonLdContent = screen.getByTestId('codeblock-json');
      expect(jsonLdContent.textContent).toContain('"owl:DatatypeProperty"');
    });

    it('generates Property URI with P prefix for type:ObjectProperty', () => {
      const frontMatter = createTemplatedFrontMatter({
        id: 3001,
        RDF: { 
          type: "ObjectProperty"
        }
      });
      
      render(<ElementReference frontMatter={frontMatter} />);
      
      expect(screen.getByText('URI')).toBeInTheDocument();
      expect(screen.getByText('https://www.iflastandards.info/ISBDM/elements/P3001')).toBeInTheDocument();
      
      // Click on the JSON-LD tab to specifically test the content there
      const jsonLdTab = screen.getByTestId('tab-json-ld');
      jsonLdTab.click();
      
      const jsonLdContent = screen.getByTestId('codeblock-json');
      expect(jsonLdContent.textContent).toContain('"owl:ObjectProperty"');
    });

    it('generates Property URI with P prefix for type:Property', () => {
      const frontMatter = createTemplatedFrontMatter({
        id: 3002,
        RDF: { 
          type: "Property"
        }
      });
      
      render(<ElementReference frontMatter={frontMatter} />);
      
      expect(screen.getByText('URI')).toBeInTheDocument();
      expect(screen.getByText('https://www.iflastandards.info/ISBDM/elements/P3002')).toBeInTheDocument();
      
      // Click on the JSON-LD tab to specifically test the content there
      const jsonLdTab = screen.getByTestId('tab-json-ld');
      jsonLdTab.click();
      
      const jsonLdContent = screen.getByTestId('codeblock-json');
      expect(jsonLdContent.textContent).toContain('"owl:DatatypeProperty"');
    });

    it('uses config values from docusaurus.config.ts for URI generation', () => {
      const frontMatter = createTemplatedFrontMatter({
        id: 4000,
        RDF: {}
      });
      
      render(<ElementReference frontMatter={frontMatter} />);
      
      // Should use the element defaults from the mocked config
      expect(screen.getByText('URI')).toBeInTheDocument();
      expect(screen.getByText('https://www.iflastandards.info/ISBDM/elements/P4000')).toBeInTheDocument();
    });
  });

  describe('RDF serialization formats by type', () => {
    it('generates proper JSON-LD for Class types', () => {
      const frontMatter = createTemplatedFrontMatter({
        id: 5000,
        RDF: { 
          type: "Class",
          definition: "Test Class"
        }
      });
      
      render(<ElementReference frontMatter={frontMatter} />);
      
      // Click on the JSON-LD tab to specifically test the content there
      const jsonLdTab = screen.getByTestId('tab-json-ld');
      jsonLdTab.click();
      
      const jsonLdContent = screen.getByTestId('codeblock-json');
      expect(jsonLdContent.textContent).toContain('"@type"');
      expect(jsonLdContent.textContent).toContain('"rdfs:Class"');
      expect(jsonLdContent.textContent).toContain('"owl:Class"');
    });

    it('generates proper JSON-LD for ObjectProperty types', () => {
      const frontMatter = createTemplatedFrontMatter({
        id: 5001,
        RDF: { 
          type: "ObjectProperty",
          definition: "Test ObjectProperty"
        }
      });
      
      render(<ElementReference frontMatter={frontMatter} />);
      
      // Click on the JSON-LD tab to specifically test the content there
      const jsonLdTab = screen.getByTestId('tab-json-ld');
      jsonLdTab.click();
      
      const jsonLdContent = screen.getByTestId('codeblock-json');
      expect(jsonLdContent.textContent).toContain('"@type"');
      expect(jsonLdContent.textContent).toContain('"rdf:Property"');
      expect(jsonLdContent.textContent).toContain('"owl:ObjectProperty"');
    });

    it('generates proper Turtle for Class types', () => {
      const frontMatter = createTemplatedFrontMatter({
        id: 6000,
        RDF: { 
          type: "Class",
          definition: "Test Class"
        }
      });
      
      render(<ElementReference frontMatter={frontMatter} />);
      
      // Click on the Turtle tab to specifically test the content there
      const turtleTab = screen.getByTestId('tab-turtle');
      turtleTab.click();
      
      const turtleContent = screen.getByTestId('codeblock-turtle');
      expect(turtleContent.textContent).toContain('a rdfs:Class, owl:Class');
    });

    it('generates proper RDF/XML for Class types', () => {
      const frontMatter = createTemplatedFrontMatter({
        id: 7000,
        RDF: { 
          type: "Class",
          definition: "Test Class"
        }
      });
      
      render(<ElementReference frontMatter={frontMatter} />);
      
      // Click on the RDF/XML tab to specifically test the content there
      const rdfXmlTab = screen.getByTestId('tab-rdf-xml');
      rdfXmlTab.click();
      
      const rdfXmlContent = screen.getByTestId('codeblock-xml');
      expect(rdfXmlContent.textContent).toContain('<rdfs:Class rdf:about=');
      expect(rdfXmlContent.textContent).toContain('<rdf:type rdf:resource="http://www.w3.org/2002/07/owl#Class"/>');
    });
  });

  describe('Properties table and RDF rendering tests', () => {
    it('does not render isDefinedBy in the table but includes it in RDF', () => {
      const frontMatter = createTemplatedFrontMatter({
        RDF: {
          isDefinedBy: "https://www.iflastandards.info/ISBDM/elements/custom/"
        }
      });
      
      render(<ElementReference frontMatter={frontMatter} />);
      
      // Should NOT be in the table
      expect(screen.queryByText('Is Defined By')).not.toBeInTheDocument();
      
      // Click on the JSON-LD tab to verify JSON-LD output
      const jsonLdTab = screen.getByTestId('tab-json-ld');
      jsonLdTab.click();
      
      const jsonLdContent = screen.getByTestId('codeblock-json');
      expect(jsonLdContent.textContent).toContain('"isDefinedBy"');
      
      // Click on the Turtle tab to verify Turtle output
      const turtleTab = screen.getByTestId('tab-turtle');
      turtleTab.click();
      
      const turtleContent = screen.getByTestId('codeblock-turtle');
      expect(turtleContent.textContent).toContain('rdfs:isDefinedBy');
    });

    it('does not render subPropertyOf in the table but includes it in RDF', () => {
      const frontMatter = createTemplatedFrontMatter({
        RDF: {
          subPropertyOf: ["https://www.iflastandards.info/ISBDM/elements/P999"]
        }
      });
      
      render(<ElementReference frontMatter={frontMatter} />);
      
      // Should NOT be in the table
      expect(screen.queryByText('Sub-Property Of')).not.toBeInTheDocument();
      
      // Click on the JSON-LD tab to verify JSON-LD output
      const jsonLdTab = screen.getByTestId('tab-json-ld');
      jsonLdTab.click();
      
      const jsonLdContent = screen.getByTestId('codeblock-json');
      expect(jsonLdContent.textContent).toContain('"subPropertyOf"');
      
      // Click on the Turtle tab to verify Turtle output
      const turtleTab = screen.getByTestId('tab-turtle');
      turtleTab.click();
      
      const turtleContent = screen.getByTestId('codeblock-turtle');
      expect(turtleContent.textContent).toContain('rdfs:subPropertyOf');
    });

    it('does not include upper_value in JSON-LD output', () => {
      const frontMatter = createTemplatedFrontMatter({
        RDF: {
          elementSuperType: [
            {
              uri: "http://iflastandards.info/ns/isbdm/elements/P1023",
              url: "/docs/attributes/1023",
              label: "has extent of manifestation"
            }
          ]
        }
      });
      
      render(<ElementReference frontMatter={frontMatter} />);
      
      // Check the JSON-LD tab
      const jsonLdTab = screen.getByTestId('tab-json-ld');
      jsonLdTab.click();
      
      // JSON-LD should not include upper_value
      const jsonLdContent = screen.getByTestId('codeblock-json');
      expect(jsonLdContent.textContent).not.toContain('upper_value');
      
      // But should have subPropertyOf 
      expect(jsonLdContent.textContent).toContain('subPropertyOf');
    });
  });

  describe('Component rendering with templated frontmatter structure', () => {
    it('renders with templated frontmatter structure correctly', () => {
      render(<ElementReference frontMatter={templatedFrontMatter} />);
      
      // Basic elements should render
      expect(screen.getByText('Definition')).toBeInTheDocument();
      expect(screen.getByText(templatedFrontMatter.RDF.definition)).toBeInTheDocument();
      expect(screen.getByText('URI')).toBeInTheDocument();
      expect(screen.getByText('Domain')).toBeInTheDocument();
      expect(screen.getByText('Manifestation')).toBeInTheDocument();
    });

    it('renders all expected fields from templated frontmatter', () => {
      render(<ElementReference frontMatter={templatedFrontMatter} />);
      
      // Check core fields
      expect(screen.getByText('Definition')).toBeInTheDocument();
      expect(screen.getByText('Domain')).toBeInTheDocument();
      expect(screen.getByText('Range')).toBeInTheDocument();
      expect(screen.getByText('URI')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      
      // These fields should NOT be present in the table view
      expect(screen.queryByText('Is Defined By')).not.toBeInTheDocument();
      expect(screen.queryByText('Sub-Property Of')).not.toBeInTheDocument();
    });
  });

  describe('Individual attribute tests with templated frontmatter', () => {
    it('renders definition correctly', () => {
      const frontMatter = createTemplatedFrontMatter({
        RDF: { definition: "Custom definition for testing" }
      });
      
      render(<ElementReference frontMatter={frontMatter} />);
      
      expect(screen.getByText('Definition')).toBeInTheDocument();
      expect(screen.getByText('Custom definition for testing')).toBeInTheDocument();
    });

    it('renders scope note correctly', () => {
      const frontMatter = createTemplatedFrontMatter({
        RDF: { scopeNote: "Test scope note" }
      });
      
      render(<ElementReference frontMatter={frontMatter} />);
      
      expect(screen.getByText('Scope note')).toBeInTheDocument();
      expect(screen.getByText('Test scope note')).toBeInTheDocument();
    });

    it('renders domain correctly', () => {
      const frontMatter = createTemplatedFrontMatter({
        RDF: { domain: "TestDomain" }
      });
      
      render(<ElementReference frontMatter={frontMatter} />);
      
      expect(screen.getByText('Domain')).toBeInTheDocument();
      expect(screen.getByText('TestDomain')).toBeInTheDocument();
    });

    it('renders range correctly', () => {
      const frontMatter = createTemplatedFrontMatter({
        RDF: { range: "TestRange" }
      });
      
      render(<ElementReference frontMatter={frontMatter} />);
      
      expect(screen.getByText('Range')).toBeInTheDocument();
      expect(screen.getByText('TestRange')).toBeInTheDocument();
    });

    it('renders type correctly', () => {
      const frontMatter = createTemplatedFrontMatter({
        RDF: { type: "ObjectProperty" }
      });
      
      render(<ElementReference frontMatter={frontMatter} />);
      
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('ObjectProperty')).toBeInTheDocument();
    });
  });

  describe('Relationship tests with templated frontmatter', () => {
    it('renders elementSubType correctly', () => {
      const frontMatter = createTemplatedFrontMatter({
        RDF: {
          elementSubType: [
            {
              uri: "http://example.org/subtype1",
              url: "/docs/test/subtype1",
              label: "Test Subtype 1"
            }
          ]
        }
      });
      
      render(<ElementReference frontMatter={frontMatter} />);
      
      expect(screen.getByText('Element sub-type')).toBeInTheDocument();
      expect(screen.getByText('Test Subtype 1')).toBeInTheDocument();
    });

    it('renders elementSuperType correctly and converts to subPropertyOf', () => {
      const frontMatter = createTemplatedFrontMatter({
        RDF: {
          elementSuperType: [
            {
              uri: "http://example.org/supertype1",
              url: "/docs/test/supertype1",
              label: "Test Supertype 1"
            }
          ]
        }
      });
      
      render(<ElementReference frontMatter={frontMatter} />);
      
      expect(screen.getByText('Element super-type')).toBeInTheDocument();
      expect(screen.getByText('Test Supertype 1')).toBeInTheDocument();
      
      // Click on the JSON-LD tab to check it appears in RDF as subPropertyOf
      const jsonLdTab = screen.getByTestId('tab-json-ld');
      jsonLdTab.click();
      
      const jsonLdContent = screen.getByTestId('codeblock-json');
      expect(jsonLdContent.textContent).toContain('"subPropertyOf"');
    });
  });

  describe('Deprecation tests with templated frontmatter', () => {
    it('renders deprecation warning when deprecated is true at root level', () => {
      const frontMatter = createTemplatedFrontMatter({ 
        deprecated: true 
      });
      
      render(<ElementReference frontMatter={frontMatter} />);
      
      expect(screen.getByText(/DEPRECATED/)).toBeInTheDocument();
    });

    it('renders deprecatedInVersion correctly from root level', () => {
      const frontMatter = createTemplatedFrontMatter({
        deprecated: true,
        deprecatedInVersion: "1.0.0"
      });
      
      render(<ElementReference frontMatter={frontMatter} />);
      
      expect(screen.getByText(/DEPRECATED/)).toBeInTheDocument();
      expect(screen.getByText(/in version 1.0.0/)).toBeInTheDocument();
      expect(screen.getByText('Deprecated In Version')).toBeInTheDocument();
      expect(screen.getByText('1.0.0')).toBeInTheDocument();
    });

    it('renders willBeRemovedInVersion correctly from root level', () => {
      const frontMatter = createTemplatedFrontMatter({
        deprecated: true,
        willBeRemovedInVersion: "2.0.0"
      });
      
      render(<ElementReference frontMatter={frontMatter} />);
      
      expect(screen.getByText(/DEPRECATED/)).toBeInTheDocument();
      expect(screen.getByText(/Will be removed in version 2.0.0/)).toBeInTheDocument();
      expect(screen.getByText('Will Be Removed In Version')).toBeInTheDocument();
      expect(screen.getByText('2.0.0')).toBeInTheDocument();
    });
  });

  describe('RDF representation tests with templated frontmatter', () => {
    it('generates all RDF formats correctly', () => {
      render(<ElementReference frontMatter={templatedFrontMatter} />);
      
      // Check JSON-LD
      expect(screen.getByText(/@context/)).toBeInTheDocument();
      expect(screen.getByText(/@graph/)).toBeInTheDocument();
      
      // Check Turtle
      expect(screen.getByText(/@prefix/)).toBeInTheDocument();
      
      // Check RDF/XML
      expect(screen.getByText(/<rdf:RDF/)).toBeInTheDocument();
      expect(screen.getByText(/<rdf:Property/)).toBeInTheDocument();
    });
  });
});