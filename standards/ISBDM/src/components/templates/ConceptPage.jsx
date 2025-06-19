import React from 'react';
import Heading from '@theme/Heading';
import Details from '@theme/Details';
import Mermaid from '@theme/Mermaid';

/**
 * Concept/Instruction Page Template
 * 
 * Used for displaying conceptual guidance and instructions
 */
export default function ConceptPage({
  children,
  title,
  hideTitle = true,
  diagram,
  relatedElements = [],
  relatedConcepts = [],
  ...props
}) {
  return (
    <article className="concept-page">
      <header className="ifla-concept-header">
        {!hideTitle && <Heading as="h1">{title}</Heading>}
      </header>

      {diagram && (
        <section className="concept-diagram">
          <Heading as="h2">Entity Relationship</Heading>
          <div className="diagram-container">
            <Mermaid value={diagram} />
          </div>
          {diagram.explanation && (
            <div className="diagram-explanation">
              {diagram.explanation}
            </div>
          )}
        </section>
      )}

      <div className="concept-content">
        {children}
      </div>

      {relatedElements.length > 0 && (
        <section className="related-elements">
          <Heading as="h2">Related Elements</Heading>
          <ul className="related-elements-list">
            {relatedElements.map((element, index) => (
              <li key={index}>
                <a href={element.link}>{element.name}</a>
                {element.description && <span className="element-description"> - {element.description}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {relatedConcepts.length > 0 && (
        <section className="related-concepts">
          <Heading as="h2">Related Concepts</Heading>
          <ul className="related-concepts-list">
            {relatedConcepts.map((concept, index) => (
              <li key={index}>
                <a href={concept.link}>{concept.name}</a>
                {concept.description && <span className="concept-description"> - {concept.description}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="examples">
        <Heading as="h2">Examples</Heading>
        <Details summary="View examples">
          <div className="examples-content">
            {props.examples ? props.examples : (
              <p>No examples available for this concept.</p>
            )}
          </div>
        </Details>
      </section>

      <section className="concept-footer">
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
