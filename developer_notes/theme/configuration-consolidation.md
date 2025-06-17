# Theme Configuration Consolidation

## Usage
The theme configuration has been consolidated to simplify maintenance and ensure consistency across all IFLA standards sites.

## Developer Section

### Overview
Recent changes have centralized the Docusaurus configuration to avoid duplication and ensure all sites use the same theme, components, and settings.

### Key Changes

#### 1. Base Configuration (`packages/theme/src/config/docusaurus.ts`)
- Created `baseDocusaurusConfig` function that provides all shared configuration
- Accepts `currentEnv` parameter for environment-specific URLs
- Includes:
  - Static settings (future flags, organization name, markdown config)
  - Shared plugins (sass, ideal-image)
  - Shared themes (live-codeblock, search-local)
  - Theme configuration (prism, colorMode, announcement bar, footer)

#### 2. Navigation Components
- `standardsDropdown()` - Creates consistent standards dropdown for navbar
- Function accepts `currentEnv` parameter for dynamic URL generation

#### 3. Footer Standardization
- All sites now use the "Resources" footer pattern via `createStandardSiteConfig()`
- Removed legacy "Sites" footer functionality
- Footer includes:
  - Dynamic "Resources" section with RDF Downloads, Sitemap, and custom links
  - Static "Community" and "More" sections
  - Copyright with CC BY license image
- Sites can customize resources via `additionalResourceLinks` configuration

#### 4. Site Configuration Updates
All standard sites (ISBDM, LRM, fr, isbd, muldicat, unimarc) now:
- Import and use `baseDocusaurusConfig(currentEnv)`
- Only define site-specific properties (title, tagline, url, baseUrl)
- Inherit all theme configuration automatically

### Configuration Hierarchy
```
baseDocusaurusConfig (theme package)
    ├── staticBaseSettings (future flags, org name, etc.)
    ├── sharedPlugins (sass, ideal-image)
    ├── sharedThemes (search, live-codeblock)
    └── sharedThemeConfig
        ├── prism (code highlighting)
        ├── colorMode
        ├── announcementBar
        ├── navbar (logo only, sites add items)
        └── footer (dynamic sites + static sections)
```

### Implementation Pattern
```typescript
// In each site's docusaurus.config.ts
import { baseDocusaurusConfig, standardsDropdown } from '@ifla/theme/config/docusaurus';
import { getCurrentEnv } from '@ifla/theme/config/siteConfig.server';
import { getSiteDocusaurusConfig } from '@ifla/theme/config/siteConfig';

const siteKey: SiteKey = 'ISBDM'; // or 'LRM', etc.
const currentEnv = getCurrentEnv();
const { url, baseUrl } = getSiteDocusaurusConfig(siteKey, currentEnv);

const config: Config = {
  ...baseDocusaurusConfig(currentEnv),
  title: 'ISBD for Manifestations',
  tagline: 'International Standard Bibliographic Description',
  url: url,
  baseUrl: baseUrl,
  // Site-specific overrides if needed
};
```

### Related Files
- `packages/theme/src/config/docusaurus.ts` - Base configuration
- `packages/theme/src/config/docusaurus.base.ts` - Legacy (being phased out)
- `packages/theme/src/config/siteConfig.ts` - URL generation utilities
- All `standards/*/docusaurus.config.ts` files - Now simplified

### Benefits
1. **Consistency** - All sites automatically share the same configuration
2. **Maintainability** - Changes in one place affect all sites
3. **Simplicity** - Site configs are now minimal, focusing only on unique content
4. **Environment Awareness** - Proper URL handling for dev/staging/production

### Migration Notes
- The `commonDefaults()` function was replaced with direct use of `baseDocusaurusConfig()`
- Custom footers in individual sites should be removed
- Site-specific navbar items should be added via the navbar.items array