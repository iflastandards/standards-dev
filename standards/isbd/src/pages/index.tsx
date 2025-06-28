// Replace the content of /Users/jonphipps/Code/IFLA/standards-dev/standards/isbd/src/pages/index.tsx

import React from 'react';
import Layout from '@theme/Layout';
import { StandardHomePage } from '@ifla/theme';

const frontMatter = {
  title: "International Standard Bibliographic Description",
  subtitle: "ISBD: The global standard for bibliographic description"
};

// Define inline styles for the contents section (using CSS-in-JS for now)
const contentsStyles: { [key: string]: React.CSSProperties } = {
  contentsOverview: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  contentsHeader: {
    marginBottom: '40px'
  },
  contentsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px'
  },
  contentCard: {
    background: '#f4f4f4',
    border: '1px solid #e1e5e9',
    borderRadius: '6px',
    padding: '20px',
    marginBottom: '20px',
    transition: 'box-shadow 0.2s ease'
  },
  featuredCard: {
    background: '#f0f8f0',
    borderColor: '#c8e6c9',
    borderWidth: '2px'
  },
  elementCount: {
    background: '#4a8f5b',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '2px 8px',
    borderRadius: '12px',
    float: 'right' as const
  },
  contentLink: {
    color: '#4a8f5b',
    fontSize: '12px',
    textDecoration: 'none',
    fontWeight: '500'
  },
  vocabularyLink: {
    color: '#4a8f5b',
    fontSize: '10px',
    textDecoration: 'none',
    fontWeight: '500'
  },
  vocabularyGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '15px'
  },
  addedInfo: {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '1px solid #e1e5e9',
    textAlign: 'center' as const,
    color: '#999',
    fontSize: '0.9rem'
  }
};

