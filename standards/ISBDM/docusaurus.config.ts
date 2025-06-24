import * as dotenv from 'dotenv';
import * as path from 'path';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type { SidebarItemsGeneratorArgs, NormalizedSidebarItem } from '@docusaurus/plugin-content-docs/lib/sidebars/types';
import { deepmerge } from 'deepmerge-ts';
import { 
  createBaseConfig, 
  createThemeConfig, 
  createIFLAPlugins, 
  createStandardsPresetConfig,
  createStandardsFooter,
  createVocabularyConfig,
  createStaticDirectories,
  createStandardsNavbar,
  normalizeEnvironmentName, 
  validateEnvConfig 
} from '@ifla/shared-config';
import navbarItems from './navbar';

// Create a custom type that includes the undocumented `defaultSidebarItemsGenerator`
type CustomSidebarItemsGeneratorArgs = SidebarItemsGeneratorArgs & {
  defaultSidebarItemsGenerator: (args: SidebarItemsGeneratorArgs) => Promise<NormalizedSidebarItem[]> | NormalizedSidebarItem[];
};

// Determine environment and load env files - PURE APPROACH
const docsEnv = process.env['DOCS_ENV'];
if (!docsEnv) {
  throw new Error(
    `❌ FATAL: DOCS_ENV environment variable is required but not set.\n` +
    `✅ Valid values: local, localhost, preview, dev, production\n` +
    `💡 NX builds should load DOCS_ENV from root .env file automatically.\n` +
    `💡 CI/production workflows must set DOCS_ENV explicitly.`
  );
}
const environment = normalizeEnvironmentName(docsEnv);

// Load environment variables in priority order
const envFiles = [
  '.env.site',
  `.env.site.${environment}`,
  '.env.site.local',
  environment !== 'local' ? `.env.site.${environment}.local` : null,
].filter(Boolean);

// Load each env file, later files override earlier ones
for (const file of envFiles) {
  dotenv.config({ path: path.resolve(__dirname, file!) });
}

// Validate we have all required environment variables
const envConfig = validateEnvConfig(process.env, 'ISBDM');

// Custom sidebar generator for ISBDM
const isbdmSidebarGenerator = async (generatorArgs: SidebarItemsGeneratorArgs) => {
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

const config: Config = deepmerge(
  createBaseConfig({
    title: envConfig.SITE_TITLE,
    tagline: envConfig.SITE_TAGLINE,
    url: envConfig.SITE_URL,
    baseUrl: envConfig.SITE_BASE_URL,
    projectName: 'ISBDM',
  }),
  {
    // ISBDM-specific overrides
    onBrokenLinks: 'ignore' as const, // ISBDM-specific: ignore generated element links
    onBrokenAnchors: 'ignore' as const, // ISBDM-specific: ignore generated anchor links
    
    // Add future config block for compliance with regression tests
    future: {
      experimental_faster: false,
      v4: true,
    },
    
    // Shared static directories for standards sites
    staticDirectories: createStaticDirectories('standard'),
    
    customFields: {
      // Current environment for client-side components
      environment,
      // ISBDM-specific vocabulary configuration using factory
      vocabularyDefaults: createVocabularyConfig({
        prefix: envConfig.VOCABULARY_PREFIX!,
        numberPrefix: envConfig.VOCABULARY_NUMBER_PREFIX,
        profile: envConfig.VOCABULARY_PROFILE,
        elementUri: envConfig.VOCABULARY_ELEMENT_URI,
        elementProfile: envConfig.VOCABULARY_ELEMENT_PROFILE,
      }),
    },

    presets: [
      [
        'classic',
        createStandardsPresetConfig({
          editUrl: envConfig.GITHUB_EDIT_URL!,
          enableBlog: true,
          sidebarItemsGenerator: isbdmSidebarGenerator,
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        }),
      ],
    ],

    plugins: [
      // IFLA standard plugins
      ...createIFLAPlugins({
        environment, // Pass environment for pure function
        enableLocalSearch: true,
        searchConfig: {
          indexBlog: true, // ISBDM has a blog
          language: ['en'],
        },
        // imageConfig defaults are now environment-aware in the factory
      }),
      
      // ISBDM-specific plugins
      [
        '@docusaurus/plugin-client-redirects',
        {
          redirects: [],
          createRedirects: (existingPath: string) => {
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

    themeConfig: deepmerge(
      createThemeConfig({
        navbarTitle: 'ISBDM',
        navbarItems: createStandardsNavbar({
          title: 'ISBDM',
          customItems: navbarItems,
          includeBlog: true,
          includeVersionDropdown: true,
          includeLocaleDropdown: true,
          includeSearch: true,
        }),
        footerLinks: createStandardsFooter({
          githubUrl: envConfig.GITHUB_REPO_URL!,
          includeRdfDownloads: true,
          includeSitemap: true,
          includeBlog: true,
        }).links,
        copyright: createStandardsFooter({
          githubUrl: envConfig.GITHUB_REPO_URL!,
        }).copyright,
      }),
      {
        // ISBDM-specific theme overrides
        metadata: [
          { name: 'keywords', content: 'ifla, library, standards, isbd, manifestation, cataloging' },
        ],
        tableOfContents: {
          minHeadingLevel: 2,
          maxHeadingLevel: 6,
        },
      } satisfies Partial<Preset.ThemeConfig>,
    ),
  }
);

export default config;
