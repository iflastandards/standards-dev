#!/usr/bin/env tsx
/**
 * Site Template Generator for IFLA Standards
 * 
 * This creates a complete, working site template that combines:
 * - Fresh Docusaurus v3.8 structure (clean baseline)
 * - ISBDM's proven configuration (works without contamination)  
 * - Simplified setup (easier to scaffold)
 * 
 * The template can work with either:
 * 1. Individual configs (completely isolated)
 * 2. Shared-config (with isolated build process)
 */

export interface SiteTemplateConfig {
  // Required basic info
  siteKey: string;
  title: string;
  tagline: string;
  
  // Port assignment (auto-assigned if not provided)
  port?: number;
  
  // GitHub configuration
  organizationName?: string;
  projectName?: string;
  editUrl?: string;
  
  // Vocabulary configuration (optional)
  vocabulary?: {
    prefix: string;
    numberPrefix: string;
    profile: string;
    elementUri?: string;
    elementProfile?: string;
  };
  
  // Navigation customization
  navbar?: {
    customItems?: any[];
    includeBlog?: boolean;
    includeVersionDropdown?: boolean;
    includeLocaleDropdown?: boolean;
    includeSearch?: boolean;
  };
  
  // Feature flags
  features?: {
    enableBlog?: boolean;
    enableSearch?: boolean;
    enableRedirects?: boolean;
    enableRdfDownloads?: boolean;
  };
  
  // Build configuration
  buildConfig?: {
    onBrokenLinks?: 'throw' | 'warn' | 'ignore';
    onBrokenAnchors?: 'throw' | 'warn' | 'ignore';
  };
}

