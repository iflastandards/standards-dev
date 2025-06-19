# IFLA Preset Implementation Plan

## Overview
Transition from factory-based configuration to proper Docusaurus preset architecture to eliminate Node.js module caching contamination and follow standard Docusaurus patterns.

## Problem Statement
The current `standardSiteFactory.ts` approach suffers from:
- Node.js module caching contamination between builds
- Cross-site navigation pollution (URLs from one site appearing in another)
- Non-standard Docusaurus architecture
- Complex workarounds (deep cloning, stateless functions)

## Solution Architecture
Implement `@ifla/preset-ifla` as a proper Docusaurus preset that:
- Follows standard Docusaurus v3.8 preset patterns
- Supports shared components via `customFields`
- Uses central sites configuration for scripts and cross-site navigation
- Provides ultra-simple site configurations

## Epic Breakdown

### EPIC 1: Setup Preset Package Structure
**Goal**: Establish proper package structure for the preset
- **Task 1.1**: Create proper package.json for @ifla/preset-ifla
- **Task 1.2**: Setup TypeScript configuration and build pipeline
- **Task 1.3**: Define preset options interface with proper TypeScript types

### EPIC 2: Core Preset Implementation  
**Goal**: Build the main preset function with URL resolution and vocabulary defaults
- **Task 2.1**: Implement main preset function structure
- **Task 2.2**: Integrate URL resolution using existing getSiteUrls utility
- **Task 2.3**: Build vocabulary defaults merging logic using VOCABULARY_DEFAULTS
- **Task 2.4**: Configure customFields structure for component compatibility

### EPIC 3: Theme Configuration Builder
**Goal**: Create complete themeConfig with cross-site navigation
- **Task 3.1**: Build cross-site navigation from central sites config
- **Task 3.2**: Create complete navbar with Standards dropdown
- **Task 3.3**: Integrate shared footer and theme components
- **Task 3.4**: Add site-specific navbar item customization

### EPIC 4: Plugin and Preset Configuration
**Goal**: Configure all necessary plugins and @docusaurus/preset-classic
- **Task 4.1**: Configure @docusaurus/preset-classic with proper options
- **Task 4.2**: Add shared plugins (sass, redirects, webpack polyfills)
- **Task 4.3**: Implement sidebar generation with index.mdx filtering
- **Task 4.4**: Configure docs and blog plugin options

### EPIC 5: Site Configuration Migration
**Goal**: Migrate sites to use the new preset
- **Task 5.1**: Create minimal LRM site config using preset
- **Task 5.2**: Test LRM builds correctly with preset
- **Task 5.3**: Migrate ISBDM site config to preset
- **Task 5.4**: Migrate Portal site config to preset

### EPIC 6: Testing and Validation
**Goal**: Ensure no contamination and all features work
- **Task 6.1**: Test individual sites build without contamination
- **Task 6.2**: Test parallel builds work correctly
- **Task 6.3**: Verify shared components access customFields correctly
- **Task 6.4**: Test cross-site navigation links are correct

### EPIC 7: Factory Cleanup
**Goal**: Remove old factory-based code
- **Task 7.1**: Remove standardSiteFactory.ts and related factory code
- **Task 7.2**: Clean up unused configuration utilities
- **Task 7.3**: Update remaining site configs to use preset

## Key Technical Requirements

### Preset Interface
```typescript
interface IFLAPresetOptions {
  siteKey: SiteKey;
  title: string;
  tagline: string;
  vocabularyDefaults?: Partial<VocabularyDefaults>;
  customNavbarItems?: NavbarItem[];
  navigation?: { 
    hideCurrentSite?: boolean;
    standardsDropdownPosition?: 'left' | 'right';
  };
  editUrl?: string;
}
```

### Site Config Example
```typescript
// standards/LRM/docusaurus.config.ts
export default {
  presets: [
    ['@ifla/preset-ifla', {
      siteKey: 'LRM',
      title: 'IFLA LRM',
      tagline: 'Library Reference Model',
      vocabularyDefaults: { numberPrefix: "E" },
      customNavbarItems: [{ type: 'doc', docId: 'intro/intro', label: 'Introduction' }],
      navigation: { hideCurrentSite: true }
    }]
  ]
};
```

### Component Compatibility
Ensure `customFields.vocabularyDefaults` structure matches what components expect:
```typescript
const { siteConfig } = useDocusaurusContext();
const defaults = siteConfig.customFields?.vocabularyDefaults as VocabularyDefaults;
```

## Dependencies to Preserve
- **Central sites config**: Keep `siteConfigCore.ts` for scripts and cross-site navigation
- **Existing utilities**: Reuse `getSiteUrls()`, `VOCABULARY_DEFAULTS`, `sharedThemeConfig`
- **Shared components**: All components in `@ifla/theme` must continue working
- **Build scripts**: Existing build processes should work unchanged

## Success Criteria
1. ✅ Site configs become 10-15 lines instead of 60+ lines
2. ✅ No cross-site contamination when building multiple sites
3. ✅ All shared components work via `useDocusaurusContext()`
4. ✅ Standard Docusaurus preset architecture
5. ✅ Scripts and central configuration still work
6. ✅ Cross-site navigation functions correctly

## Migration Strategy
1. **Phase 1**: Build and test preset with LRM site only
2. **Phase 2**: Migrate ISBDM and Portal (the correct baselines)
3. **Phase 3**: Migrate remaining sites and clean up factory code
4. **Phase 4**: Comprehensive testing and validation

## Related Files
- `packages/preset-ifla/src/index.ts` (new)
- `packages/theme/src/config/siteConfigCore.ts` (preserve)
- `packages/theme/src/config/docusaurus.base.ts` (reference)
- `packages/theme/src/config/standardSiteFactory.ts` (remove after migration)
- `standards/*/docusaurus.config.ts` (simplify)

## Notes
- This follows exact Docusaurus v3.8 preset patterns from Context7 research
- Eliminates all Node.js module caching issues by using standard preset instantiation
- Maintains backward compatibility with all existing shared components
- Preserves central configuration for script automation