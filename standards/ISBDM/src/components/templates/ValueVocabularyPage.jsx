import React, { useState } from 'react';
import Heading from '@theme/Heading';

/**
 * Value Vocabulary Page Template
 * 
 * Used for displaying controlled vocabularies according to the IFLA specification
 */
export default function ValueVocabularyPage({
  children,
  title,
  hideTitle = true,
  description,
  values = [],
  attributionSource,
  attributionLicense,
  relatedElement,
  ...props
}) {
  const [filterText, setFilterText] = useState('');
  const [sortBy, setSortBy] = useState('value'); // value, definition

  // Filter and sort values
  const filteredValues = values.filter(item => 
    item.value.toLowerCase().includes(filterText.toLowerCase()) || 
    item.definition.toLowerCase().includes(filterText.toLowerCase()) ||
    (item.scopeNote && item.scopeNote.toLowerCase().includes(filterText.toLowerCase()))
  );

  const sortedValues = [...filteredValues].sort((a, b) => {
    if (sortBy === 'value') {
      return a.value.localeCompare(b.value);
    } else {
      return a.definition.localeCompare(b.definition);
    }
  });

  return (
    <article className="vocabulary-page">
      <header className="ifla-vocabulary-header">
        {!hideTitle && <Heading as="h1">{title}</Heading>}
        {relatedElement && (
          <div className="vocabulary-element-relation">
            For use with element: <a href={relatedElement.link}>{relatedElement.name}</a>
          </div>
        )}
      </header>

      {description && (
        <section className="vocabulary-description">
          {description}
        </section>
      )}

      <section className="vocabulary-controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Filter values..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="vocabulary-filter-input"
          />
        </div>
        <div className="sort-control">
          <label>
            Sort by:
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="vocabulary-sort-select"
            >
              <option value="value">Value</option>
              <option value="definition">Definition</option>
            </select>
          </label>
        </div>
      </section>

      <section className="vocabulary-table">
        <table>
          <thead>
            <tr>
              <th>Value</th>
              <th>Definition</th>
              <th>Scope Note</th>
            </tr>
          </thead>
          <tbody>
            {sortedValues.map((item, index) => (
              <tr key={index}>
                <td>{item.value}</td>
                <td>{item.definition}</td>
                <td>{item.scopeNote || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredValues.length === 0 && (
          <div className="no-results">No values match your filter criteria.</div>
        )}
      </section>

      {(attributionSource || attributionLicense) && (
        <section className="vocabulary-attribution">
          <h3>Attribution</h3>
          {attributionSource && <p>Source: {attributionSource}</p>}
          {attributionLicense && <p>License: {attributionLicense}</p>}
        </section>
      )}

      <div className="vocabulary-content">
        {children}
      </div>

      <section className="vocabulary-footer">
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
