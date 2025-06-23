# IFLA Site Configuration

## Overview

The IFLA Standards project uses a modular configuration approach with the `@ifla/shared-config` package. This provides a collection of pure configuration factory functions for Docusaurus sites in the IFLA Standards monorepo, offering environment-based configuration capabilities while maintaining Nx caching compatibility.

## Basic Usage

```typescript
// docusaurus.config.ts
import * as dotenv from 'dotenv';
import * as path from 'path';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { deepmerge } from 'deepmerge-ts';
import { 
  createBaseConfig, 
  createThemeConfig, 
  createIFLAPlugins, 
  createStandardsPresetConfig,
  createStandardsFooter,
  createStaticDirectories,
  createStandardsNavbar,
  getEnvironmentName, 
  validateEnvConfig 
} from '@ifla/shared-config';
import navbarItems from './navbar';

// Determine environment
const environment = getEnvironmentName();

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
const envConfig = validateEnvConfig(process.env, 'site-name');

const config: Config = deepmerge(
  createBaseConfig({
    title: envConfig.SITE_TITLE,
    tagline: envConfig.SITE_TAGLINE,
    url: envConfig.SITE_URL,
    baseUrl: envConfig.SITE_BASE_URL,
    projectName: 'site-name',
  }),
  {
    // Site-specific overrides
    onBrokenLinks: 'warn' as const,

    // Add future config block for compliance
    future: {
      experimental_faster: false,
      v4: true,
    },

    // Shared static directories for standard sites
    staticDirectories: createStaticDirectories('standard'),

    // Custom fields for site configuration
    customFields: {
      // Current environment for client-side components
      environment,
      // Site-specific vocabulary configuration
      vocabularyDefaults: {
        prefix: envConfig.VOCABULARY_PREFIX!,
        numberPrefix: envConfig.VOCABULARY_NUMBER_PREFIX,
        profile: envConfig.VOCABULARY_PROFILE,
      },
    },

    presets: [
      [
        'classic',
        createStandardsPresetConfig({
          editUrl: envConfig.GITHUB_EDIT_URL!,
          enableBlog: true,
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        }),
      ],
    ],

    plugins: [
      ...createIFLAPlugins({
        // Environment-specific configuration
        enableIdealImage: environment === 'production',
        enableLocalSearch: true,
        searchConfig: {
          indexBlog: true,
          language: ['en'],
        },
        imageConfig: {
          quality: environment === 'production' ? 80 : 70,
          max: 1200,
          steps: environment === 'production' ? 3 : 2,
        },
      }),
    ],

    themeConfig: createThemeConfig({
      navbarTitle: 'Site Name',
      navbarItems: createStandardsNavbar({
        title: 'Site Name',
        customItems: navbarItems,
        includeBlog: true,
        includeVersionDropdown: true,
        includeLocaleDropdown: true,
        includeSearch: true,
      }),
      footerLinks: createStandardsFooter({
        githubUrl: envConfig.GITHUB_REPO_URL!,
      }).links,
      copyright: createStandardsFooter({
        githubUrl: envConfig.GITHUB_REPO_URL!,
      }).copyright,
    }),
  }
);

export default config;
```

## How It Works

The shared-config package provides:
1. **URL Resolution** - Automatic environment-aware URLs (localhost/preview/production)
2. **Vocabulary Defaults** - Pre-configured settings for each standard (ISBDM, LRM, etc.)
3. **Cross-Site Navigation** - Standards dropdown and footer links
4. **Theme Configuration** - IFLA branding, dark mode, announcement bar
5. **Static Assets** - Shared IFLA logo, favicon from theme package
6. **CustomFields** - Proper setup for VocabularyTable and ElementReference components

## Key Functions

- **createBaseConfig(options)** - Creates base Docusaurus configuration
- **createThemeConfig(options)** - Creates theme configuration
- **createIFLAPlugins(options)** - Creates array of IFLA standard plugins
- **createStandardsPresetConfig(options)** - Creates classic preset plugin configuration
- **createStandardsNavbar(options)** - Creates standard navbar with dropdown
- **createStandardsFooter(options)** - Creates standard footer with links
- **createStaticDirectories(type)** - Creates static directories configuration
- **getEnvironmentName()** - Returns current environment name based on NODE_ENV
- **validateEnvConfig(env, siteKey)** - Validates required environment variables

## Environment Configuration

The configuration system uses environment variables for different deployment targets:

```bash
# .env.site - Base configuration
SITE_TITLE=My Site
SITE_TAGLINE=Documentation
GITHUB_REPO_URL=https://github.com/org/repo

# .env.site.development
SITE_URL=http://localhost:3000
SITE_BASE_URL=/

# .env.site.production
SITE_URL=https://mysite.com
SITE_BASE_URL=/docs/
```

## Plugin Configuration

The library provides flexible plugin configuration through `createIFLAPlugins`:

```typescript
// Development configuration
const devPlugins = createIFLAPlugins({
  enableIdealImage: false, // Disable for faster builds
  enableLocalSearch: false, // Disable in development
});

// Production configuration
const prodPlugins = createIFLAPlugins({
  enableIdealImage: true,
  enableLocalSearch: true,
  imageConfig: {
    quality: 80,
    max: 1200,
    steps: 3,
  },
  searchConfig: {
    hashed: true,
    indexBlog: true,
    language: ['en', 'fr'],
  },
});
```

## Troubleshooting

**Module not found error**: Ensure the theme package is built first
**404 for logo/favicon**: Check `staticDirectories` includes theme static folder
**Wrong environment URLs**: Check environment variables in .env files
**Missing customFields**: Ensure using latest shared-config version

## Important Notes

- All configuration functions are pure and stateless
- Each site gets a fresh configuration instance
- No shared state between builds prevents contamination
- Environment variables control deployment-specific settings
