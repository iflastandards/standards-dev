/**
 * Base Docusaurus configuration for IFLA standards sites
 * Import and extend this configuration in your site's docusaurus.config.ts
 */

import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { IFLAThemeConfig } from '../types';

interface IFLADocusaurusConfig extends Omit<Config, 'customFields'> {
  customFields?: {
    vocabularyDefaults?: IFLAThemeConfig['vocabularyDefaults'];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

export function createIFLAConfig(
  siteConfig: {
    title: string;
    tagline: string;
    url: string;
    baseUrl: string;
    organizationName: string;
    projectName: string;
    githubUrl?: string;
    vocabularyDefaults?: IFLAThemeConfig['vocabularyDefaults'];
  }
): IFLADocusaurusConfig {
  
  const {
    title,
    tagline,
    url,
    baseUrl,
    organizationName,
    projectName,
    githubUrl,
    vocabularyDefaults
  } = siteConfig;

  return {
    title,
    tagline,
    favicon: '/img/favicon.ico',

    // Future flags for performance
    future: {
      experimental_faster: true,
      v4: true,
    },

    url,
    baseUrl,

    // GitHub pages deployment config
    organizationName,
    projectName,
    trailingSlash: true,
    onBrokenLinks: 'warn', // Default: warn on broken links
    onBrokenAnchors: 'warn', // Default: warn on broken anchors  
    onBrokenMarkdownLinks: 'warn',

    // Static directories - theme static first to ensure shared assets take precedence
    staticDirectories: ['../../packages/theme/static', 'static'],

    // Custom fields for IFLA components
    customFields: {
      vocabularyDefaults: vocabularyDefaults || {
        prefix: "ifla",
        startCounter: 1000,
        uriStyle: "numeric",
        numberPrefix: "T",
        caseStyle: "kebab-case",
        showFilter: true,
        filterPlaceholder: "Filter vocabulary terms...",
        showTitle: false,
        showURIs: true,
        showCSVErrors: false,
        profile: "vocabulary-profile.csv",
        profileShapeId: "Concept",
        RDF: {
          "rdf:type": ["skos:ConceptScheme"]
        },
        elementDefaults: {
          uri: "https://www.iflastandards.info/elements",
          classPrefix: "C",
          propertyPrefix: "P",
          profile: "elements-profile.csv",
          profileShapeId: "Element",
        }
      }
    },

    // Internationalization
    i18n: {
      defaultLocale: 'en',
      locales: ['en'],
      localeConfigs: {
        en: {
          label: 'English',
        },
      },
    },

    // Standard plugins
    plugins: [
      // 'docusaurus-plugin-sass', // Removed: Already included via commonDefaults/sharedPlugins
      [
        '@docusaurus/plugin-client-redirects',
        {
          redirects: [],
          createRedirects(existingPath: string) {
            // Handle element redirects - can be customized per site
            const elementMatch = existingPath.match(/^\/docs\/(attributes|statements|notes|relationships)\/(\d+)$/);
            if (elementMatch) {
              const elementId = elementMatch[2];
              return [`/docs/elements/${elementId}`];
            }
            return undefined;
          },
        },
      ],
      // Custom webpack configuration to handle Node.js polyfills
      function webpackPolyfillPlugin() {
        return {
          name: 'webpack-polyfill-plugin',
          configureWebpack() {
            return {
              resolve: {
                fallback: {
                  fs: false,
                  path: false,
                  crypto: false,
                  stream: false,
                  util: false,
                  child_process: false,
                  os: false,
                },
                alias: {
                  // Disable problematic modules
                  '@node-rs/jieba': false,
                  '@node-rs/jieba-wasm32-wasi': false,
                  '@nodelib/fs.scandir': false,
                  '@nodelib/fs.stat': false,
                  '@nodelib/fs.walk': false,
                }
              },
              ignoreWarnings: [
                /Failed to parse source map/,
                /Can't resolve.*in/,
                /Module not found/,
              ],
            };
          },
        };
      },
    ],

    // Classic preset configuration
    presets: [
      [
        'classic',
        {
          docs: {
            sidebarPath: './sidebars.ts', // Use the site's own sidebar
            editUrl: githubUrl ? `${githubUrl}/tree/main/` : undefined,
            versions: {
              current: {
                label: 'Latest',
                path: '',
              },
            },
            lastVersion: 'current',
            onlyIncludeVersions: ['current'],
            // Filter out index.mdx files from sidebar
            async sidebarItemsGenerator({defaultSidebarItemsGenerator, ...args}) {
              const sidebarItems = await defaultSidebarItemsGenerator(args);

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              function filterIndexMdx(items: any[]): any[] {
                return items
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .filter((item: any) => {
                      if (item.type === 'doc') {
                        const docId = item.id || item.docId || '';
                        if (docId === 'index' || 
                            docId.endsWith('/index') || 
                            docId.split('/').pop() === 'index') {
                          return false;
                        }
                      }
                      return true;
                    })
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .map((item: any) => {
                      if (item.type === 'category' && item.items) {
                        return {...item, items: filterIndexMdx(item.items)};
                      }
                      return item;
                    });
              }

              return filterIndexMdx(sidebarItems);
            }
          },
          blog: {
            showReadingTime: true,
            feedOptions: {
              type: ['rss', 'atom'],
              xslt: true,
            },
            editUrl: githubUrl ? `${githubUrl}/tree/main/` : undefined,
            onInlineTags: 'warn',
            onInlineAuthors: 'warn',
            onUntruncatedBlogPosts: 'warn',
          },
          theme: {
            customCss: './src/css/custom.css',
          },
        } satisfies Preset.Options,
      ],
    ],

    // Search theme - temporarily disabled to avoid jieba issues
    themes: [
      // [
      //   require.resolve('@easyops-cn/docusaurus-search-local'),
      //   {
      //     hashed: true,
      //     indexBlog: false,
      //   },
      // ],
    ],

    // Theme configuration
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
        maxHeadingLevel: 5,
      },
      image: 'img/docusaurus-social-card.jpg',
      
      // Navbar configuration
      navbar: {
        title,
        logo: {
          alt: 'IFLA Logo',
          src: 'img/logo-ifla_black.png',
        },
        items: [
          // Standard navigation items - sites should customize
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Introduction',
          },
          {
            type: 'dropdown',
            label: 'About',
            position: 'right',
            items: [
              {
                type: 'doc',
            docId: 'intro', // Fallback to intro since about/index may not exist
                label: `About ${title}`,
              },
              {
                type: 'doc',
                docId: 'intro', // Fallback to intro
                label: 'Modern Documentation Platform',
              },
            ],
          },
          {
            label: 'Resources',
            position: 'right',
            type: 'dropdown',
            items: [
              {
                label: 'Vocabulary Server',
                href: 'https://iflastandards.info/',
              },
              {
                label: 'IFLA Website',
                href: 'https://www.ifla.org/',
              },
              ...(githubUrl ? [{
                label: 'GitHub Repository',
                href: githubUrl,
              }] : []),
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
          ...(githubUrl ? [{
            href: githubUrl,
            position: 'right' as const,
            className: 'header-github-link',
            'aria-label': 'GitHub repository',
          }] : []),
        ],
      },

      // Color mode configuration
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },

      // Prism configuration
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    } satisfies Preset.ThemeConfig,
  };
}

