/// <reference types="react" />

// packages/theme/src/components/SiteLink.tsx
import React, { JSX } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { type SiteKey, type SiteConfigEntry } from '@ifla/shared-config';

/**
 * A component for creating robust, environment-aware links between different IFLA Docusaurus sites.
 * It uses the centralized siteConfig to generate correct absolute URLs based on the current environment.
 */
interface SiteLinkProps {
  /**
   * The key of the target site (e.g., 'LRM', 'portal'). Must be a valid SiteKey.
   */
  siteKey: SiteKey;
  /**
   * The relative path within the target site (e.g., '/introduction', 'docs/main', or '').
   * If it starts with '/', it's treated as absolute from the site's baseUrl root.
   * If empty, links to the site's base (url + baseUrl).
   * Defaults to an empty string, linking to the base of the target site.
   */
  path: string;
  /**
   * The content of the link.
   */
  children: React.ReactNode;
  /**
   * Optional. The CSS class name for the link element.
   */
  className?: string;
}

const SiteLink = ({ siteKey, path, children, className }: SiteLinkProps): JSX.Element => {
  const { siteConfig } = useDocusaurusContext();
  const siteConfigs = siteConfig.customFields?.siteConfigs as Record<SiteKey, SiteConfigEntry>;
  
  const targetConfig = siteConfigs[siteKey];
  if (!targetConfig) {
    throw new Error(`Site configuration not found for ${siteKey}`);
  }
  
  // Ensure proper path concatenation
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const fullUrl = `${targetConfig.url}${targetConfig.baseUrl}${normalizedPath}`;
  
  return (
    <a href={fullUrl} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

export default SiteLink;