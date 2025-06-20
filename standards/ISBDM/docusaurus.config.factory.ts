import type { Config } from '@docusaurus/types';
import type { SidebarItemsGeneratorArgs, NormalizedSidebarItem } from '@docusaurus/plugin-content-docs/lib/sidebars/types';
import preset from '../../packages/preset-ifla/dist/index.js';
import { SiteConfigBuilder } from '../../packages/theme/dist/index.js';
import navbarItems from './navbar';

// Use the SiteConfigBuilder function to dynamically resolve configuration
// This prevents any build-time caching contamination between sites
const configData = SiteConfigBuilder({
  siteKey: 'ISBDM',
  hideCurrentSiteFromDropdown: true,
  hideDefaultResourceLinks: false
});

const { url, baseUrl, env, standardsDropdownItems, footerLinks } = configData;

// Build navbar configuration using standard Docusaurus format
const navbar = {
  title: 'ISBD for Manifestation',
  logo: {
    alt: 'IFLA Logo',
    src: 'img/logo-ifla_black.png',
  },
  items: [
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

const presetConfig = preset(undefined as any, {
  siteKey: 'ISBDM',
  title: 'ISBD for Manifestation',
  tagline: 'International Standard Bibliographic Description for Manifestation',
  url,
  baseUrl,
  env: env as DocsEnv,

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

// Apply custom sidebar generator to the config
if (config.presets && config.presets[0] && Array.isArray(config.presets[0]) && config.presets[0][1]) {
  const presetOptions = config.presets[0][1] as any;
  if (presetOptions.docs) {
    presetOptions.docs.sidebarItemsGenerator = isbdmSidebarGenerator;
  }
}

export default config;