# Site Configuration Architecture

## Overview

The IFLA Standards project uses a centralized site configuration system that replaced the previous environment file-based approach in December 2024. This document describes the current architecture and usage patterns.

## Current Architecture (December 2024)

### Centralized Configuration Matrix

All site URLs and base paths are defined in a single configuration file:

**Location**: `libs/shared-config/src/lib/siteConfig.ts`

```typescript
// Central configuration matrix - single source of truth
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
};
```

### Type Definitions

```typescript
export type SiteKey = 'portal' | 'ISBDM' | 'LRM' | 'FRBR' | 'isbd' | 'muldicat' | 'unimarc';

export type Environment = 'local' | 'preview' | 'development' | 'production';

export interface SiteConfigEntry {
  url: string;
  baseUrl: string;
  port?: number;
}
```

### Core Functions

```typescript
// Get configuration for a specific site and environment
export function getSiteConfig(siteKey: SiteKey, environment: Environment): SiteConfigEntry

// Generate full URLs for cross-site navigation
export function getSiteUrl(siteKey: SiteKey, path: string, environment: Environment): string

// Map DOCS_ENV values to Environment enum
export function mapDocsEnvToEnvironment(docsEnv?: string): Environment
```

## Usage in docusaurus.config.ts

Each site's configuration automatically uses the centralized config:

```typescript
import { getSiteConfig, mapDocsEnvToEnvironment } from '@ifla/shared-config';

const currentEnv = mapDocsEnvToEnvironment(process.env.DOCS_ENV);
const siteConfig = getSiteConfig('portal', currentEnv);

export default {
  url: siteConfig.url,
  baseUrl: siteConfig.baseUrl,
  customFields: {
    environment: currentEnv,
    docsEnv: currentEnv,
    siteConfig: (toSiteKey: SiteKey) => getSiteConfig(toSiteKey, currentEnv),
  },
  // ... rest of configuration
};
```

## Inter-Site Navigation

### SiteLink Component

Use the `SiteLink` component for robust cross-site navigation that automatically adapts to the current environment:

```tsx
import SiteLink from '@ifla/theme/components/SiteLink';

// Link to another site
<SiteLink siteKey="LRM" path="/docs/introduction">
  View LRM Documentation
</SiteLink>

// Link to site homepage
<SiteLink siteKey="ISBDM" path="">
  ISBDM Site
</SiteLink>
```

#### SiteLink Props
- **`siteKey`** - Target site identifier (`'portal' | 'ISBDM' | 'LRM' | 'FRBR' | 'isbd' | 'muldicat' | 'unimarc'`)
- **`path`** - Relative path on target site (e.g., `'/docs/intro'`, `'blog'`, `''`)
- **`children`** - Link content
- **`className`** - Optional CSS class

#### Features
- **Environment-aware**: Automatically uses correct URLs for current environment
- **Type-safe**: TypeScript ensures valid site keys
- **External navigation**: Opens in new tab with proper security attributes
- **Path normalization**: Handles leading slashes and empty paths correctly

### Implementation Details

The SiteLink component uses Docusaurus context to access the configuration:

```typescript
const SiteLink = ({ siteKey, path, children, className }: SiteLinkProps): JSX.Element => {
  const { siteConfig } = useDocusaurusContext();
  const getSiteConfigForKey = siteConfig.customFields?.siteConfig as ((key: SiteKey) => { url: string; baseUrl: string }) | undefined;
  
  if (!getSiteConfigForKey) {
    throw new Error('siteConfig function not found in customFields');
  }
  
  const targetConfig = getSiteConfigForKey(siteKey);
  
  // Ensure proper path concatenation
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const fullUrl = `${targetConfig.url}${targetConfig.baseUrl}${normalizedPath}`;
  
  return (
    <a href={fullUrl} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
```

## Environment Handling

### Environment Types
- **local** - Development with local asset references (`http://localhost:300X`)
- **preview** - Staging environment for testing (`https://iflastandards.github.io/standards-dev/`)
- **development** - Development branch testing (`https://jonphipps.github.io/standards-dev/`)
- **production** - Live deployment environment (`https://www.iflastandards.info/`)

