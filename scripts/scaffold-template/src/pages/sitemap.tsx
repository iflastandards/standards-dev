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

// Custom component to handle individual doc links
function DocLink({ doc }: { doc: DocItem }) {
  const processedPath = useBaseUrl(doc.path);
  return (
    <li key={doc.id}>
      <Link to={processedPath}>
        {doc.title}
      </Link>
    </li>
  );
}

export default function Sitemap(): JSX.Element {
  const allDocsData = useAllDocsData();
  
  const organizeDocsByCategory = (docs: DocItem[]) => {
    const categories: Record<string, DocItem[]> = {};
    
    docs.forEach(doc => {
      if (!doc.title) return; // Skip docs without titles
      
      // Extract category from doc ID or path
      let category = 'General';
      
      if (doc.id.includes('/')) {
        const parts = doc.id.split('/');
        category = parts[0];
        // Capitalize first letter
        category = category.charAt(0).toUpperCase() + category.slice(1);
      } else if (doc.path.includes('/')) {
        const pathParts = doc.path.split('/').filter(part => part && part !== 'docs');
        if (pathParts.length > 1) {
          category = pathParts[0];
          category = category.charAt(0).toUpperCase() + category.slice(1);
        }
      }
      
      if (!categories[category]) {
        categories[category] = [];
      }
      
      categories[category].push(doc);
    });
    
    // Sort docs within each category by title
    Object.keys(categories).forEach(key => {
      categories[key].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
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
      description="Complete sitemap of __TITLE__ documentation"
    >
      <main className={styles.sitemapContainer}>
        <div className={styles.sitemapHeader}>
          <h1>Sitemap</h1>
          <p>Complete overview of all pages in __TITLE__ documentation</p>
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
                      <h3 className={styles.categoryTitle}>{categoryName}</h3>
                      <ul className={styles.docsList}>
                        {docs.map(doc => (
                          <DocLink key={doc.id} doc={doc} />
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className={styles.additionalLinks}>
          <h2>Additional Resources</h2>
          <ul className={styles.docsList}>
            <li><Link to="/rdf/">RDF Downloads</Link></li>
            <li><Link to="/blog/">Blog</Link></li>
          </ul>
        </div>
      </main>
    </Layout>
  );
}