const ContentsContent: React.FC = () => (
  <div style={contentsStyles.contentsOverview}>
    <div style={contentsStyles.contentsHeader}>
      <h2 style={{ color: '#2d6840', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 10px 0' }}>
        {frontMatter.title} Contents Overview
      </h2>
      <p style={{ color: '#666', margin: '0' }}>
        This page introduces the ISBD Element Sets and Value Vocabularies.
      </p>
    </div>

    <div style={contentsStyles.contentsGrid}>
      {/* Documentation Section */}
      <div>
        <h3 style={{ color: '#2d6840', fontSize: '1.125rem', fontWeight: 'bold', margin: '0 0 20px 0' }}>Documentation</h3>

        <div style={contentsStyles.contentCard}>
          <h4 style={{ color: '#2d6840', fontSize: '14px', fontWeight: 'bold', margin: '0 0 10px 0' }}>Introduction</h4>
          <p style={{ color: '#666', fontSize: '12px', margin: '0 0 10px 0', lineHeight: 1.4 }}>
            Overview of ISBD principles, scope, and application guidelines
          </p>
          <a href="/ISBD/docs/introduction" style={contentsStyles.contentLink}>
            → View introduction
          </a>
        </div>

        <div style={contentsStyles.contentCard}>
          <h4 style={{ color: '#2d6840', fontSize: '14px', fontWeight: 'bold', margin: '0 0 10px 0' }}>Assessment Guidelines</h4>
          <p style={{ color: '#666', fontSize: '12px', margin: '0 0 10px 0', lineHeight: 1.4 }}>
            Criteria and methods for evaluating bibliographic descriptions
          </p>
          <a href="/ISBD/docs/assessment" style={contentsStyles.contentLink}>
            → View assessment
          </a>
        </div>

        <div style={contentsStyles.contentCard}>
          <h4 style={{ color: '#2d6840', fontSize: '14px', fontWeight: 'bold', margin: '0 0 10px 0' }}>Examples & Use Cases</h4>
          <p style={{ color: '#666', fontSize: '12px', margin: '0 0 10px 0', lineHeight: 1.4 }}>
            Practical examples of ISBD application across different resource types
          </p>
          <a href="/ISBD/docs/examples" style={contentsStyles.contentLink}>
            → Browse examples
          </a>
        </div>

        <div style={contentsStyles.contentCard}>
          <h4 style={{ color: '#2d6840', fontSize: '14px', fontWeight: 'bold', margin: '0 0 10px 0' }}>Glossary</h4>
          <p style={{ color: '#666', fontSize: '12px', margin: '0 0 10px 0', lineHeight: 1.4 }}>
            Definitions of key terms and concepts used throughout ISBD
          </p>
          <a href="/ISBD/docs/glossary" style={contentsStyles.contentLink}>
            → View glossary
          </a>
        </div>

        <div style={contentsStyles.contentCard}>
          <h4 style={{ color: '#2d6840', fontSize: '14px', fontWeight: 'bold', margin: '0 0 10px 0' }}>About ISBD</h4>
          <p style={{ color: '#666', fontSize: '12px', margin: '0 0 10px 0', lineHeight: 1.4 }}>
            History, development, and maintenance of the ISBD standard
          </p>
          <a href="/ISBD/docs/about" style={contentsStyles.contentLink}>
            → Learn more
          </a>
        </div>
      </div>

      {/* Element Sets & Vocabularies Section */}
      <div>
        <h3 style={{ color: '#2d6840', fontSize: '1.125rem', fontWeight: 'bold', margin: '0 0 20px 0' }}>Element Sets & Vocabularies</h3>

        {/* ISBD Element Sets */}
        <div style={{ marginBottom: '30px' }}>
          <h4 style={{ color: '#2d6840', fontSize: '1rem', fontWeight: 'bold', margin: '0 0 15px 0' }}>ISBD Element Sets</h4>

          <div style={{ ...contentsStyles.contentCard, ...contentsStyles.featuredCard }}>
            <h5 style={{ color: '#2d6840', fontSize: '14px', fontWeight: 'bold', margin: '0 0 10px 0' }}>ISBD Elements</h5>
            <span style={contentsStyles.elementCount}>1,000+ elements</span>
            <p style={{ color: '#666', fontSize: '12px', margin: '0 0 10px 0', lineHeight: 1.4 }}>
              The ISBD element set is a registration of classes and properties from International
              Standard Bibliographic Description (ISBD), consolidated edition, published by De Gruyter
              Saur in July 2011 (ISBN 978-3-11-026379-4).
            </p>
            <a href="/ISBD/docs/elements" style={contentsStyles.contentLink}>
              → Browse elements
            </a>
          </div>

          <div style={contentsStyles.contentCard}>
            <h5 style={{ color: '#2d6840', fontSize: '14px', fontWeight: 'bold', margin: '0 0 10px 0' }}>ISBD Elements (unconstrained)</h5>
            <p style={{ color: '#666', fontSize: '12px', margin: '0 0 10px 0', lineHeight: 1.4 }}>
              The ISBD element set is a registration of classes and properties from International
              Standard Bibliographic Description (ISBD), consolidated edition, published by De Gruyter
              Saur in July 2011 (ISBN 978-3-11-026379-4). This version has the same local URI part,
              label, and definition as each element in the constrained version, but no domain
              (i.e. Resource) or range is declared.
            </p>
            <a href="/ISBD/docs/elements/unconstrained" style={contentsStyles.contentLink}>
              → View unconstrained elements
            </a>
          </div>
        </div>

        {/* Value Vocabularies */}
        <div>
          <h4 style={{ color: '#2d6840', fontSize: '1rem', fontWeight: 'bold', margin: '0 0 15px 0' }}>ISBD Value Vocabularies</h4>
          <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.4, margin: '0 0 15px 0' }}>
            The ISBD element set vocabulary includes RDF classes and properties corresponding to ISBD elements.
            Six concept vocabularies give the controlled terminologies of the ISBD area 0 content forms,
            qualifications, and media types. Each class, concept, and property has a Uniform Resource
            Identifier (URI) for use in Semantic Web data triples.
          </p>

          {/* Vocabulary Grid */}
          <div style={contentsStyles.vocabularyGrid}>
            <div style={contentsStyles.contentCard}>
              <h6 style={{ color: '#2d6840', fontSize: '12px', fontWeight: 'bold', margin: '0 0 8px 0' }}>ISBD Content Form</h6>
              <p style={{ color: '#666', fontSize: '11px', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                Content form categories reflect the fundamental form or forms in which the content
                of a resource is expressed.
              </p>
              <a href="/ISBD/docs/terms/contentform" style={contentsStyles.vocabularyLink}>
                → View vocabulary
              </a>
            </div>

            <div style={contentsStyles.contentCard}>
              <h6 style={{ color: '#2d6840', fontSize: '12px', fontWeight: 'bold', margin: '0 0 8px 0' }}>ISBD Content Form Qualified Base</h6>
              <p style={{ color: '#666', fontSize: '11px', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                Compound terms for qualified ISBD content forms that map to RDA/ONIX Framework
                for Resource Categorization base content categories.
              </p>
              <a href="/ISBD/docs/terms/contentformbase" style={contentsStyles.vocabularyLink}>
                → View vocabulary
              </a>
            </div>

            <div style={contentsStyles.contentCard}>
              <h6 style={{ color: '#2d6840', fontSize: '12px', fontWeight: 'bold', margin: '0 0 8px 0' }}>ISBD Content Qualification of Dimensionality</h6>
              <p style={{ color: '#666', fontSize: '11px', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                Content qualification sub-categories for the number of spatial dimensions in which
                the image content of a resource is intended to be perceived which expand the content
                form category of image.
              </p>
              <a href="/ISBD/docs/terms/contentqualification/dimensionality" style={contentsStyles.vocabularyLink}>
                → View vocabulary
              </a>
            </div>

            <div style={contentsStyles.contentCard}>
              <h6 style={{ color: '#2d6840', fontSize: '12px', fontWeight: 'bold', margin: '0 0 8px 0' }}>ISBD Content Qualification of Motion</h6>
              <p style={{ color: '#666', fontSize: '11px', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                Content qualification sub-categories for the perceived presence or absence of
                movement in the image content of a resource which expand the content form category of image.
              </p>
              <a href="/ISBD/docs/terms/contentqualification/motion" style={contentsStyles.vocabularyLink}>
                → View vocabulary
              </a>
            </div>

            <div style={contentsStyles.contentCard}>
              <h6 style={{ color: '#2d6840', fontSize: '12px', fontWeight: 'bold', margin: '0 0 8px 0' }}>ISBD Content Qualification of Sensory Specification</h6>
              <p style={{ color: '#666', fontSize: '11px', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                Content qualification sub-categories for sensory specification, a human sense through
                which the content of a resource as published is intended to be perceived, which expand
                content form categories.
              </p>
              <a href="/ISBD/docs/terms/contentqualification/sensoryspecification" style={contentsStyles.vocabularyLink}>
                → View vocabulary
              </a>
            </div>

            <div style={contentsStyles.contentCard}>
              <h6 style={{ color: '#2d6840', fontSize: '12px', fontWeight: 'bold', margin: '0 0 8px 0' }}>ISBD Content Qualification of Type</h6>
              <p style={{ color: '#666', fontSize: '11px', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                Content qualification sub-categories for type which expand content form categories.
              </p>
              <a href="/ISBD/docs/terms/contentqualification/type" style={contentsStyles.vocabularyLink}>
                → View vocabulary
              </a>
            </div>

            <div style={contentsStyles.contentCard}>
              <h6 style={{ color: '#2d6840', fontSize: '12px', fontWeight: 'bold', margin: '0 0 8px 0' }}>ISBD Media Type</h6>
              <p style={{ color: '#666', fontSize: '11px', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                Media type categories record the type or types of carrier used to convey the content
                of the resource. Categories generally reflect the format of the storage medium and
                housing of a carrier in combination with the type of intermediation device required
                to render, view, run, etc., the content of a resource.
              </p>
              <a href="/ISBD/docs/terms/mediatype" style={contentsStyles.vocabularyLink}>
                → View vocabulary
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div style={contentsStyles.addedInfo}>
      <p><em>Added to this site: July 2020</em></p>
    </div>
  </div>
);

export default function HomePage(): React.ReactElement {
  return (
    <Layout
      title="ISBD"
      description="International Standard Bibliographic Description - The global standard for bibliographic description">
      <StandardHomePage
        frontMatter={frontMatter}
        contentsContent={<ContentsContent />}
      >
        {/* Welcome tab content */}
        <section>
          <h2>About ISBD</h2>
          <p>
            The International Standard Bibliographic Description (ISBD) is a set of rules produced by the
            International Federation of Library Associations and Institutions (IFLA) to create a bibliographic
            description in a standard, human-readable form, especially for use in a bibliography or a library catalogue.
          </p>

          <h3>Key Features</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', margin: '20px 0' }}>
            <div style={{ padding: '20px', background: 'white', border: '1px solid #e1e5e9', borderRadius: '6px' }}>
              <h4>📚 Comprehensive Coverage</h4>
              <p>Over 1,000 elements covering all aspects of bibliographic description from title and statement of responsibility to physical description and notes.</p>
            </div>

            <div style={{ padding: '20px', background: 'white', border: '1px solid #e1e5e9', borderRadius: '6px' }}>
              <h4>🌍 International Standard</h4>
              <p>Developed by IFLA and used globally by libraries, archives, and cultural institutions for consistent bibliographic description across all media types.</p>
            </div>

            <div style={{ padding: '20px', background: 'white', border: '1px solid #e1e5e9', borderRadius: '6px' }}>
              <h4>⚙️ Machine Readable</h4>
              <p>Available in multiple RDF formats for integration with modern library systems, semantic web applications, and linked data initiatives.</p>
            </div>
          </div>

          <h3>Getting Started</h3>
          <p>
            Explore the vocabulary structure, download RDF formats, or browse implementation examples in the
            documentation sections. Use the Contents tab above to navigate to specific element sets and vocabularies.
          </p>

          <div style={{ display: 'flex', gap: '15px', margin: '30px 0' }}>
            <a
              href="/ISBD/docs/elements"
              style={{
                padding: '10px 20px',
                background: '#2d6840',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold'
              }}
            >
              Browse Elements
            </a>
            <a
              href="/ISBD/docs/terms"
              style={{
                padding: '10px 20px',
                border: '2px solid #2d6840',
                color: '#2d6840',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold'
              }}
            >
              View Vocabularies
            </a>
            <a
              href="/ISBD/docs/examples"
              style={{
                padding: '10px 20px',
                border: '1px solid #666',
                color: '#666',
                textDecoration: 'none',
                borderRadius: '6px'
              }}
            >
              See Examples
            </a>
          </div>
        </section>
      </StandardHomePage>
    </Layout>
  );
}
