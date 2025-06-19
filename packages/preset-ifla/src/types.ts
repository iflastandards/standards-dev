import type { LoadContext } from '@docusaurus/types';
import type { NavbarItem } from '@docusaurus/theme-common';

// Re-export types we need from the theme package to avoid import issues
export type SiteKey = 'portal' | 'ISBDM' | 'LRM' | 'FRBR' | 'isbd' | 'muldicat' | 'unimarc' | 'github';

export enum DocsEnv {
  Localhost = 'localhost',
  Preview = 'preview',
  Production = 'production',
}

export interface VocabularyDefaults {
  prefix: string;
  startCounter: number;
  uriStyle: "numeric" | "kebab-case" | "camelCase";
  numberPrefix: string;
  caseStyle: "kebab-case" | "camelCase" | "PascalCase";
  showFilter: boolean;
  filterPlaceholder: string;
  showTitle: boolean;
  showURIs: boolean;
  showCSVErrors: boolean;
  profile: string;
  profileShapeId: string;
  RDF: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  elementDefaults: {
    uri: string;
    classPrefix: string;
    propertyPrefix: string;
    profile: string;
    profileShapeId: string;
  };
}

/**
 * Navigation options for the preset
 */
export interface IFLANavigationOptions {
  /** Hide the current site from the Standards dropdown */
  hideCurrentSiteFromStandardsDropdown?: boolean;
  /** Position of the Standards dropdown in navbar */
  standardsDropdownPosition?: 'left' | 'right';
  /** Whether to include the Resources dropdown */
  includeResourcesDropdown?: boolean;
  /** Whether to include the Documentation navbar item */
  includeDocumentationItem?: boolean;
}

/**
 * Footer customization options
 */
export interface IFLAFooterOptions {
  /** Additional resource links to add to the footer */
  additionalResourceLinks?: Array<{
    label: string;
    href: string;
  }>;
  /** Hide default resource links (RDF Downloads, Sitemap) for sites that don't have them */
  hideDefaultResourceLinks?: boolean;
}

/**
 * Redirect configuration options
 */
export interface IFLARedirectOptions {
  /** Array of redirect rules */
  redirects?: Array<{
    from: string;
    to: string;
  }>;
  /** Function to create dynamic redirects */
  createRedirects?: (existingPath: string) => string[] | undefined;
}

/**
 * Override settings for site behavior
 */
export interface IFLAOverrideOptions {
  /** How to handle broken links */
  onBrokenLinks?: 'ignore' | 'warn' | 'throw';
  /** How to handle broken anchors */
  onBrokenAnchors?: 'ignore' | 'warn' | 'throw';
  /** How to handle broken markdown links */
  onBrokenMarkdownLinks?: 'ignore' | 'warn' | 'throw';
  /** Whether to add trailing slashes */
  trailingSlash?: boolean;
}

/**
 * Pre-built navigation items to prevent configuration contamination
 */
export interface IFLAPrebuiltNavigation {
  standardsDropdownItems: Array<{ label: string; href: string }>;
}

/**
 * Pre-built footer links to prevent configuration contamination  
 */
export interface IFLAPrebuiltFooter {
  docsLinks: Array<{ label: string; to?: string; href?: string }>;
  standardsLinks: Array<{ label: string; href: string }>;
  resourceLinks: Array<{ label: string; to?: string; href?: string }>;
  moreLinks: Array<{ label: string; to?: string; href?: string }>;
}

/**
 * Main options interface for the IFLA preset
 */
export interface IFLAPresetOptions {
  /** Site key identifying which site this is */
  siteKey: SiteKey;
  
  /** Site title */
  title: string;
  
  /** Site tagline/description */
  tagline: string;
  
  /** Site URL (required) */
  url: string;
  
  /** Site base URL (required) */
  baseUrl: string;
  
  /** Project name (defaults to siteKey) */
  projectName?: string;
  
  /** Environment override (auto-detected if not provided) */
  env?: DocsEnv;
  
  /** Vocabulary configuration overrides */
  vocabularyDefaults?: Partial<VocabularyDefaults>;
  
  /** Custom navbar items to add (in addition to standard items) */
  customNavbarItems?: NavbarItem[];
  
  /** Navigation customization options */
  navigation?: IFLANavigationOptions;
  
  /** Footer customization options */
  footer?: IFLAFooterOptions;
  
  /** GitHub edit URL base */
  editUrl?: string;
  
  /** Additional plugins to include */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalPlugins?: any[];
  
  /** Redirect configuration */
  redirects?: IFLARedirectOptions;
  
  /** Override settings */
  overrides?: IFLAOverrideOptions;
  
  /** Whether to use custom sidebar generator */
  customSidebarGenerator?: boolean;
  
  /** i18n configuration overrides */
  i18n?: {
    defaultLocale?: string;
    locales?: string[];
    localeConfigs?: Record<string, { label: string }>;
  };
  
  /** Webpack configuration function */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webpackConfig?: (config: any, isServer: boolean, utils: any) => any;
  
  /** Enable ideal image plugin */
  enableIdealImage?: boolean;
  
  /** Enable live codeblock theme */
  enableLiveCodeblock?: boolean;
  
  /** Enable local search */
  enableLocalSearch?: boolean;
  
  /** Enable mermaid diagrams */
  enableMermaid?: boolean;
  
  /** Docs plugin configuration */
  docsPluginOptions?: {
    showLastUpdateAuthor?: boolean;
    showLastUpdateTime?: boolean;
    versions?: Record<string, {
      label?: string;
      path?: string;
      banner?: string;
    }>;
  };
  
  /** Blog plugin configuration */
  blogPluginOptions?: {
    feedOptions?: {
      type?: 'rss' | 'atom' | 'all';
      xslt?: boolean;
      copyright?: string;
    };
  };
  
  /** Prism theme configuration */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prismTheme?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prismDarkTheme?: any;
}

/**
 * Internal preset context (combines options with Docusaurus context)
 */
export interface IFLAPresetContext {
  options: IFLAPresetOptions;
  context: LoadContext;
  resolvedEnv: DocsEnv;
  siteConfig: {
    url: string;
    baseUrl: string;
  };
}

/**
 * The main preset function signature
 */
export type IFLAPresetFunction = (
  context: LoadContext,
  options: IFLAPresetOptions
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  presets: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  themes: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  themeConfig: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customFields: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};