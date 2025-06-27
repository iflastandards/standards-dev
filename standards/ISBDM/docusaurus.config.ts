import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { getSiteConfig, getSiteConfigMap, type SiteKey, type Environment } from '@ifla/theme/config/siteConfig';
import type { SidebarItemsGeneratorArgs, NormalizedSidebarItem } from '@docusaurus/plugin-content-docs/lib/sidebars/types';

// Create a custom type that includes the undocumented `defaultSidebarItemsGenerator`
type CustomSidebarItemsGeneratorArgs = SidebarItemsGeneratorArgs & {
  defaultSidebarItemsGenerator: (args: SidebarItemsGeneratorArgs) => Promise<NormalizedSidebarItem[]> | NormalizedSidebarItem[];
};

// Custom sidebar generator that filters out index.mdx files
const customSidebarGenerator = async (generatorArgs: SidebarItemsGeneratorArgs) => {
  const { defaultSidebarItemsGenerator, ...args } = generatorArgs as CustomSidebarItemsGeneratorArgs;
  const sidebarItems: NormalizedSidebarItem[] = await defaultSidebarItemsGenerator(args);

  function filterIndexMdx(items: NormalizedSidebarItem[]): NormalizedSidebarItem[] {
    return items
      .filter((item: NormalizedSidebarItem) => {
        if (item.type === 'doc') {
          const docId = item.id || (item as any).docId || '';
          if (docId === 'index' ||
              docId.endsWith('/index') ||
              docId.split('/').pop() === 'index') {
            return false;
          }
        }
        return true;
      })
      .map((item: NormalizedSidebarItem) => {
        if (item.type === 'category' && item.items) {
          return {
            ...item,
            items: filterIndexMdx(item.items as NormalizedSidebarItem[]),
          };
        }
        return item;
      });
  }

  return filterIndexMdx(sidebarItems);
};

// Get current environment from DOCS_ENV
const DOCS_ENV = process.env.DOCS_ENV as Environment;
if (!DOCS_ENV) {
  throw new Error(
    'DOCS_ENV environment variable is required but not set. ' +
    'Valid values: local, preview, development, production'
  );
}

// Get configuration for this site
const siteConfig = getSiteConfig('ISBDM' as SiteKey, DOCS_ENV);
const siteConfigMap = getSiteConfigMap(DOCS_ENV);

const config: Config = {
  future: {
    v4: true,
    experimental_faster: true,
  },
  title: 'ISBD for Manifestation',
  tagline: 'International Standard Bibliographic Description for Manifestation',
  favicon: 'img/favicon.ico',

  // Use environment-specific URLs from site configuration
  url: siteConfig.url,
  baseUrl: siteConfig.baseUrl,

  organizationName: 'iflastandards',
  projectName: 'ISBDM',

  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'warn',
  onBrokenAnchors: 'ignore',

  // Shared static directories
  staticDirectories: ['static', '../../packages/theme/static'],

  customFields: {
    // Site configuration map for accessing sister site URLs
    siteConfigMap,
    // Vocabulary configuration
    vocabularyDefaults: {
      prefix: "isbdm",
      startCounter: 1000,
      uriStyle: "numeric",
      numberPrefix: "T", // Prefix for numeric URIs. Can be blank for no prefix.
      caseStyle: "kebab-case",
      showFilter: true,
      filterPlaceholder: "Filter vocabulary terms...",
      showTitle: false,
      showURIs: true, // Whether to display URIs in the table, set to false for glossaries
      showCSVErrors: false, // Whether to display CSV validation errors by default
      profile: "isbdm-values-profile-revised.csv",
      profileShapeId: "Concept",
      RDF: {
        "rdf:type": ["skos:ConceptScheme"]
      },
      // Common defaults for elements and defines the vocabulary properties
      elementDefaults: {
        uri: "https://www.iflastandards.info/ISBDM/elements",
        classPrefix: "C", // Class Prefix for numeric URIs. Can be blank for no prefix.
        propertyPrefix: "P", // Property Prefix for numeric URIs. Can be blank for no prefix.
        profile: "isbdm-elements-profile.csv",
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
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [],
        createRedirects: (existingPath: string) => {
          // ISBDM-specific element redirects
          // Only process element paths - be very specific to avoid interfering with other routes
          // This regex specifically matches element paths with numeric IDs only
          const elementMatch = existingPath.match(/^\/docs\/(attributes|statements|notes|relationships)\/(\d+)$/);
          if (elementMatch) {
            const elementId = elementMatch[2];
            // Only create redirect if it's a valid numeric element ID
            if (/^\d+$/.test(elementId)) {
              return [`/docs/elements/${elementId}`];
            }
          }
          // Don't redirect anything else - this prevents interference with other routes
          return undefined;
        },
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/iflastandards/standards-dev/tree/main/standards/ISBDM/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          sidebarItemsGenerator: customSidebarGenerator,
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
          editUrl: 'https://github.com/iflastandards/standards-dev/tree/main/standards/ISBDM/',
          feedOptions: {
            type: 'all',
            title: 'ISBD for Manifestation Blog',
            description: 'Updates and news about ISBD for Manifestation',
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
      title: 'ISBDM',
      logo: {
        alt: 'IFLA Logo',
        src: 'img/logo-ifla_black.png',
      },
      items: [
        {
          type: 'dropdown',
          label: 'Instructions',
          position: 'left',
          items: [
            {
              type: 'doc',
              docId: 'intro/index',
              label: 'Introduction',
            },
            {
              type: 'doc',
              docId: 'assess/index',
              label: 'Assessment',
            },
            {
              type: 'doc',
              docId: 'glossary/index',
              label: 'Glossary',
            },
            {
              type: 'doc',
              docId: 'fullex/index',
              label: 'Examples',
            },
          ],
        },
        {
          type: 'dropdown',
          label: 'Elements',
          position: 'left',
          items: [
            {
              type: 'doc',
              docId: 'statements/index',
              label: 'Statements',
            },
            {
              type: 'doc',
              docId: 'notes/index',
              label: 'Notes',
            },
            {
              type: 'doc',
              docId: 'attributes/index',
              label: 'Attributes',
            },
            {
              type: 'doc',
              docId: 'relationships/index',
              label: 'Relationships',
            },
          ],
        },
        {
          type: 'dropdown',
          position: 'left',
          label: 'Values',
          items: [
            {
              type: 'doc',
              docId: 'ves/index',
              label: 'Value Vocabularies',
            },
            {
              type: 'doc',
              docId: 'ses/index',
              label: 'String Encodings Schemes',
            },
          ]
        },
        {
          type: 'doc',
          docId: 'manage',
          label: 'Management',
          position: 'left',
          className: 'navbar__item--management',
        },
        {
          type: 'dropdown',
          label: 'About',
          position: 'right',
          items: [
            {
              type: 'doc',
              docId: 'about/index',
              label: 'About ISBDM',
            },
            {
              type: 'doc',
              docId: 'about/docusaurus-for-ifla',
              label: 'Modern Documentation Platform',
            },
          ],
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
