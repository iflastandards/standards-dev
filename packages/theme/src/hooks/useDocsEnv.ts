import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type { Environment } from '../config';

/**
 * Hook to get the current documentation environment.
 * Reads from siteConfig.customFields.docsEnv.
 *
 * @returns {Environment} The current documentation environment string.
 */
export function useDocsEnv(): Environment {
  const { siteConfig } = useDocusaurusContext();
  
  const customDocsEnv = siteConfig?.customFields?.docsEnv;

  if (customDocsEnv && typeof customDocsEnv === 'string') {
    // Ensure it's a valid Environment value, though type assertion is used here.
    // For stricter checking, you could compare against Environment values.
    return customDocsEnv as Environment;
  }

  return 'production' as Environment; 
}
