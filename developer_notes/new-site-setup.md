# Setting Up a New Standards Site

## Quick Setup Guide

### 1. Add Site to Core Configuration

First, add your new site to the central configuration in `libs/shared-config/src/lib/siteConfig.ts`:

```typescript
export const SITE_CONFIG: Record<SiteKey, Record<Environment, SiteConfigEntry>> = {
  // ... existing sites
  'your-site-key': {
    local: { url: 'http://localhost:3007', baseUrl: '/', port: 3007 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/your-site-key/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/your-site-key/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/your-site-key/' },
  },
} as const;

// The SiteKey type is automatically derived from SITE_CONFIG
export type SiteKey = keyof typeof SITE_CONFIG;
```

### 2. Create Site Directory Structure

```bash
mkdir standards/your-site-key
cd standards/your-site-key

# Create required files
touch docusaurus.config.ts
touch sidebars.ts
touch package.json
mkdir -p src/css
mkdir -p docs
mkdir -p blog
mkdir static
```

### 3. Create Package Configuration

Create `standards/your-site-key/package.json`:

```json
{
  "name": "@ifla/site-your-site-key",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "docusaurus": "docusaurus",
    "start": "docusaurus start",
    "build": "docusaurus build",
    "swizzle": "docusaurus swizzle",
    "deploy": "docusaurus deploy",
    "clear": "docusaurus clear",
    "serve": "docusaurus serve",
    "write-translations": "docusaurus write-translations",
    "write-heading-ids": "docusaurus write-heading-ids"
  },
  "dependencies": {
    "@ifla/theme": "workspace:*"
  },
  "browserslist": {
    "production": [
      ">0.5%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

### 4. Create Docusaurus Configuration

Create `standards/your-site-key/docusaurus.config.ts` using the centralized configuration:

```typescript
import type { Config } from '@docusaurus/types';
import type { Preset } from '@docusaurus/preset-classic';
import { themes as prismThemes } from 'prism-react-renderer';
import { getSiteConfig, mapDocsEnvToEnvironment, type SiteKey } from '@ifla/shared-config';

const currentEnv = mapDocsEnvToEnvironment(process.env.DOCS_ENV);
const siteConfig = getSiteConfig('your-site-key', currentEnv);

