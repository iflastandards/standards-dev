import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// Site configuration types
type Environment = 'local' | 'preview' | 'development' | 'production';
type SiteKey = 'portal' | 'ISBDM' | 'LRM' | 'FRBR' | 'isbd' | 'muldicat' | 'unimarc' | 'testsite' | 'newtest';

interface SiteConfigEntry {
  url: string;
  baseUrl: string;
  port?: number;
}

// Site configuration data - single source of truth
const SITE_CONFIG: Record<SiteKey, Record<Environment, SiteConfigEntry>> = {
  portal: {
    local: { url: 'http://localhost:3000', baseUrl: '/', port: 3000 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/' },
  },
  ISBDM: {
    local: { url: 'http://localhost:3001', baseUrl: '/ISBDM/', port: 3001 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/ISBDM/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/ISBDM/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/ISBDM/' },
  },
  LRM: {
    local: { url: 'http://localhost:3002', baseUrl: '/LRM/', port: 3002 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/LRM/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/LRM/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/LRM/' },
  },
  FRBR: {
    local: { url: 'http://localhost:3003', baseUrl: '/FRBR/', port: 3003 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/FRBR/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/FRBR/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/FRBR/' },
  },
  isbd: {
    local: { url: 'http://localhost:3004', baseUrl: '/isbd/', port: 3004 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/isbd/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/isbd/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/isbd/' },
  },
  muldicat: {
    local: { url: 'http://localhost:3005', baseUrl: '/muldicat/', port: 3005 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/muldicat/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/muldicat/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/muldicat/' },
  },
  unimarc: {
    local: { url: 'http://localhost:3006', baseUrl: '/unimarc/', port: 3006 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/unimarc/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/unimarc/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/unimarc/' },
  },
  testsite: {
    local: { url: 'http://localhost:3007', baseUrl: '/testsite/', port: 3007 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/testsite/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/testsite/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/testsite/' },
  },
  newtest: {
    local: { url: 'http://localhost:3008', baseUrl: '/newtest/', port: 3008 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/newtest/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/newtest/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/newtest/' },
  },
};

// Get site configuration for a specific site and environment
function getSiteConfig(siteKey: SiteKey, env: Environment): SiteConfigEntry {
  const config = SITE_CONFIG[siteKey]?.[env];
  if (!config) {
    throw new Error(`Configuration missing for ${siteKey} in ${env}`);
  }
  return { ...config };
}

// Get all site configurations for current environment
function getSiteConfigMap(env: Environment): Record<SiteKey, SiteConfigEntry> {
  const result: Record<SiteKey, SiteConfigEntry> = {} as Record<SiteKey, SiteConfigEntry>;
  (Object.keys(SITE_CONFIG) as SiteKey[]).forEach(siteKey => {
    const config = SITE_CONFIG[siteKey]?.[env];
    if (config) {
      result[siteKey] = { ...config };
    }
  });
  return result;
}

// Get current environment from DOCS_ENV
const DOCS_ENV = process.env.DOCS_ENV as Environment;
if (!DOCS_ENV) {
  throw new Error(
    'DOCS_ENV environment variable is required but not set. ' +
    'Valid values: local, preview, development, production'
  );
}

// Get configuration for this site
const siteConfig = getSiteConfig('unimarc' as SiteKey, DOCS_ENV);
const siteConfigMap = getSiteConfigMap(DOCS_ENV);

const config: Config = {
  future: {
    v4: true,
  },
  title: 'UNIMARC',
  tagline: 'Universal MARC Format',
  favicon: 'img/favicon.ico',

  // Use environment-specific URLs from site configuration
  url: siteConfig.url,
  baseUrl: siteConfig.baseUrl,

  organizationName: 'iflastandards',
  projectName: 'unimarc',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Shared static directories
  staticDirectories: ['static', '../../packages/theme/static'],

  customFields: {
    // Site configuration map for accessing sister site URLs
    siteConfigMap,
    // Vocabulary configuration for UNIMARC
    vocabularyDefaults: {
      prefix: "unimarc",
      startCounter: 1000,
      uriStyle: "numeric",
      numberPrefix: "T", // Prefix for numeric URIs. Can be blank for no prefix.
      caseStyle: "kebab-case",
      showFilter: true,
      filterPlaceholder: "Filter vocabulary terms...",
      showTitle: false,
      showURIs: true, // Whether to display URIs in the table, set to false for glossaries
      showCSVErrors: false, // Whether to display CSV validation errors by default
      profile: "unimarc-values-profile.csv",
      profileShapeId: "Concept",
      RDF: {
        "rdf:type": ["skos:ConceptScheme"]
      },
      // Common defaults for elements and defines the vocabulary properties
      elementDefaults: {
        uri: "https://www.iflastandards.info/unimarc/elements",
        classPrefix: "C", // Class Prefix for numeric URIs. Can be blank for no prefix.
        propertyPrefix: "P", // Property Prefix for numeric URIs. Can be blank for no prefix.
        profile: "unimarc-elements-profile.csv",
        profileShapeId: "Element",
      }
    }
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
    localeConfigs: {
      en: {
        label: 'English',
      },
    },
  },

  plugins: [
    'docusaurus-plugin-sass',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexBlog: true,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/iflastandards/standards-dev/tree/main/standards/unimarc/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          versions: {
            current: {
              label: 'Latest',
              path: '',
            },
          },
          lastVersion: 'current',
          onlyIncludeVersions: ['current'],
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/iflastandards/standards-dev/tree/main/standards/unimarc/',
          feedOptions: {
            type: 'all',
            title: 'UNIMARC Blog',
            description: 'Updates and news about UNIMARC',
            copyright: `Copyright © ${new Date().getFullYear()} IFLA.`,
            language: 'en',
          },
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
      versionPersistence: 'localStorage',
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 6,
    },
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'unimarc',
      logo: {
        alt: 'IFLA Logo',
        src: 'img/logo-ifla_black.png',
      },
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Introduction',
        },
        {
          to: '/blog',
          label: 'Blog',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Resources',
          items: [
            {
              label: 'RDF Downloads',
              to: '/rdf/',
            },
            {
              label: 'Sitemap',
              to: '/sitemap',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'IFLA Website',
              href: 'https://www.ifla.org/',
            },
            {
              label: 'IFLA Standards',
              href: 'https://www.ifla.org/programmes/ifla-standards/',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Portal',
              href: `${siteConfig.url === siteConfigMap.portal.url ? '/' : siteConfigMap.portal.url + siteConfigMap.portal.baseUrl}`,
            },
            {
              label: 'GitHub',
              href: 'https://github.com/iflastandards/standards-dev',
            },
          ],
        },
      ],
      copyright: `
      Copyright © ${new Date().getFullYear()} International Federation of Library Associations and Institutions (IFLA)<br />
      <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">
        <img src="img/cc0_by.png" alt="CC BY 4.0" style="vertical-align:middle; height:24px;" />
      </a>
      Gordon Dunsire and Mirna Willer (Main design and content editors).
    `,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
