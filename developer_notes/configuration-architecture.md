# Configuration Architecture (Updated December 2024)

> **Note**: This document has been updated to reflect the new centralized configuration system implemented in December 2024. The previous environment file-based system has been replaced.

## Overview

The IFLA Standards project uses a centralized configuration architecture that ensures consistency across all sites while allowing for site-specific customizations. As of December 2024, this uses a TypeScript configuration matrix instead of environment files.

## Core Configuration (Current System)

### `libs/shared-config/src/lib/siteConfig.ts`
**Single source of truth for all site paths and environments**

```typescript
export const SITE_CONFIG: Record<SiteKey, Record<Environment, SiteConfigEntry>> = {
  portal: {
    local: { url: 'http://localhost:3000', baseUrl: '/', port: 3000 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/' },
  },
  ISBDM: {
    local: { url: 'http://localhost:3001', baseUrl: '/', port: 3001 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/ISBDM/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/ISBDM/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/ISBDM/' },
  },
  // ... other sites
} as const;

export type SiteKey = keyof typeof SITE_CONFIG;
export type Environment = 'local' | 'preview' | 'development' | 'production';
```

**Used by:**
- All docusaurus.config.ts files
- Cross-site navigation components
- Build and validation scripts
- Environment detection utilities

### Core Functions

```typescript
// Get configuration for a specific site and environment
export function getSiteConfig(siteKey: SiteKey, environment: Environment): SiteConfigEntry

// Generate full URLs for cross-site navigation  
export function getSiteUrl(siteKey: SiteKey, path: string, environment: Environment): string

// Map DOCS_ENV values to Environment types
export function mapDocsEnvToEnvironment(docsEnv?: string): Environment
```

## Configuration Flow (Current)

```mermaid
graph TD
    A[libs/shared-config/src/lib/siteConfig.ts] --> B[getSiteConfig()]
    A --> C[getSiteUrl()]
    A --> D[mapDocsEnvToEnvironment()]
    B --> E[Site Configs]
    C --> E
    D --> E
    E --> F[Built Sites]
```

1. **siteConfig.ts** defines all sites and environments in a TypeScript matrix
2. **getSiteConfig()** provides configuration for specific site/environment combinations
3. **getSiteUrl()** generates URLs for cross-site navigation
4. **mapDocsEnvToEnvironment()** maps DOCS_ENV to internal environment types
5. Individual sites use these utilities in their docusaurus.config.ts files

## Site Types

### Standards Sites (Use Shared Configuration)
- **Purpose**: Documentation for IFLA standards
- **Configuration**: Use centralized siteConfig functions
- **Features**: Consistent URL patterns, environment-aware navigation
- **Examples**: LRM, ISBDM, FRBR, isbd, muldicat, unimarc

### Portal Site (Custom Configuration)
- **Purpose**: Gateway for consumers + workplace for editors
- **Configuration**: Custom `docusaurus.config.ts` using siteConfig utilities
- **Features**: Management tools, standards overview, unique navigation
- **Justification**: Unique requirements warrant custom configuration

## Environment Handling

### URL Generation
All sites automatically get environment-appropriate URLs:

- **Local**: `http://localhost:300X/` (port varies by site)
- **Preview**: `https://iflastandards.github.io/standards-dev/site-key/`
- **Development**: `https://jonphipps.github.io/standards-dev/site-key/`
- **Production**: `https://www.iflastandards.info/site-key/`

### Environment Detection
```typescript
const currentEnv = mapDocsEnvToEnvironment(process.env.DOCS_ENV);
// Automatically maps DOCS_ENV values to internal Environment types
```

### Cross-Site Navigation
```typescript
// Always use getSiteUrl for cross-site links
const portalUrl = getSiteUrl('portal', '/', currentEnv);
const lrmUrl = getSiteUrl('LRM', '/docs/intro', currentEnv);
```

## Inter-Site Navigation

### SiteLink Component
```tsx
import SiteLink from '@ifla/theme/components/SiteLink';

<SiteLink siteKey="LRM" path="/docs/introduction">
  View LRM Documentation
</SiteLink>
```