const config: Config = {
  title: 'Your Site Title',
  tagline: 'Your site description',
  favicon: '/img/favicon.ico',
  url: siteConfig.url,
  baseUrl: siteConfig.baseUrl,
  
  // Repository settings
  organizationName: 'iflastandards',
  projectName: 'standards-dev',
  
  // Build settings
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  onBrokenAnchors: 'warn',
  onDuplicateRoutes: 'warn',
  trailingSlash: false,
  
  // Internationalization
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Custom fields for client-side access
  customFields: {
    environment: currentEnv,
    docsEnv: currentEnv,
    siteConfig: (toSiteKey: SiteKey) => getSiteConfig(toSiteKey, currentEnv),
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/iflastandards/standards-dev/tree/main/standards/your-site-key/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/iflastandards/standards-dev/tree/main/standards/your-site-key/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  // Theme configuration
  themeConfig: {
    // Navigation bar
    navbar: {
      title: 'Your Site Title',
      logo: {
        alt: 'IFLA Logo',
        src: 'img/logo-ifla_black.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          to: '/blog',
          label: 'Blog',
          position: 'left'
        },
        // Standard IFLA navigation items will be added here
      ],
    },
    
    // Footer
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} IFLA. Built with Docusaurus.`,
    },
    
    // Code highlighting
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
```

### 5. Create Sidebar Configuration

Create `standards/your-site-key/sidebars.ts`:

```typescript
import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-page'],
    },
  ],
};

export default sidebars;
```

### 6. Create CSS File

Create `standards/your-site-key/src/css/custom.css`:

```css
/**
 * Any CSS included here will be global. The classic template
 * bundles Infima by default. Infima is a CSS framework designed to
 * work well for content-centric websites.
 */

/* You can override the default Infima variables here. */
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

/* For readability concerns, you should choose a lighter palette in dark mode. */
[data-theme='dark'] {
  --ifla-primary: #4da6ff;
  --ifla-primary-dark: #1a8cff;
  --ifla-primary-darker: #0080ff;
  --ifla-primary-darkest: #0066cc;
  --ifla-primary-light: #66b3ff;
  --ifla-primary-lighter: #80c0ff;
  --ifla-primary-lightest: #b3d9ff;
  --docusaurus-highlighted-code-line-bg: rgba(0, 0, 0, 0.3);
}
```

### 7. Create Initial Content

Create `standards/your-site-key/docs/intro.md`:

```markdown
---
sidebar_position: 1
---

# Introduction

Welcome to **Your Site Title**.

This is the introduction page for your IFLA standard.

## Getting Started

Get started by exploring the documentation.
```

### 8. Add Build Scripts

Add to root `package.json` scripts section (use next available port):

```json
{
  "scripts": {
    "build:your-site-key": "docusaurus build standards/your-site-key",
    "start:your-site-key": "docusaurus start standards/your-site-key --port 3007"
  }
}
```

**Current port assignments:**
- Portal: 3000, ISBDM: 3001, LRM: 3002, fr: 3003, isbd: 3004, muldicat: 3005, unimarc: 3006
- **Next available port: 3007**

**Also update the concurrent scripts:**
- Add your site to `build:all` script
- Add your site to `start:all` script

### 9. Update Concurrent Scripts

Update the `build:all` and `start:all` scripts in root `package.json`:

```json
{
  "scripts": {
    "build:all": "concurrently \"pnpm run build:portal\" \"pnpm run build:isbdm\" \"pnpm run build:lrm\" \"pnpm run build:fr\" \"pnpm run build:isbd\" \"pnpm run build:muldicat\" \"pnpm run build:unimarc\" \"pnpm run build:your-site-key\" \"pnpm run build:theme\"",
    "start:all": "concurrently \"docusaurus start portal --port 3000\" \"docusaurus start standards/ISBDM --port 3001\" \"docusaurus start standards/LRM --port 3002\" \"docusaurus start standards/FR --port 3003\" \"docusaurus start standards/isbd --port 3004\" \"docusaurus start standards/muldicat --port 3005\" \"docusaurus start standards/unimarc --port 3006\" \"docusaurus start standards/your-site-key --port 3007\""
  }
}
```

### 10. Test Your Site

```bash
# Install dependencies
pnpm install

# Build the theme
pnpm build:theme

# Test your site
pnpm start:your-site-key

# Or test all sites
pnpm start:all

# Build your site
pnpm build:your-site-key

# Or build all sites
pnpm build:all
```

## Advanced Configuration Options

### Custom Navigation

For complex navigation requirements, add items to the navbar:

```typescript
// In the themeConfig.navbar.items array
{
  type: 'dropdown',
  label: 'Instructions',
  position: 'left',
  items: [
    {
      type: 'doc',
      docId: 'intro/index',
      label: 'Introduction',
    },
    {
      type: 'doc',
      docId: 'guidelines/index',
      label: 'Guidelines',
    },
  ],
},
{
  type: 'dropdown',
  label: 'Elements',
  position: 'left',
  items: [
    {
      type: 'doc',
      docId: 'elements/classes',
      label: 'Classes',
    },
    {
      type: 'doc',
      docId: 'elements/properties',
      label: 'Properties',
    },
  ],
},
```

### Custom Plugins

Add site-specific plugins to the plugins array:

```typescript
// In the main config object
plugins: [
  [
    '@docusaurus/plugin-client-redirects',
    {
      redirects: [
        {
          from: '/old-path',
          to: '/new-path',
        },
      ],
      createRedirects: (existingPath: string) => {
        // Dynamic redirect logic
        if (existingPath.includes('/elements/')) {
          return [existingPath.replace('/elements/', '/old-elements/')];
        }
        return undefined;
      },
    },
  ],
],
```

### Override Build Settings

For sites that need different behavior:

```typescript
// In the main config object
onBrokenLinks: 'ignore', // 'ignore', 'warn', 'throw'
onBrokenAnchors: 'ignore',
trailingSlash: false,
```

### Custom Vocabulary Configuration

For sites with vocabulary requirements, add to customFields:

```typescript
// In the customFields object
vocabularyDefaults: {
  prefix: "your-prefix",
  numberPrefix: "T", // T, E, C, P, etc.
  profile: "your-values-profile.csv",
  uri: "https://www.iflastandards.info/YOUR-SITE/elements",
},
```

## Deployment Configuration

### GitHub Pages Deployment

The site will automatically be included in GitHub Pages deployment if:

1. It's added to `SITE_CONFIG` in `libs/shared-config/src/lib/siteConfig.ts`
2. It has a valid `docusaurus.config.ts` using the siteConfig utilities
3. The build script is added to root `package.json`

### Environment-Specific URLs

The centralized configuration automatically handles environment-specific URLs:

- **Local**: `http://localhost:300X/` (port varies by site)
- **Preview**: `https://iflastandards.github.io/standards-dev/your-site-key/`
- **Development**: `https://jonphipps.github.io/standards-dev/your-site-key/`
- **Production**: `https://www.iflastandards.info/your-site-key/`

## Troubleshooting

### Common Issues

1. **Build Errors**: Ensure `@ifla/shared-config` is properly installed
2. **Import Errors**: Check that imports from `@ifla/shared-config` are correct
3. **Navigation Issues**: Verify `siteKey` matches exactly in `SITE_CONFIG`
4. **TypeScript Errors**: Ensure the site key is added to the configuration matrix
5. **Broken Links**: Use `SiteLink` component for cross-site navigation

### Testing Checklist

- [ ] Site builds successfully: `pnpm build:your-site-key`
- [ ] Site starts locally: `pnpm start:your-site-key`
- [ ] Navigation works correctly
- [ ] Cross-site links work with SiteLink component
- [ ] Environment URLs are correct for all environments
- [ ] Site configuration is accessible via customFields

## Related Files

- **Core Configuration**: `libs/shared-config/src/lib/siteConfig.ts`
- **Configuration Tests**: `packages/theme/src/tests/config/siteConfig.test.ts`
- **SiteLink Component**: `packages/theme/src/components/SiteLink.tsx`
- **Example Sites**: `standards/LRM/`, `standards/ISBDM/`, `portal/`
