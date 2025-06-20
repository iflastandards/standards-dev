import type { Config } from '@docusaurus/types';
import preset, { getSiteConfig } from '../../packages/preset-ifla/dist/index.js';
import { DocsEnv } from '../../packages/theme/dist/config/siteConfigCore.js';
import navbarItems from './navbar';

// Get site URLs based on environment
const { url, baseUrl, env } = getSiteConfig('muldicat');

// Build navigation dynamically to prevent caching contamination
// Note: We manually build arrays here to avoid importing SiteConfigBuilder which causes module resolution issues
const getCurrentEnv = () => {
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

const currentEnv = getCurrentEnv();
const getSiteUrl = (siteKey: string, path: string = '/') => {
  const envConfig = {
    localhost: 'http://localhost:3000',
    preview: 'https://iflastandards.github.io/standards-dev',
    production: 'https://iflastandards.info'
  };
  const basePaths = {
    localhost: { portal: '/portal/', isbd: '/isbd/', LRM: '/LRM/', FRBR: '/FRBR/', unimarc: '/unimarc/', ISBDM: '/ISBDM/', muldicat: '/muldicat/' },
    preview: { portal: '/standards-dev/', isbd: '/standards-dev/isbd/', LRM: '/standards-dev/LRM/', FRBR: '/standards-dev/FRBR/', unimarc: '/standards-dev/unimarc/', ISBDM: '/standards-dev/ISBDM/', muldicat: '/standards-dev/muldicat/' },
    production: { portal: '/', isbd: '/isbd/', LRM: '/LRM/', FRBR: '/FRBR/', unimarc: '/unimarc/', ISBDM: '/ISBDM/', muldicat: '/muldicat/' }
  };
  
  return `${envConfig[currentEnv]}${basePaths[currentEnv][siteKey] || '/'}${path}`.replace(/\/+/g, '/').replace(/\/$/, path === '/' ? '/' : '');
};

// Standards dropdown items (excluding current site)
const standardsDropdownItems = [
  { label: 'Portal Home', href: getSiteUrl('portal') },
  { label: 'ISBD', href: getSiteUrl('isbd') },
  { label: 'LRM', href: getSiteUrl('LRM') },
  { label: 'UNIMARC', href: getSiteUrl('unimarc') },
  { label: 'ISBDM', href: getSiteUrl('ISBDM') },
  { label: 'FR Family', href: getSiteUrl('FRBR') },
  // muldicat excluded as current site
];

const footerLinks = {
  docsLinks: [
    { label: 'Standards Portal', href: getSiteUrl('portal') },
    { label: 'Introduction', to: '/docs/intro' },
  ],
  standardsLinks: [
    { label: 'ISBD', href: getSiteUrl('isbd') },
    { label: 'LRM', href: getSiteUrl('LRM') },
    { label: 'UNIMARC', href: getSiteUrl('unimarc') },
    { label: 'ISBDM', href: getSiteUrl('ISBDM') },
    { label: 'FR Family', href: getSiteUrl('FRBR') },
    { label: 'Muldicat', href: getSiteUrl('muldicat') },
  ],
  resourceLinks: [
    { label: 'RDF Downloads', to: '/rdf/' },
    { label: 'Vocabulary Server', href: getSiteUrl('portal').replace(/\/portal\/$/, '/') },
    { label: 'IFLA Website', href: 'https://www.ifla.org/' },
    { label: 'IFLA Standards', href: 'https://www.ifla.org/programmes/ifla-standards/' },
    { label: 'Sitemap', to: '/sitemap' },
  ],
  moreLinks: [
    { label: 'Blog', to: '/blog' },
    { label: 'GitHub', href: 'https://github.com/iflastandards/standards-dev' },
  ],
};

// Build navbar configuration using standard Docusaurus format
const navbar = {
  title: 'MulDiCat',
  logo: {
    alt: 'IFLA Logo',
    src: 'img/logo-ifla_black.png',
  },
  items: [
    {
      type: 'doc',
      position: 'left' as const,
      docId: 'index',
      label: 'Documentation',
    },
    ...navbarItems,
    {
      type: 'dropdown' as const,
      label: 'Standards',
      position: 'right' as const,
      items: standardsDropdownItems,
    },
    { to: '/blog', label: 'Blog', position: 'right' as const },
    {
      type: 'docsVersionDropdown' as const,
      position: 'right' as const,
    },
    {
      type: 'localeDropdown' as const,
      position: 'right' as const,
    },
    {
      type: 'search' as const,
      position: 'right' as const,
    }
  ],
};

// Build footer configuration using standard Docusaurus format
const footer = {
  style: 'dark' as const,
  logo: {
    alt: 'IFLA Logo',
    src: 'img/logo-ifla_black.png',
    href: 'https://www.ifla.org',
    width: 160,
    height: 51,
  },
  links: [
    {
      title: 'Docs',
      items: footerLinks.docsLinks,
    },
    {
      title: 'Standards',
      items: footerLinks.standardsLinks,
    },
    {
      title: 'Resources',
      items: footerLinks.resourceLinks,
    },
    {
      title: 'More',
      items: footerLinks.moreLinks,
    },
  ],
  copyright: `<div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
    <div>Copyright © ${new Date().getFullYear()} <a href="https://www.ifla.org" style="color: inherit;">International Federation of Library Associations and Institutions (IFLA)</a></div>
    <div style="display: flex; align-items: center; gap: 10px; margin-top: 10px;">
      <span>Built with</span>
      <a href="https://docusaurus.io" style="color: inherit;">Docusaurus</a>
    </div>
  </div>`,
};

const presetConfig = preset(undefined as any, {
  siteKey: 'muldicat',
  title: 'MulDiCat',
  tagline: 'Multilingual Dictionary of Cataloguing Terms and Concepts',
  url,
  baseUrl,
  env: env as DocsEnv,

  // MulDiCat-specific vocabulary configuration
  vocabularyDefaults: {
    prefix: "ifla",
    numberPrefix: "T",
    profile: "vocabulary-profile.csv",
    elementDefaults: {
      uri: "https://www.iflastandards.info/elements",
      classPrefix: "class",
      propertyPrefix: "prop",
      profile: "elements-profile.csv",
      profileShapeId: "ElementShape",
    }
  },

  // GitHub configuration
  editUrl: 'https://github.com/iflastandards/muldicat/tree/main/',

  // Enable redirects
  redirects: {
    createRedirects: (_existingPath: string) => undefined,
  },
});

const config: Config = {
  ...presetConfig,
  // Override themeConfig with our custom navbar and footer
  themeConfig: {
    ...presetConfig.themeConfig,
    navbar,
    footer,
  },
};

export default config;