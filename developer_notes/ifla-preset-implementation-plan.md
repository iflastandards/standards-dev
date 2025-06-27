# IFLA Shared Configuration Implementation

## Overview
The IFLA Standards project has transitioned from the preset-based approach to a modular configuration system using the `@ifla/shared-config` package. This provides pure configuration factory functions for Docusaurus sites while maintaining Nx caching compatibility.

## Current Architecture
The `@ifla/shared-config` package provides:
- Pure factory functions for configuration objects
- Environment-based configuration capabilities
- Consistent site configuration across all standards
- Prevention of Node.js module caching contamination

## Key Components

### Configuration Factories
- **createBaseConfig**: Creates base Docusaurus configuration
- **createThemeConfig**: Creates theme configuration
- **createIFLAPlugins**: Creates array of IFLA standard plugins
- **createStandardsPresetConfig**: Creates classic preset plugin configuration
- **createStandardsNavbar**: Creates standard navbar with dropdown
- **createStandardsFooter**: Creates standard footer with links
- **createStaticDirectories**: Creates static directories configuration

### Environment Utilities
- **getEnvironmentName**: Returns current environment name based on NODE_ENV
- **validateEnvConfig**: Validates required environment variables
- **buildSiteUrl**: Builds complete URL from environment config
- **getSiteUrl**: Helper for URL construction

## Site Configuration Example

```typescript
// standards/LRM/docusaurus.config.ts
import * as dotenv from 'dotenv';
import * as path from 'path';
import type { Config } from '@docusaurus/types';
import { deepmerge } from 'deepmerge-ts';
import { 
  createBaseConfig, 
  createThemeConfig, 
  createIFLAPlugins, 
  createStandardsPresetConfig,
  createStandardsFooter,
  createStandardsNavbar,
  getEnvironmentName, 
  validateEnvConfig 
} from '@ifla/shared-config.old';
import navbarItems from './navbar';

// Determine environment
const environment = getEnvironmentName();

// Load environment variables
const envFiles = ['.env.site', `.env.site.${environment}`, '.env.site.local'];
for (const file of envFiles) {
  dotenv.config({ path: path.resolve(__dirname, file) });
}

// Validate environment configuration
const envConfig = validateEnvConfig(process.env, 'LRM');

const config: Config = deepmerge(
  createBaseConfig({
    title: envConfig.SITE_TITLE,
    tagline: envConfig.SITE_TAGLINE,
    url: envConfig.SITE_URL,
    baseUrl: envConfig.SITE_BASE_URL,
    projectName: 'LRM',
  }),
  {
    // Site-specific configuration
    customFields: {
      environment,
      vocabularyDefaults: {
        prefix: "lrm",
        numberPrefix: "E",
      },
    },

    presets: [
      [
        'classic',
        createStandardsPresetConfig({
          editUrl: envConfig.GITHUB_EDIT_URL!,
          enableBlog: true,
        }),
      ],
    ],

    plugins: [
      ...createIFLAPlugins({
        enableIdealImage: environment === 'production',
        enableLocalSearch: true,
      }),
    ],

    themeConfig: createThemeConfig({
      navbarTitle: 'IFLA LRM',
      navbarItems: createStandardsNavbar({
        title: 'LRM',
        customItems: navbarItems,
      }),
      footerLinks: createStandardsFooter({
        githubUrl: envConfig.GITHUB_REPO_URL!,
      }).links,
    }),
  }
);

export default config;
```

## Component Compatibility
The shared-config package maintains compatibility with all existing components:

```typescript
const { siteConfig } = useDocusaurusContext();
const defaults = siteConfig.customFields?.vocabularyDefaults as VocabularyDefaults;
```

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

## Success Criteria
1. ✅ Modular configuration with pure functions
2. ✅ No cross-site contamination when building multiple sites
3. ✅ All shared components work via `useDocusaurusContext()`
4. ✅ Standard Docusaurus architecture
5. ✅ Scripts and central configuration work correctly
6. ✅ Cross-site navigation functions correctly

## Related Files
- `libs/shared-config/src/index.ts` (main exports)
- `libs/shared-config/src/lib/createBaseConfig.ts` (base configuration)
- `libs/shared-config/src/lib/createThemeConfig.ts` (theme configuration)
- `libs/shared-config/src/lib/createPresetConfig.ts` (plugin configuration)
- `libs/shared-config/src/lib/utils/getSiteUrl.ts` (URL utilities)
- `packages/theme/src/config/siteConfigCore.ts` (central site configuration)
- `standards/*/docusaurus.config.ts` (site-specific configurations)

## Notes
- All configuration functions are pure and stateless
- Each site gets a fresh configuration instance
- No shared state between builds prevents contamination
- Environment variables control deployment-specific settings
