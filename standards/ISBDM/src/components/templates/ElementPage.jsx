import React from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';

/**
 * Element Page Template
 * 
 * Used for displaying metadata elements according to the IFLA specification
 */
export default function ElementPage({
  children,
  title,
  mandatory = false,
  domain,
  range,
  definition,
  scopeNote,
  subTypes = [],
  superTypes = [],
  rdfData,
  examples = [],
  hideTitle = true, // Add a prop to optionally hide the title
  ...props
}) {
  return (
    <article className="element-page">
      <header className="ifla-element-header">
        {!hideTitle && (
          <div className="ifla-element-title">
            <Heading as="h1">{title}</Heading>
            {mandatory && <span className="ifla-badge ifla-badge-mandatory">Mandatory</span>}
          </div>
        )}
        {hideTitle && mandatory && (
          <div className="ifla-element-badges">
            <span className="ifla-badge ifla-badge-mandatory">Mandatory</span>
          </div>
        )}
      </header>

      <section className="ifla-element-reference">
        <Heading as="h2">Element Reference</Heading>
        {definition && (
          <div className="element-definition">
            <strong>Definition:</strong> {definition}
          </div>
        )}
        {scopeNote && (
          <div className="element-scope">
            <strong>Scope Note:</strong> {scopeNote}
          </div>
        )}
        {domain && (
          <div className="element-domain">
            <strong>Domain:</strong> {domain}
          </div>
        )}
        {range && (
          <div className="element-range">
            <strong>Range:</strong> {range}
          </div>
        )}

        {superTypes.length > 0 && (
          <div className="element-super-types">
            <strong>Element Super-Type{superTypes.length > 1 ? 's' : ''}:</strong>
            <ul>
              {superTypes.map((type, index) => (
                <li key={index}>
                  <a href={type.link}>{type.name}</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {subTypes.length > 0 && (
          <div className="element-sub-types">
            <strong>Element Sub-Type{subTypes.length > 1 ? 's' : ''}:</strong>
            <ul>
              {subTypes.map((type, index) => (
                <li key={index}>
                  <a href={type.link}>{type.name}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="ifla-element-content">
        <Tabs>
          <TabItem value="documentation" label="Documentation">
            <div className="element-content-documentation">
              {children}
            </div>
          </TabItem>
          
          {rdfData && (
            <TabItem value="rdf" label="RDF Representation">
              <div className="ifla-element-rdf">
                <Tabs>
                  <TabItem value="json-ld" label="JSON-LD">
                    <CodeBlock language="json">{rdfData.jsonld}</CodeBlock>
                  </TabItem>
                  <TabItem value="xml" label="XML">
                    <CodeBlock language="xml">{rdfData.xml}</CodeBlock>
                  </TabItem>
                  <TabItem value="turtle" label="Turtle">
                    <CodeBlock language="turtle">{rdfData.turtle}</CodeBlock>
                  </TabItem>
                </Tabs>
              </div>
            </TabItem>
          )}
          
          {examples.length > 0 && (
            <TabItem value="examples" label="Examples">
              <div className="ifla-element-examples">
                <Tabs>
                  {examples.map((example, index) => (
                    <TabItem key={index} value={`example-${index}`} label={example.title || `Example ${index + 1}`}>
                      <div className="example-description">{example.description}</div>
                      <CodeBlock language="turtle">{example.code}</CodeBlock>
                    </TabItem>
                  ))}
                </Tabs>
              </div>
            </TabItem>
          )}
        </Tabs>
      </div>

      <section className="element-footer">
        <hr />
        <div className="edit-page-feedback">
          <a href="#" className="edit-page-link">Edit this page</a>
          <span className="separator">•</span>
          <a href="#" className="report-issue-link">Report an issue</a>
        </div>
      </section>
    </article>
  );
}