export const SITE_TEMPLATE = {
  // NX project.json template
  projectJsonTemplate: (config: SiteTemplateConfig) => `{
  "name": "${config.siteKey.toLowerCase()}",
  "root": "standards/${config.siteKey}",
  "sourceRoot": "standards/${config.siteKey}",
  "projectType": "application",
  "tags": ["docusaurus", "site", "standard", "${config.siteKey.toLowerCase()}"],
  "implicitDependencies": ["@ifla/theme"],
  "targets": {
    "build": {
      "executor": "nx:run-commands",
      "options": {
        "command": "docusaurus build standards/${config.siteKey}"
      },
      "outputs": ["{projectRoot}/build"],
      "cache": true,
      "dependsOn": [
        "^build",
        {
          "target": "build",
          "projects": ["@ifla/theme"]
        }
      ],
      "inputs": ["production", "^production", "docusaurus"]
    },
    "start": {
      "executor": "nx:run-commands",
      "options": {
        "command": "docusaurus start standards/${config.siteKey} --port ${config.port || 3007}"
      },
      "cache": false
    },
    "serve": {
      "executor": "nx:run-commands",
      "options": {
        "command": "docusaurus serve standards/${config.siteKey} --port ${config.port || 3007}"
      },
      "cache": false
    },
    "clear": {
      "executor": "nx:run-commands",
      "options": {
        "command": "docusaurus clear standards/${config.siteKey}"
      },
      "cache": false
    },
    "e2e": {
      "executor": "nx:run-commands",
      "options": {
        "command": "playwright test e2e/standards-smoke.spec.ts e2e/vocabulary-functionality.spec.ts"
      },
      "dependsOn": ["build"],
      "cache": true,
      "inputs": [
        "default",
        "{workspaceRoot}/e2e/standards-smoke.spec.ts",
        "{workspaceRoot}/e2e/vocabulary-functionality.spec.ts",
        "{workspaceRoot}/playwright.config.ts"
      ],
      "outputs": [
        "{workspaceRoot}/test-results",
        "{workspaceRoot}/playwright-report"
      ]
    }
  }
}`,

  // Individual docusaurus.config.ts template (based on clean Docusaurus + old ISBDM)
  individualConfigTemplate: (config: SiteTemplateConfig) => `import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  future: {
    v4: true,
  },
  title: '${config.title}',
  tagline: '${config.tagline}',
  favicon: 'img/favicon.ico',

  // Environment-specific URLs will be set by environment variables
  url: process.env.SITE_URL || 'http://localhost:${config.port || 3000}',
  baseUrl: process.env.BASE_URL || '/${config.siteKey}/',

  organizationName: '${config.organizationName || 'iflastandards'}',
  projectName: '${config.projectName || config.siteKey}',

  onBrokenLinks: '${config.buildConfig?.onBrokenLinks || 'warn'}',
  onBrokenMarkdownLinks: 'warn',

  // Shared static directories
  staticDirectories: ['static', '../../packages/theme/static'],

  ${config.vocabulary ? `customFields: {
    vocabularyDefaults: {
      prefix: "${config.vocabulary.prefix}",
      startCounter: 1000,
      uriStyle: "numeric",
      numberPrefix: "${config.vocabulary.numberPrefix}",
      caseStyle: "kebab-case",
      showFilter: true,
      filterPlaceholder: "Filter vocabulary terms...",
      showTitle: false,
      showURIs: true,
      showCSVErrors: false,
      profile: "${config.vocabulary.profile}",
      profileShapeId: "Concept",
      RDF: {
        "rdf:type": ["skos:ConceptScheme"]
      },
      elementDefaults: {
        uri: "${config.vocabulary.elementUri || `https://www.iflastandards.info/${config.siteKey.toUpperCase()}/elements`}",
        classPrefix: "C",
        propertyPrefix: "P",
        profile: "${config.vocabulary.elementProfile || `${config.vocabulary.prefix}-elements-profile.csv`}",
        profileShapeId: "Element",
      }
    }
  },` : ''}

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
    ${config.features?.enableSearch !== false ? `[
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexBlog: ${config.features?.enableBlog !== false},
      },
    ],` : ''}
    ${config.features?.enableRedirects ? `[
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [],
        createRedirects: (existingPath: string) => {
          // Add custom redirect logic here
          return undefined;
        },
      },
    ],` : ''}
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: '${config.editUrl || `https://github.com/iflastandards/standards-dev/tree/main/standards/${config.siteKey}/`}',
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
        ${config.features?.enableBlog !== false ? `blog: {
          showReadingTime: true,
          editUrl: '${config.editUrl || `https://github.com/iflastandards/standards-dev/tree/main/standards/${config.siteKey}/`}',
          feedOptions: {
            type: 'all',
            title: '${config.title} Blog',
            description: 'Updates and news about ${config.title}',
            copyright: \`Copyright © \${new Date().getFullYear()} IFLA.\`,
            language: 'en',
          },
        },` : ''}
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
      title: '${config.siteKey}',
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
        ${config.features?.enableBlog ? `{to: '/blog', label: 'Blog', position: 'right'},` : ''}
        ${config.navbar?.includeVersionDropdown ? `{
          type: 'docsVersionDropdown',
          position: 'right',
        },` : ''}
        ${config.navbar?.includeLocaleDropdown ? `{
          type: 'localeDropdown',
          position: 'right',
        },` : ''}
        ${config.navbar?.includeSearch ? `{
          type: 'search',
          position: 'right',
        },` : ''}
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Resources',
          items: [
            ${config.features?.enableRdfDownloads !== false ? `{
              label: 'RDF Downloads',
              to: '/rdf/',
            },` : ''}
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
              href: '/',
            },
            {
              label: 'GitHub',
              href: '${config.editUrl || 'https://github.com/iflastandards/standards-dev'}',
            },
          ],
        },
      ],
      copyright: \`
      Copyright © \${new Date().getFullYear()} International Federation of Library Associations and Institutions (IFLA)<br />
      <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">
        <img src="img/cc0_by.png" alt="CC BY 4.0" style="vertical-align:middle; height:24px;" />
      </a>
      Gordon Dunsire and Mirna Willer (Main design and content editors).
    \`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;`,

  // Basic navbar template
  navbarTemplate: (config: SiteTemplateConfig) => `// ${config.siteKey} navbar configuration
export default [
  {
    type: 'doc',
    docId: 'intro',
    position: 'left' as const,
    label: 'Introduction',
  },
];`,

  // Basic sidebars template
  sidebarsTemplate: () => `import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: ['getting-started/overview'],
    },
  ],
};

export default sidebars;`,

  // Custom CSS template
  customCssTemplate: (config: SiteTemplateConfig) => `/**
 * ${config.title} Custom Styles
 * Any CSS included here will be global.
 */

/* IFLA brand colors */
:root {
  --ifla-primary: #0066cc;
  --ifla-primary-dark: #0052a3;
  --ifla-primary-darker: #004d99;
  --ifla-primary-darkest: #003d7a;
  --ifla-primary-light: #1a75d1;
  --ifla-primary-lighter: #3385d6;
  --ifla-primary-lightest: #66a3e0;
  --docusaurus-highlighted-code-line-bg: rgba(0, 0, 0, 0.1);
}

/* Dark mode adjustments */
[data-theme='dark'] {
  --ifla-primary: #4da6ff;
  --ifla-primary-dark: #1a8cff;
  --ifla-primary-darker: #0080ff;
  --ifla-primary-darkest: #0066cc;
  --ifla-primary-light: #66b3ff;
  --ifla-primary-lighter: #80c0ff;
  --ifla-primary-lightest: #b3d9ff;
  --docusaurus-highlighted-code-line-bg: rgba(0, 0, 0, 0.3);
}`,

  // Intro documentation template
  introDocTemplate: (config: SiteTemplateConfig) => `---
sidebar_position: 1
---

# Introduction

Welcome to **${config.title}**.

${config.tagline}

## Getting Started

Get started by exploring the documentation and resources available for this standard.

### What you'll find here

- Comprehensive documentation
- Implementation guidelines
- Examples and best practices
- Community resources

## About This Standard

This site provides the complete specification and supporting materials for ${config.title}.

For more information about IFLA standards, visit the [IFLA Standards Portal](/).`,

  // Blog welcome post template
  blogWelcomeTemplate: (config: SiteTemplateConfig) => `---
slug: welcome-to-${config.siteKey.toLowerCase()}-blog
title: Welcome to the ${config.title} Blog
authors: [site_admin]
tags: [announcement, blog, ${config.siteKey.toLowerCase()}]
date: ${new Date().toISOString().split('T')[0]}
---

Welcome to the ${config.title} blog! This is where we'll share updates and announcements related to ${config.tagline.toLowerCase()}.

<!-- truncate -->

## About ${config.title}

${config.title} ${config.tagline.toLowerCase()}, providing essential guidance for libraries and information professionals worldwide.

## What to Expect

This blog will keep you informed about:

- **Standard updates** - Revisions to ${config.siteKey} rules and guidelines  
- **Implementation guidance** - Examples and best practices
- **International developments** - Global adoption and feedback
- **Documentation enhancements** - Improved explanations and resources

## Building Standards Together

${config.title} continues to evolve to meet the needs of modern libraries and information systems. This blog will highlight ongoing developments and community contributions.

## Automated Communications

Future blog posts will be automatically generated as part of our release workflow, ensuring timely notification of all ${config.title} updates and improvements.

Thank you for your commitment to international library standardization!`,

  // Blog authors template
  blogAuthorsTemplate: (config: SiteTemplateConfig) => `site_admin:
  name: Site Admin
  title: ${config.title} Site Administrator
  url: https://www.iflastandards.info/
  image_url: https://www.ifla.org/wp-content/uploads/2019/05/cropped-ifla-favicon-192x192.png`,

  // Basic getting started doc
  gettingStartedTemplate: (config: SiteTemplateConfig) => `---
sidebar_position: 1
---

# Overview

This section provides an overview of ${config.title}.

## Purpose

${config.title} serves to...

## Scope

This standard covers...

## How to Use This Documentation

Navigate through the sections to find:
- Detailed specifications
- Implementation guidance
- Examples and use cases`,

};

// Default configurations for different types of sites
export const SITE_PRESETS = {
  // Standard IFLA site with all features
  standard: (siteKey: string, title: string, tagline: string): SiteTemplateConfig => ({
    siteKey,
    title,
    tagline,
    features: {
      enableBlog: true,
      enableSearch: true,
      enableRdfDownloads: true,
      enableRedirects: false,
    },
    navbar: {
      includeBlog: true,
      includeVersionDropdown: true,
      includeLocaleDropdown: true,
      includeSearch: true,
    },
    buildConfig: {
      onBrokenLinks: 'warn',
      onBrokenAnchors: 'warn',
    },
  }),

  // Minimal site (no blog, basic features)
  minimal: (siteKey: string, title: string, tagline: string): SiteTemplateConfig => ({
    siteKey,
    title,
    tagline,
    features: {
      enableBlog: false,
      enableSearch: true,
      enableRdfDownloads: false,
      enableRedirects: false,
    },
    navbar: {
      includeBlog: false,
      includeVersionDropdown: false,
      includeLocaleDropdown: false,
      includeSearch: true,
    },
    buildConfig: {
      onBrokenLinks: 'warn',
      onBrokenAnchors: 'warn',
    },
  }),

};

export default SITE_TEMPLATE;
