// TypeScript interfaces for shared configuration

export interface BaseConfigOptions {
  title: string;
  tagline: string;
  url: string;
  baseUrl: string;
  projectName: string;
}

export interface ThemeConfigOptions {
  navbarTitle: string;
  navbarItems?: readonly any[];
  footerLinks?: readonly any[];
  copyright?: string;
}

export interface PluginConfigOptions {
  docsPath?: string;
  editUrl?: string;
  showReadingTime?: boolean;
  customCss?: string;
}

export interface FooterConfigOptions {
  links?: any[];
  copyright?: string;
}

export interface EnvConfig {
  SITE_URL: string;
  SITE_BASE_URL: string;
  SITE_PORT?: string;
  SITE_TITLE: string;
  SITE_TAGLINE: string;
  GITHUB_EDIT_URL?: string;
  GITHUB_REPO_URL?: string;
  VOCABULARY_PREFIX?: string;
  VOCABULARY_NUMBER_PREFIX?: string;
  VOCABULARY_URI?: string;
  VOCABULARY_CLASS_PREFIX?: string;
  VOCABULARY_PROPERTY_PREFIX?: string;
  [key: string]: string | undefined;
}