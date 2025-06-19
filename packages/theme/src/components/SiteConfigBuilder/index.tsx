/**
 * Site Configuration Builder
 * 
 * This function dynamically resolves site configuration and builds navigation/footer arrays
 * at runtime to prevent any build-time caching contamination between sites.
 * 
 * Called from docusaurus.config.factory.ts to get pre-built arrays for the preset.
 */

import { sites, DocsEnv, SiteKey } from '../../config/siteConfigCore';

type Environment = 'localhost' | 'preview' | 'production';

interface SiteConfigBuilderOptions {
  siteKey: SiteKey;
  hideCurrentSiteFromDropdown?: boolean;
  hideDefaultResourceLinks?: boolean;
}

interface SiteConfigBuilderResult {
  url: string;
  baseUrl: string;
  env: Environment;
  standardsDropdownItems: Array<{ label: string; href: string }>;
  footerLinks: {
    docsLinks: Array<{ label: string; to?: string; href?: string }>;
    standardsLinks: Array<{ label: string; href: string }>;
    resourceLinks: Array<{ label: string; to?: string; href?: string }>;
    moreLinks: Array<{ label: string; to?: string; href?: string }>;
  };
}

export function SiteConfigBuilder({ 
  siteKey, 
  hideCurrentSiteFromDropdown = false,
  hideDefaultResourceLinks = false
}: SiteConfigBuilderOptions): SiteConfigBuilderResult {
  // Get environment fresh each time (no caching)
  const getCurrentEnv = (): Environment => {
    const docsEnv = process.env.DOCS_ENV?.toLowerCase();
    const nodeEnv = process.env.NODE_ENV?.toLowerCase();
    
    if (docsEnv === 'localhost' || docsEnv === 'development' || nodeEnv === 'development') {
      return 'localhost';
    } else if (docsEnv === 'preview' || docsEnv === 'staging') {
      return 'preview';
    } else {
      return 'production';
    }
  };

  const env = getCurrentEnv();
  const envEnum = env === 'localhost' ? DocsEnv.Localhost : env === 'preview' ? DocsEnv.Preview : DocsEnv.Production;
  const siteConfig = sites[siteKey]?.[envEnum];
  
  if (!siteConfig) {
    throw new Error(`No configuration found for site '${siteKey}' in environment '${env}'`);
  }

  // Build standards dropdown items fresh each time
  const siteLabels: Record<SiteKey, string> = {
    portal: 'Portal Home',
    isbd: 'ISBD',
    LRM: 'LRM',
    unimarc: 'UNIMARC',
    ISBDM: 'ISBDM',
    FRBR: 'FR Family',
    muldicat: 'Muldicat',
    github: 'GitHub'
  };

  const allSites = Object.keys(sites) as SiteKey[];
  const sitesToShow = hideCurrentSiteFromDropdown
    ? allSites.filter(key => key !== siteKey)
    : allSites;

  const standardsDropdownItems = sitesToShow.map(key => {
    const config = sites[key][envEnum];
    return {
      label: siteLabels[key],
      href: `${config.url}${config.baseUrl}`,
    };
  });

  // Build footer links fresh each time
  const portalConfig = sites.portal[envEnum];
  const portalUrl = `${portalConfig.url}${portalConfig.baseUrl}`;

  // Docs section based on site type
  const docsLinks = (() => {
    if (siteKey === 'portal') {
      return [
        { label: 'Documentation', to: '/docs/' },
        { label: 'Standards Portal', href: portalUrl },
      ];
    } else if (siteKey === 'ISBDM') {
      return [
        { label: 'Standards Portal', href: portalUrl },
        { label: 'Introduction', to: '/docs/intro' },
        { label: 'Elements', to: '/docs/elements' },
        { label: 'Examples', to: '/docs/examples' },
      ];
    } else {
      return [
        { label: 'Standards Portal', href: portalUrl },
        { label: 'Introduction', to: '/docs/intro' },
      ];
    }
  })();

  // Standards section - all sites except portal and github
  const standardsLabels: Partial<Record<SiteKey, string>> = {
    isbd: 'ISBD',
    LRM: 'LRM', 
    unimarc: 'UNIMARC',
    ISBDM: 'ISBDM',
    FRBR: 'FR Family',
    muldicat: 'Muldicat'
  };

  const standardsLinks = (Object.keys(sites) as SiteKey[])
    .filter(key => key !== 'portal' && key !== 'github')
    .map(key => {
      const config = sites[key][envEnum];
      return {
        label: standardsLabels[key] || key,
        href: `${config.url}${config.baseUrl}`,
      };
    });

  // Resources section
  const defaultResourceLinks = hideDefaultResourceLinks ? [] : [
    { label: 'RDF Downloads', to: '/rdf/' },
    { label: 'Sitemap', to: '/sitemap' },
  ];

  const resourceLinks = [
    ...defaultResourceLinks,
    { label: 'Vocabulary Server', href: portalUrl.replace(/\/portal\/$/, '/') },
    { label: 'IFLA Website', href: 'https://www.ifla.org/' },
    { label: 'IFLA Standards', href: 'https://www.ifla.org/programmes/ifla-standards/' },
  ];

  // More section
  const moreLinks = [
    { label: 'Blog', to: '/blog' },
    { label: 'GitHub', href: 'https://github.com/iflastandards/standards-dev' },
    ...(hideDefaultResourceLinks ? [] : [{ label: 'Sitemap', to: '/sitemap' }]),
  ];

  return {
    url: siteConfig.url,
    baseUrl: siteConfig.baseUrl,
    env,
    standardsDropdownItems,
    footerLinks: {
      docsLinks,
      standardsLinks,
      resourceLinks,
      moreLinks
    }
  };
}

export default SiteConfigBuilder;