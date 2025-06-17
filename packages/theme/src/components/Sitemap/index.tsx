import React, {JSX} from 'react';
import Layout from '@theme/Layout';
import {useAllDocsData} from '@docusaurus/plugin-content-docs/lib/client';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.scss';

interface DocItem {
  id: string;
  path: string;
  title?: string;
  sidebar?: string;
}

interface SitemapProps {
  /**
   * Custom category mapping for organizing docs
   * If not provided, will use automatic categorization
   */
  categoryMapping?: Record<string, string>;
  
  /**
   * Additional resource links to show
   */
  additionalResources?: Array<{
    label: string;
    href: string;
  }>;
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

/**
 * Shared Sitemap component for IFLA standards sites
 * Automatically organizes documentation by category and provides navigation
 */
export const Sitemap: React.FC<SitemapProps> = ({
  categoryMapping,
  additionalResources = []
}) => {
  const {siteConfig} = useDocusaurusContext();
  const allDocsData = useAllDocsData();
  
  const organizeDocsByCategory = (docs: DocItem[]) => {
    const categories: Record<string, DocItem[]> = {};
    
    docs.forEach(doc => {
      if (!doc.title) return; // Skip docs without titles
      
      let category = 'General';
      
      // Use custom category mapping if provided
      if (categoryMapping) {
        const docCategory = doc.id.split('/')[0];
        category = categoryMapping[docCategory] || 'Other';
      } else {
        // Automatic categorization based on doc ID
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
  
  // Default additional resources
  const defaultResources = [
    { label: 'RDF Downloads', href: '/rdf/' },
    { label: 'Blog', href: '/blog/' },
    ...additionalResources
  ];
  
  return (
    <Layout
      title="Sitemap"
      description={`Complete sitemap of ${siteConfig.title} documentation`}
    >
      <main className={styles.sitemapContainer}>
        <div className={styles.sitemapHeader}>
          <h1>Sitemap</h1>
          <p>Complete overview of all pages in {siteConfig.title} documentation</p>
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
        
        {defaultResources.length > 0 && (
          <div className={styles.additionalLinks}>
            <h2>Additional Resources</h2>
            <ul className={styles.docsList}>
              {defaultResources.map((resource, index) => (
                <li key={index}>
                  <Link to={resource.href}>{resource.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </Layout>
  );
};

export default Sitemap;
