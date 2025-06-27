# @ifla/theme
A collection of pure configuration factory functions for Docusaurus sites in the IFLA Standards monorepo. This library provides environment-based configuration capabilities while maintaining Nx caching compatibility.

## Overview

This library provides factory functions that generate configuration objects for various aspects of Docusaurus sites:
- Base configuration (title, URL, etc.)
- Theme configuration (navbar, footer, etc.)
- Plugin configuration (search, image optimization, etc.)
- Preset configuration (classic preset options)
- Environment utilities

All functions are pure and take configuration options as input, returning configuration objects that can be used directly in `docusaurus.config.ts`.

## Installation

This library is internal to the monorepo and available via workspace reference:

```json
{
  "dependencies": {
    "@ifla/shared-config": "workspace:*"
  }
}
```

## Usage

### Environment-Based Configuration

```typescript
// docusaurus.config.ts
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
const environment = getEnvironmentName();
const envFiles = ['.env', `.env.${environment}`, '.env.local'];
for (const file of envFiles) {
  dotenv.config({ path: path.resolve(__dirname, file) });
}

// Validate environment configuration
const envConfig = validateEnvConfig(process.env, 'site-name');

// Create configuration
const config = {
  ...createBaseConfig({
    title: envConfig.SITE_TITLE,
    tagline: envConfig.SITE_TAGLINE,
    url: envConfig.SITE_URL,
    baseUrl: envConfig.SITE_BASE_URL,
    projectName: 'site-name',
  }),
  
  presets: [
    [
      'classic',
      {
        docs: { /* ... */ },
        blog: { /* ... */ },
        theme: { /* ... */ },
      },
    ],
  ],
  
  plugins: [
    ...createIFLAPlugins({
      enableIdealImage: environment === 'production',
      enableLocalSearch: true,
      searchConfig: {
        indexBlog: true,
        language: ['en'],
      },
    }),
  ],
  
  themeConfig: createThemeConfig({
    navbarTitle: envConfig.SITE_TITLE,
    navbarItems: [ /* ... */ ],
    footerLinks: [ /* ... */ ],
  }),
};
```

### Plugin Configuration

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

### Environment Files

Create environment files for different deployment targets:

```bash
# .env - Base configuration
SITE_TITLE=My Site
SITE_TAGLINE=Documentation
GITHUB_REPO_URL=https://github.com/org/repo

# .env.development
SITE_URL=http://localhost:3000
SITE_BASE_URL=/

# .env.production
SITE_URL=https://mysite.com
SITE_BASE_URL=/docs/
```

## API Reference

### Configuration Factories

- `createBaseConfig(options)` - Creates base Docusaurus configuration
- `createThemeConfig(options)` - Creates theme configuration
- `createIFLAPlugins(options)` - Creates array of IFLA standard plugins
- `createPluginConfig(options)` - Creates classic preset plugin configuration

### Environment Utilities

- `getEnvironmentName()` - Returns current environment name based on NODE_ENV
- `validateEnvConfig(env, siteKey)` - Validates required environment variables

### URL Utilities

- `buildSiteUrl(envConfig, path)` - Builds complete URL from environment config
- `getSiteUrl(url, baseUrl, path)` - Helper for URL construction

## Migration from @ifla/preset-ifla

Instead of using the preset:

```typescript
// Old approach
presets: [
  ['classic', { /* ... */ }],
  '@ifla/preset-ifla',
],
```

Use the plugin factory:

```typescript
// New approach
presets: [
  ['classic', { /* ... */ }],
],
plugins: [
  ...createIFLAPlugins({ /* options */ }),
],
```

This provides more flexibility and better environment-based configuration.

## Building

Run `nx build shared-config` to build the library.

## Running unit tests

Run `nx test shared-config` to execute the unit tests via [Vitest](https://vitest.dev/).
