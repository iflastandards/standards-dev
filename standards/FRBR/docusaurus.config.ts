import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { getSiteConfig, getSiteConfigMap, type SiteKey, type Environment } from '@ifla/theme/config/siteConfig';

// Get current environment from DOCS_ENV
const DOCS_ENV = process.env.DOCS_ENV as Environment;
if (!DOCS_ENV) {
  throw new Error(
    'DOCS_ENV environment variable is required but not set. ' +
    'Valid values: local, preview, development, production'
  );
}

// Get configuration for this site
const siteConfig = getSiteConfig('FRBR' as SiteKey, DOCS_ENV);
const siteConfigMap = getSiteConfigMap(DOCS_ENV);

const config: Config = {
  future: {
    v4: true,
    experimental_faster: true,
  },
  title: 'IFLA FR Family of Models',
  tagline: 'Conceptual Models for Bibliographic Information',
  favicon: 'img/favicon.ico',

  // Use environment-specific URLs from site configuration
  url: siteConfig.url,
  baseUrl: siteConfig.baseUrl,

  organizationName: 'iflastandards',
  projectName: 'FRBR',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Shared static directories
  staticDirectories: ['static', '../../packages/theme/static'],

  customFields: {
    // Site configuration map for accessing sister site URLs
    siteConfigMap,
    // Vocabulary configuration
    vocabularyDefaults: {
      prefix: "ifla",
      startCounter: 1000,
      uriStyle: "numeric",
      numberPrefix: "T", // Prefix for numeric URIs. Can be blank for no prefix.
      caseStyle: "kebab-case",
      showFilter: true,
      filterPlaceholder: "Filter vocabulary terms...",
      showTitle: false,
      showURIs: true, // Whether to display URIs in the table, set to false for glossaries
      showCSVErrors: false, // Whether to display CSV validation errors by default
      profile: "vocabulary-profile.csv",
      profileShapeId: "Concept",
      RDF: {
        "rdf:type": ["skos:ConceptScheme"]
      },
      // Common defaults for elements and defines the vocabulary properties
      elementDefaults: {
        uri: "https://www.iflastandards.info/elements",
        classPrefix: "C", // Class Prefix for numeric URIs. Can be blank for no prefix.
        propertyPrefix: "P", // Property Prefix for numeric URIs. Can be blank for no prefix.
        profile: "elements-profile.csv",
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
          editUrl: 'https://github.com/iflastandards/standards-dev/tree/main/standards/FRBR/',
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
          editUrl: 'https://github.com/iflastandards/standards-dev/tree/main/standards/FRBR/',
          feedOptions: {
            type: 'all',
            title: 'IFLA FR Family of Models Blog',
            description: 'Updates and news about IFLA FR Family of Models',
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
      title: 'FRBR',
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
        {to: '/blog', label: 'Blog', position: 'right'},
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          type: 'search',
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
