import type { Config } from '@docusaurus/types';
import type { SidebarItemsGeneratorArgs, NormalizedSidebarItem } from '@docusaurus/plugin-content-docs/lib/sidebars/types';
import preset, { getSiteConfig } from '../../packages/preset-ifla/dist/index.js';
import navbarItems from './navbar';

// Get site URLs based on environment
const { url, baseUrl, env } = getSiteConfig('ISBDM');

// Create a custom type that includes the undocumented `defaultSidebarItemsGenerator`
type CustomSidebarItemsGeneratorArgs = SidebarItemsGeneratorArgs & {
  defaultSidebarItemsGenerator: (args: SidebarItemsGeneratorArgs) => Promise<NormalizedSidebarItem[]> | NormalizedSidebarItem[];
};

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

const config: Config = {
  ...preset(undefined as any, {
    siteKey: 'ISBDM',
    title: 'ISBD for Manifestation',
    tagline: 'International Standard Bibliographic Description for Manifestation',
    url,
    baseUrl,
    env,

    // ISBDM-specific vocabulary configuration
    vocabularyDefaults: {
      prefix: "isbdm",
      numberPrefix: "T",
      profile: "isbdm-values-profile-revised.csv",
      elementDefaults: {
        uri: "https://www.iflastandards.info/ISBDM/elements",
        classPrefix: "class",
        propertyPrefix: "prop",
        profile: "isbdm-elements-profile.csv",
        profileShapeId: "ElementShape",
      }
    },

    // Custom navbar items
    customNavbarItems: navbarItems,

    // Navigation customization
    navigation: {
      hideCurrentSiteFromStandardsDropdown: true,
      standardsDropdownPosition: 'right',
      includeResourcesDropdown: false,
      includeDocumentationItem: false, // ISBDM has custom navigation structure
    },

    // Footer customization
    footer: {
      additionalResourceLinks: [],
    },

    // Custom redirects for ISBDM
    redirects: {
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

    // Use custom sidebar generator
    customSidebarGenerator: true,

    // GitHub configuration
    editUrl: 'https://github.com/iflastandards/ISBDM/tree/main/',

    // Override settings for ISBDM
    overrides: {
      onBrokenLinks: 'ignore', // Override: ignore generated element links
      onBrokenAnchors: 'ignore', // Override: ignore generated anchor links
      onBrokenMarkdownLinks: 'ignore', // Override: ignore generated markdown links
    }
  })
};

// Apply custom sidebar generator to the config
if (config.presets && config.presets[0] && Array.isArray(config.presets[0]) && config.presets[0][1]) {
  const presetOptions = config.presets[0][1] as any;
  if (presetOptions.docs) {
    presetOptions.docs.sidebarItemsGenerator = isbdmSidebarGenerator;
  }
}

export default config;