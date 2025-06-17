# Setting Up a New Standards Site

## Quick Setup Guide

### 1. Add Site to Core Configuration

First, add your new site to the central configuration in `packages/theme/src/config/siteConfigCore.ts`:

```typescript
export const sites = {
  // ... existing sites
  'your-site-key': {
    localhost: { url: 'http://localhost:3000', baseUrl: '/your-site-key/' },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/your-site-key/' },
    production: { url: 'https://iflastandards.info', baseUrl: '/your-site-key/' }
  }
} as const;

// Add to SiteKey type
export type SiteKey = 'portal' | 'ISBDM' | 'LRM' | 'FRBR' | 'isbd' | 'muldicat' | 'unimarc' | 'your-site-key';
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

Create `standards/your-site-key/docusaurus.config.ts` using the factory:

```typescript
import { createStandardSiteConfig } from '@ifla/theme/config';

const config = createStandardSiteConfig({
  siteKey: 'your-site-key',
  title: 'Your Site Title',
  tagline: 'Your site description',
  projectName: 'your-site-key',
  
  // Site-specific vocabulary configuration (optional)
  vocabularyDefaults: {
    prefix: "your-prefix",
    numberPrefix: "T", // or "E", "C", etc.
    profile: "your-values-profile.csv",
    elementDefaults: {
      uri: "https://www.iflastandards.info/YOUR-SITE/elements",
      profile: "your-elements-profile.csv",
    }
  },
  
  // GitHub configuration
  editUrl: 'https://github.com/iflastandards/your-repo/tree/main/',
  
  // Custom navbar items (optional)
  navbar: {
    items: [
      {
        type: 'doc',
        docId: 'intro',
        position: 'left',
        label: 'Introduction',
      },
    ],
  },
  
  // Navigation customization (optional)
  navigation: {
    hideCurrentSiteFromStandardsDropdown: true, // Hide this site from standards dropdown
    standardsDropdownPosition: 'right', // 'left' or 'right'
    includeResourcesDropdown: false, // Remove resources dropdown from navbar
  },

  // Footer customization (optional)
  footer: {
    useResourcesInsteadOfSites: true, // Replace "Sites" with "Resources" in footer
    additionalResourceLinks: [], // Add more resource links later
  },

  // Enable redirects if needed
  redirects: {
    redirects: [],
    createRedirects: (_existingPath: string) => undefined,
  },
});

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
    "start:all": "concurrently \"docusaurus start portal --port 3000\" \"docusaurus start standards/ISBDM --port 3001\" \"docusaurus start standards/LRM --port 3002\" \"docusaurus start standards/fr --port 3003\" \"docusaurus start standards/isbd --port 3004\" \"docusaurus start standards/muldicat --port 3005\" \"docusaurus start standards/unimarc --port 3006\" \"docusaurus start standards/your-site-key --port 3007\""
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

### Custom Vocabulary Configuration

For sites with specific vocabulary requirements:

```typescript
vocabularyDefaults: {
  prefix: "your-prefix",
  startCounter: 1000,
  uriStyle: "numeric", // or "kebab-case"
  numberPrefix: "T", // T, E, C, P, etc.
  caseStyle: "kebab-case", // or "camelCase"
  showFilter: true,
  filterPlaceholder: "Filter vocabulary terms...",
  showTitle: false,
  showURIs: true,
  showCSVErrors: false,
  profile: "your-values-profile.csv",
  profileShapeId: "Concept",
  RDF: {
    "rdf:type": ["skos:ConceptScheme"]
  },
  elementDefaults: {
    uri: "https://www.iflastandards.info/YOUR-SITE/elements",
    classPrefix: "C",
    propertyPrefix: "P",
    profile: "your-elements-profile.csv",
    profileShapeId: "Element",
  }
}
```

### Custom Navigation

For complex navigation requirements:

```typescript
navbar: {
  items: [
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
  ],
}
```

### Custom Redirects

For sites that need URL redirects:

```typescript
redirects: {
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
}
```

### Override Default Settings

For sites that need different behavior:

```typescript
overrides: {
  onBrokenLinks: 'ignore', // 'ignore', 'warn', 'throw'
  onBrokenAnchors: 'ignore',
  trailingSlash: false,
}
```

### Custom Sidebar Generation

For sites with complex sidebar requirements (like ISBDM):

```typescript
// Set customSidebarGenerator: true in factory options
customSidebarGenerator: true,

// Then manually configure in the returned config
if (config.presets && config.presets[0] && Array.isArray(config.presets[0]) && config.presets[0][1]) {
  const presetOptions = config.presets[0][1] as any;
  if (presetOptions.docs) {
    presetOptions.docs.sidebarItemsGenerator = yourCustomSidebarGenerator;
  }
}
```

## Deployment Configuration

### GitHub Pages Deployment

The site will automatically be included in GitHub Pages deployment if:

1. It's added to `siteConfigCore.ts`
2. It has a valid `docusaurus.config.ts`
3. The build script is added to root `package.json`

### Environment-Specific URLs

The factory automatically handles environment-specific URLs:

- **Localhost**: `http://localhost:3000/your-site-key/`
- **Preview**: `https://iflastandards.github.io/standards-dev/your-site-key/`
- **Production**: `https://iflastandards.info/your-site-key/`

## Troubleshooting

### Common Issues

1. **Build Errors**: Ensure `pnpm build:theme` runs successfully first
2. **Import Errors**: Check that `@ifla/theme` is properly installed
3. **Navigation Issues**: Verify `siteKey` matches exactly in `siteConfigCore.ts`
4. **Broken Links**: Use environment-aware URLs, not hardcoded paths

### Testing Checklist

- [ ] Site builds successfully: `pnpm build:your-site-key`
- [ ] Site starts locally: `pnpm start:your-site-key`
- [ ] Navigation works correctly
- [ ] Standards dropdown includes your site
- [ ] Footer links work
- [ ] Theme and styling applied correctly

## Related Files

- **Core Configuration**: `packages/theme/src/config/siteConfigCore.ts`
- **Factory Function**: `packages/theme/src/config/standardSiteFactory.ts`
- **Theme Package**: `packages/theme/`
- **Example Sites**: `standards/lrm/`, `standards/isbdm/`