The component automatically:
- Uses the correct environment-specific URLs
- Opens external links in new tabs
- Handles path normalization
- Provides type safety for site keys

## Migration from Old System (December 2024)

### What Was Removed
- **36+ .env files** across all sites (`.env.site.local`, `.env.site.preview`, etc.)
- **siteConfigCore.ts** with environment detection logic
- **standardSiteFactory.ts** factory function
- **Environment variable loading** in docusaurus.config.ts files

### What Was Added
- **Centralized configuration matrix** in `libs/shared-config/src/lib/siteConfig.ts`
- **Type-safe site keys and environments**
- **Simplified URL generation functions**
- **Updated SiteLink component** with new prop names

### Benefits of New System
- **Single source of truth** for all site configuration
- **Type safety** with compile-time validation
- **Reduced complexity** - no environment file management
- **Better maintainability** - all URLs in one location
- **Easier debugging** - all configuration visible in one place
- **No cross-contamination** between environments

## Adding New Sites (Current Process)

### 1. Add to Configuration Matrix
```typescript
// In libs/shared-config.old/src/lib/siteConfig.ts
export const SITE_CONFIG = {
  // ... existing sites
  'new-site': {
    local: { url: 'http://localhost:3007', baseUrl: '/', port: 3007 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/new-site/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/new-site/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/new-site/' },
  },
} as const;
```

### 2. Use in docusaurus.config.ts
```typescript
import { getSiteConfig, mapDocsEnvToEnvironment } from '@ifla/shared-config.old';

const currentEnv = mapDocsEnvToEnvironment(process.env.DOCS_ENV);
const siteConfig = getSiteConfig('new-site', currentEnv);

export default {
  url: siteConfig.url,
  baseUrl: siteConfig.baseUrl,
  customFields: {
    siteConfig: (toSiteKey: SiteKey) => getSiteConfig(toSiteKey, currentEnv),
  },
  // ... rest of configuration
};
```

## Build Integration

### Package Scripts
Each site gets build scripts in root `package.json`:

```json
{
  "scripts": {
    "build:site-key": "docusaurus build standards/site-key",
    "start:site-key": "docusaurus start standards/site-key --port 3001"
  }
}
```

### GitHub Actions
Sites are automatically included in deployment workflows when:
1. Added to `SITE_CONFIG` in siteConfig.ts
2. Have valid `docusaurus.config.ts` using siteConfig utilities
3. Build script exists in root `package.json`

## Best Practices

### DO
- Use the centralized configuration matrix for all sites
- Use `getSiteConfig()` and `getSiteUrl()` for URL generation
- Use `SiteLink` component for cross-site navigation
- Test in all environments (local, preview, development, production)
- Keep site metadata (title, tagline) in docusaurus.config.ts files

### DON'T
- Hardcode URLs or base paths anywhere
- Create environment files for site configuration
- Use deprecated environment variable patterns
- Skip environment testing
- Modify the configuration matrix without updating TypeScript types

## Troubleshooting

### Common Issues
1. **TypeScript errors**: Ensure site key exists in SITE_CONFIG and SiteKey type
2. **URL issues**: Check `siteKey` matches configuration exactly (case-sensitive)
3. **Navigation issues**: Verify environment detection is working correctly
4. **Build failures**: Check for TypeScript errors in configuration usage

### Debug Environment Detection
```typescript
import { mapDocsEnvToEnvironment } from '@ifla/shared-config.old';
console.log('Current environment:', mapDocsEnvToEnvironment(process.env.DOCS_ENV));
```

### Debug URL Generation
```typescript
import { getSiteUrl } from '@ifla/shared-config.old';
console.log('Portal URL:', getSiteUrl('portal', '/docs/intro', 'local'));
```

## Related Documentation

- **[Site Configuration Architecture](site-configuration-architecture.md)** - Complete current documentation
- **[New Site Setup](new-site-setup.md)** - Needs updating for new system
- **[Testing Guide](../TESTING.md)** - Automated testing overview
