import React, {JSX} from 'react';
import Layout from '@theme/Layout';
import {useAllDocsData} from '@docusaurus/plugin-content-docs/lib/client';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './sitemap.module.scss';

interface DocItem {
  id: string;
  path: string;
  title?: string; // Make title optional
  sidebar?: string;
  // Add any other properties that might be in the GlobalDoc type
}

// Removing unused interface

// Custom component to handle individual doc links
function DocLink({ doc }: { doc: DocItem }) {
  const processedPath = useBaseUrl(doc.path);
  return (
    <li key={doc.id}>
      <Link to={processedPath}>
        {doc.title || doc.id}
      </Link>
    </li>
  );
}

export default function Sitemap(): JSX.Element {
  const allDocsData = useAllDocsData();
  
  // Organize docs by category
  const organizeDocsByCategory = (docs: DocItem[]) => {
    const categories: Record<string, DocItem[]> = {
      'Introduction': [],
      'Assessment': [],
      'Glossary': [],
      'Examples': [],
      'Statements': [],
      'Notes': [],
      'Attributes': [],
      'Relationships': [],
      'Value Vocabularies': [],
      'String Encoding Schemes': [],
      'About': [],
      'Other': []
    };
    
    docs.forEach(doc => {
      const pathParts = doc.id.split('/');
      const category = pathParts[0];
      
      switch(category) {
        case 'intro':
          categories['Introduction'].push(doc);
          break;
        case 'assess':
          categories['Assessment'].push(doc);
          break;
        case 'glossary':
          categories['Glossary'].push(doc);
          break;
        case 'fullex':
          categories['Examples'].push(doc);
          break;
        case 'statements':
          categories['Statements'].push(doc);
          break;
        case 'notes':
          categories['Notes'].push(doc);
          break;
        case 'attributes':
          categories['Attributes'].push(doc);
          break;
        case 'relationships':
          categories['Relationships'].push(doc);
          break;
        case 'ves':
          categories['Value Vocabularies'].push(doc);
          break;
        case 'ses':
          categories['String Encoding Schemes'].push(doc);
          break;
        case 'about':
          categories['About'].push(doc);
          break;
        default:
          categories['Other'].push(doc);
      }
    });
    
    // Remove empty categories
    Object.keys(categories).forEach(key => {
      if (categories[key].length === 0) {
        delete categories[key];
      }
    });
    
    return categories;
  };
  
  return (
    <Layout
      title="Sitemap"
      description="Complete sitemap of ISBD for Manifestation documentation"
    >
      <main className={styles.sitemapContainer}>
        <div className={styles.sitemapHeader}>
          <h1>Sitemap</h1>
          <p>Complete overview of all pages in ISBD for Manifestation documentation</p>
        </div>
        
        <div className={styles.sitemapContent}>
          {Object.entries(allDocsData).map(([pluginId, pluginData]) => {
            const latestVersion = pluginData.versions.find(v => v.isLast);
            if (!latestVersion) return null;

            const categories = organizeDocsByCategory(latestVersion.docs as unknown as DocItem[]);



            return (
              <div key={pluginId} className={styles.versionSection}>
                <div className={styles.categoryGrid}>
                  {Object.entries(categories).map(([categoryName, docs]) => (
                    <div key={categoryName} className={styles.categorySection}>
                      <h2 className={styles.categoryTitle}>{categoryName}</h2>
                      <ul className={styles.docsList}>
                        {docs
                          .sort((a, b) => (a.title || '').localeCompare(b.title || ''))
                          .map(doc => (
                            <DocLink key={doc.id} doc={doc} />
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          <div className={styles.additionalLinks}>
            <h2>Additional Resources</h2>
            <ul className={styles.docsList}>
              <li><Link to={useBaseUrl('/blog')}>Blog</Link></li>
              <li><Link to="https://github.com/iflastandards/ISBDM" target="_blank" rel="noopener noreferrer">GitHub Repository</Link></li>
              <li><Link to="https://www.ifla.org" target="_blank" rel="noopener noreferrer">IFLA Website</Link></li>
            </ul>
          </div>
        </div>
      </main>
    </Layout>
  );
}
