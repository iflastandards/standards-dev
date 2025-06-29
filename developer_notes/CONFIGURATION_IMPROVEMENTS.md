# IFLA Standards Configuration Improvements

## Current Issues Identified

### 1. **Redundant Configuration Files**
- `browser.ts` and `docusaurus.ts` have overlapping functionality
- `docusaurus.base.ts` provides unused factory pattern
- Multiple ways to define the same configuration concepts

### 2. **Inconsistent Vocabulary Defaults**
- Each site manually defines `vocabularyDefaults` in `customFields`
- ISBDM and LRM have site-specific configurations, others use generic defaults
- Should leverage `VOCABULARY_DEFAULTS` from `docusaurus.base.ts`

### 3. **Repetitive Site Configuration Patterns**
- All standards sites have nearly identical structure (80+ lines of boilerplate)
- Repeated preset configurations (docs, blog, theme)
- Inconsistent navbar implementations
- Manual portal URL construction instead of using `getSiteUrl`

### 4. **Inconsistent Navigation**
- Some sites use hardcoded portal links with `process.env.NODE_ENV` checks
- Missing `standardsDropdown` in most sites
- Inconsistent Resources dropdown implementations

### 5. **Unused Configuration Infrastructure**
- `browser.ts` appears unused
- `.config/docusaurus.config.ts` template files exist but seem unused

## Proposed Solutions

### 1. **New Standardized Site Factory**

Created `packages/theme/src/config/standardSiteFactory.ts` with `createStandardSiteConfig()` function that:

- **Reduces boilerplate**: 125+ lines → ~40 lines per site
- **Ensures consistency**: All sites get same base configuration
- **Leverages existing infrastructure**: Uses `VOCABULARY_DEFAULTS`, `getSiteUrl`, etc.
- **Maintains flexibility**: Allows site-specific customizations
- **Handles complex cases**: Supports custom sidebar generators, redirects, etc.

### 2. **Configuration Consolidation**

**Remove redundant files:**
- Eliminate `browser.ts` (functionality covered by `docusaurus.ts`)
- Clean up unused `.config/` template files
- Either utilize `docusaurus.base.ts` factory or remove it

**Centralize vocabulary defaults:**
- Use `VOCABULARY_DEFAULTS` from `docusaurus.base.ts`
- Site-specific overrides only where needed

**Maintain `siteConfigCore.ts` as source of truth:**
- All site paths, URLs, and environment definitions remain in `siteConfigCore.ts`
- Scripts continue to import directly from `siteConfigCore.ts`
- Factory uses proper abstraction layers (`siteConfig.ts`, `siteConfig.server.ts`)
- Ensures consistent URL generation across all environments

### 3. **Standardized Navigation**

**Consistent navbar structure:**
- All sites get `standardsDropdown` automatically
- Standardized Resources dropdown with proper `getSiteUrl` usage
- Site-specific items merged with standard items

**Proper URL generation:**
- Replace hardcoded portal links with `getSiteUrl('portal', '/', currentEnv)`
- Environment-aware navigation across all sites

## Implementation Examples

### Before (LRM - 125 lines):
```typescript
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {
  sharedPlugins,
  sharedThemes,
  commonDefaults,
  getSiteDocusaurusConfig,
  getCurrentEnv,
  type SiteKey,
  type DocsEnv
} from '@ifla/theme/config';

const siteKey: SiteKey = 'LRM';
const currentEnv: DocsEnv = getCurrentEnv();
const currentSiteConfig = getSiteDocusaurusConfig(siteKey, currentEnv);

const config: Config = {
  ...commonDefaults(currentEnv),
  url: currentSiteConfig.url,
  title: 'IFLA LRM',
  tagline: 'Library Reference Model',
  baseUrl: currentSiteConfig.baseUrl,
  projectName: 'LRM',
  // ... 100+ more lines of repetitive configuration
};
```

### After (LRM - 42 lines):
```typescript
import { createStandardSiteConfig } from '@ifla/theme/config';

const config = createStandardSiteConfig({
  siteKey: 'LRM',
  title: 'IFLA LRM',
  tagline: 'Library Reference Model',
  projectName: 'LRM',
  
  vocabularyDefaults: {
    prefix: "lrm",
    numberPrefix: "E",
    profile: "lrm-values-profile.csv",
    elementDefaults: {
      uri: "https://www.iflastandards.info/LRM/elements",
      profile: "lrm-elements-profile.csv",
    }
  },
  
  editUrl: 'https://github.com/iflastandards/LRM/tree/main/',
  
  navbar: {
    items: [
      {
        type: 'doc',
        docId: 'intro/intro',
        position: 'left',
        label: 'Introduction',
      },
    ],
  },
  
  redirects: {
    redirects: [],
    createRedirects: (_existingPath: string) => undefined,
  },
});

export default config;
```

## Benefits

### 1. **Maintainability**
- **66% reduction** in configuration code per site
- Single source of truth for common patterns
- Easier to update all sites simultaneously
- Consistent behavior across environments

### 2. **Consistency**
- All sites get same base features (search, navigation, footer)
- Standardized vocabulary handling
- Proper environment-aware URL generation
- Consistent navbar and footer structure

### 3. **Developer Experience**
- Less boilerplate to write and maintain
- Clear separation of site-specific vs. shared configuration
- Type-safe configuration options
- Self-documenting through interface

### 4. **Flexibility**
- Sites can still customize as needed
- Complex cases (like ISBDM) fully supported
- Gradual migration path
- Backward compatibility maintained

## Migration Plan

### Phase 1: Infrastructure (Completed)
- ✅ Created `standardSiteFactory.ts`
- ✅ Updated theme exports
- ✅ Created example refactored configurations

### Phase 2: Simple Sites Migration
1. Migrate LRM (simplest case)
2. Migrate FRBR, isbd, muldicat, unimarc (similar patterns)
3. Test and validate functionality

### Phase 3: Complex Sites Migration
1. Migrate ISBDM (most complex case)
2. Handle custom sidebar generation
3. Validate all features work correctly

### Phase 4: Cleanup
1. Remove unused configuration files
2. Update documentation
3. Remove redundant code

## Portal Considerations

The portal is intentionally different from standards sites:
- Acts as gateway for casual consumers
- Workplace for editors with management features
- Should maintain its current configuration approach
- May benefit from some shared components but needs unique features

## Testing Strategy

1. **Local testing**: Verify all sites build and run correctly
2. **Navigation testing**: Ensure all cross-site links work in all environments
3. **Feature parity**: Confirm refactored sites have same functionality
4. **Environment testing**: Test localhost, preview, and production configurations

## Next Steps

1. **Review and approve** this improvement plan
2. **Test the LRM refactoring** to validate the approach
3. **Migrate remaining simple sites** one by one
4. **Handle ISBDM complexity** with custom sidebar support
5. **Clean up unused files** and update documentation