// Default vocabulary settings for different types of IFLA standards
export const VOCABULARY_DEFAULTS = {
  ISBDM: {
    prefix: "isbdm",
    startCounter: 1000,
    uriStyle: "numeric" as const,
    numberPrefix: "T",
    caseStyle: "kebab-case" as const,
    profile: "isbdm-values-profile-revised.csv",
    profileShapeId: "Concept",
    elementDefaults: {
      uri: "https://www.iflastandards.info/ISBDM/elements",
      classPrefix: "C",
      propertyPrefix: "P",
      profile: "isbdm-elements-profile.csv",
      profileShapeId: "Element",
    }
  },
  LRM: {
    prefix: "lrm",
    startCounter: 1000,
    uriStyle: "numeric" as const,
    numberPrefix: "E",
    caseStyle: "kebab-case" as const,
    profile: "lrm-values-profile.csv",
    profileShapeId: "Concept",
    elementDefaults: {
      uri: "https://www.iflastandards.info/LRM/elements",
      classPrefix: "C",
      propertyPrefix: "P",
      profile: "lrm-elements-profile.csv",
      profileShapeId: "Element",
    }
  },
  ISBD: {
    prefix: "isbd",
    startCounter: 1000,
    uriStyle: "numeric" as const,
    numberPrefix: "T",
    caseStyle: "kebab-case" as const,
    profile: "isbd-values-profile.csv",
    profileShapeId: "Concept",
    elementDefaults: {
      uri: "https://www.iflastandards.info/ISBD/elements",
      classPrefix: "C",
      propertyPrefix: "P",
      profile: "isbd-elements-profile.csv",
      profileShapeId: "Element",
    }
  },
  GENERIC: {
    prefix: "ifla",
    startCounter: 1000,
    uriStyle: "numeric" as const,
    numberPrefix: "T",
    caseStyle: "kebab-case" as const,
    profile: "vocabulary-profile.csv",
    profileShapeId: "Concept",
    elementDefaults: {
      uri: "https://www.iflastandards.info/elements",
      classPrefix: "C",
      propertyPrefix: "P",
      profile: "elements-profile.csv",
      profileShapeId: "Element",
    }
  }
};

export default createIFLAConfig;