### Environment Detection
```typescript
// Automatically detects environment from DOCS_ENV or NODE_ENV
const currentEnv = mapDocsEnvToEnvironment(process.env.DOCS_ENV);
```

### Setting Environment
```bash
DOCS_ENV=production pnpm build:portal
DOCS_ENV=preview pnpm build:isbdm
# Defaults to 'local' for development
```

## Migration Notes (December 2024)

### What Changed
- **Removed**: All `.env.site*` files (previously 36+ files across sites)
- **Centralized**: Site URLs and base paths now in `libs/shared-config/src/lib/siteConfig.ts`
- **Updated**: SiteLink component props changed from `toSite` → `siteKey`, `to` → `path`
- **Simplified**: No more environment variable loading in docusaurus.config.ts files

### Benefits
- **Single source of truth** for all site configuration
- **Reduced complexity** - no more environment file management
- **Better maintainability** - all URLs in one centralized location
- **Type safety** - compile-time validation of site keys and environments
- **Easier debugging** - all configuration visible in one place

### For Developers
- Use `getSiteConfig(siteKey, environment)` instead of environment variables
- Import from `@ifla/shared-config` for configuration utilities
- Site metadata (title, tagline, etc.) is now defined directly in docusaurus.config.ts files
- All tests updated and passing with new architecture

## Adding New Sites

### 1. Add to Configuration Matrix
```typescript
// In libs/shared-config/src/lib/siteConfig.ts
export const SITE_CONFIG: Record<SiteKey, Record<Environment, SiteConfigEntry>> = {
  // ... existing sites
  'new-site': {
    local: { url: 'http://localhost:3007', baseUrl: '/', port: 3007 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/new-site/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/new-site/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/new-site/' },
  },
};

// Update SiteKey type
export type SiteKey = 'portal' | 'ISBDM' | 'LRM' | 'FRBR' | 'isbd' | 'muldicat' | 'unimarc' | 'new-site';
```

### 2. Update docusaurus.config.ts
```typescript
import { getSiteConfig, mapDocsEnvToEnvironment } from '@ifla/shared-config';

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

## Best Practices

### DO
- Use the centralized configuration matrix for all sites
- Use `getSiteConfig()` for URL generation
- Use `SiteLink` component for cross-site navigation
- Test in all environments (local, preview, development, production)
- Keep site-specific metadata in docusaurus.config.ts files

### DON'T
- Hardcode URLs or base paths
- Create environment files for site configuration
- Use old environment variable patterns
- Skip environment testing
- Modify the configuration matrix without updating type definitions

## Testing

### Unit Tests
All configuration functions are tested:
```typescript
// Example test
describe('getSiteConfig', () => {
  it('should return correct config for portal local', () => {
    const config = getSiteConfig('portal', 'local');
    expect(config.url).toBe('http://localhost:3000');
    expect(config.baseUrl).toBe('/');
  });
});
```

### Integration Tests
SiteLink component usage is tested in component tests and E2E tests.

## Troubleshooting

### Common Issues
1. **TypeScript errors**: Ensure site key is added to `SiteKey` type
2. **URL issues**: Check `siteKey` matches configuration exactly
3. **Navigation issues**: Verify environment detection is working
4. **Build failures**: Check for TypeScript errors in configuration

### Debug Environment Detection
```typescript
import { mapDocsEnvToEnvironment } from '@ifla/shared-config';
console.log('Current environment:', mapDocsEnvToEnvironment(process.env.DOCS_ENV));
```

### Debug URL Generation
```typescript
import { getSiteUrl } from '@ifla/shared-config';
console.log('Portal URL:', getSiteUrl('portal', '/docs/intro', 'local'));
```

## Related Files

- **Configuration Matrix**: `libs/shared-config/src/lib/siteConfig.ts`
- **SiteLink Component**: `packages/theme/src/components/SiteLink.tsx`
- **Configuration Tests**: `packages/theme/src/tests/config/siteConfig.test.ts`
- **Example Usage**: `portal/docs/index.mdx`