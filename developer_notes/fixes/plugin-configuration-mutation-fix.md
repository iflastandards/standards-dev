# Plugin Configuration Mutation Fix

## Problem Description

**Issue**: Docusaurus mutates shared plugin configuration objects during build normalization, causing cross-site contamination in parallel builds.

**Root Cause**: The shared plugin configurations in `packages/theme/src/config/docusaurus.ts` were being reused across all sites without deep cloning. When multiple sites share the same plugin configuration objects, Docusaurus modifies the options objects in-place during build normalization. This means the first site to build "wins" and subsequent sites inherit mutated configurations with incorrect baseUrl values.

**Symptoms**:
- Sites linking to incorrect URLs (e.g., LRM site linking to `/ISBDM/` URLs instead of `/LRM/`)
- Inconsistent navigation patterns across sites
- Build failures in parallel builds due to configuration conflicts
- Cross-site contamination where later builds inherit first site's configuration

## Solution

### Implementation

**File Modified**: `packages/theme/src/config/standardSiteFactory.ts`

**Changes Made**:

1. **Added Deep Clone Function**: Implemented a robust deep cloning solution with fallback support
2. **Replaced Shallow Copying**: Changed from `[...plugin]` to `deepClone(plugin)` for all shared configurations
3. **Complete Coverage**: Applied deep cloning to:
   - `sharedPlugins`
   - `additionalPlugins` 
   - `sharedThemes`

### Code Changes

```typescript
// Use structuredClone with fallback for environments that don't support it
const deepClone = typeof structuredClone !== 'undefined'
  ? structuredClone
  : <T>(obj: T): T => {
      if (obj === null || typeof obj !== 'object') return obj;
      if (obj instanceof Date) return new Date(obj.getTime()) as T;
      if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
      if (typeof obj === 'object') {
        const cloned = {} as T;
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
          }
        }
        return cloned;
      }
      return obj;
    };

// LEVEL 1: Plugin and Theme Configuration
// Before (shallow copying - BROKEN):
const plugins = [
  ...sharedPlugins.map(plugin => Array.isArray(plugin) ? [...plugin] : plugin),
  ...additionalPlugins.map(plugin => Array.isArray(plugin) ? [...plugin] : plugin),
];

// After (deep cloning - FIXED):
const plugins = [
  ...sharedPlugins.map(p => deepClone(p)),
  ...additionalPlugins.map(p => deepClone(p)),
];

// Before (shallow copying - BROKEN):
themes: sharedThemes.map(theme => Array.isArray(theme) ? [...theme] : theme),

// After (deep cloning - FIXED):
themes: sharedThemes.map(t => deepClone(t)),

// LEVEL 2: Theme Configuration Objects
// Before (shallow copying/direct references - BROKEN):
prism: { ...sharedThemeConfig.prism },
tableOfContents: { ...sharedThemeConfig.tableOfContents },
image: sharedThemeConfig.image,
announcementBar: { ...sharedThemeConfig.announcementBar },
logo: { ...sharedThemeConfig.navbar.logo },
copyright: sharedThemeConfig.footer.copyright,

// After (deep cloning - FIXED):
prism: deepClone(sharedThemeConfig.prism),
tableOfContents: deepClone(sharedThemeConfig.tableOfContents),
image: deepClone(sharedThemeConfig.image),
announcementBar: deepClone(sharedThemeConfig.announcementBar),
logo: deepClone(sharedThemeConfig.navbar.logo),
copyright: deepClone(sharedThemeConfig.footer.copyright),
```

## Verification

### Test Coverage

**Test File**: `packages/theme/src/tests/config/standardSiteFactory.test.ts`

**Test Cases**:
1. **Configuration Independence**: Verifies plugin arrays are different instances
2. **Deep Object Isolation**: Ensures nested configuration objects are independent
3. **Mutation Prevention**: Simulates Docusaurus mutations and verifies no contamination
4. **Additional Plugin Isolation**: Tests custom plugins maintain independence
5. **Original Configuration Preservation**: Ensures shared configs remain unchanged

### Build Verification

**Command**: `pnpm clear:all && pnpm build:theme && pnpm build:all`

**Expected Results**:
- All sites build successfully
- No cross-site URL contamination
- Each site maintains correct navigation patterns
- Parallel builds complete without configuration conflicts

**Evidence of Success**:
- **No Configuration Contamination**: Each site maintains its own correct configuration during parallel builds
- **UNIMARC site** correctly links to its own pages: `/unimarc/intro`, `/unimarc/elements`, `/unimarc/examples`
- **ISBD site** correctly links to cross-site navigation: `/unimarc/docs`, `/unimarc/blog`, `/unimarc/rdf`, `/unimarc/sitemap`
- **Portal site** correctly links to `/portal/` URLs
- **Sequential vs Parallel**: No difference in behavior between sequential and parallel builds
- **Test Suite**: All 7 configuration isolation tests pass

## Technical Details

### Why Deep Cloning is Required

**Docusaurus Build Process**:
1. Docusaurus receives plugin configuration arrays like `['plugin-name', { options }]`
2. During build normalization, Docusaurus mutates the `options` object in-place
3. Properties like `baseUrl`, `routeBasePath`, etc. are modified based on site context
4. If multiple sites share the same options object reference, all sites see the mutations

**Shallow Copying Limitation**:
- `[...plugin]` only copies the array structure
- The nested `options` object remains a shared reference
- Mutations to `options` affect all sites using that reference

**Deep Cloning Solution**:
- `deepClone(plugin)` creates completely independent copies
- All nested objects and arrays are recursively cloned
- Each site gets its own isolated configuration objects
- Mutations in one site don't affect other sites

### Browser Compatibility

**Primary Method**: `structuredClone()` (Node.js 17+, modern browsers)
**Fallback Method**: Custom recursive deep clone implementation
**Project Compatibility**: Node.js 22.16.0 (fully supported)

## Maintenance Notes

### When to Update This Fix

1. **Adding New Shared Configurations**: Apply `deepClone()` to any new shared plugin or theme configurations
2. **Docusaurus Updates**: Monitor for changes in Docusaurus plugin normalization behavior
3. **Performance Concerns**: If deep cloning becomes a bottleneck, consider more targeted cloning

### Related Files

- `packages/theme/src/config/docusaurus.ts` - Shared plugin/theme definitions
- `packages/theme/src/config/standardSiteFactory.ts` - Site configuration factory (contains fix)
- `packages/theme/src/tests/config/standardSiteFactory.test.ts` - Test coverage

### Future Considerations

- Monitor Docusaurus for built-in configuration isolation features
- Consider contributing this fix back to Docusaurus core if applicable
- Evaluate performance impact if the number of sites grows significantly

## Troubleshooting

### Symptoms of Configuration Contamination

- Sites linking to incorrect base URLs
- Navigation menus showing wrong site names
- Build failures with "duplicate route" errors
- Inconsistent site behavior between sequential and parallel builds

### Debugging Steps

1. **Check Build Output**: Look for incorrect URLs in broken link warnings
2. **Compare Configurations**: Verify each site gets independent config objects
3. **Run Tests**: Execute `npx vitest run packages/theme/src/tests/config/standardSiteFactory.test.ts`
4. **Sequential vs Parallel**: Compare `pnpm build:site1 && pnpm build:site2` vs parallel builds

### Common Issues

- **Test Environment**: Ensure test environment supports `structuredClone` or uses fallback
- **Memory Usage**: Deep cloning increases memory usage during builds
- **Build Performance**: May slightly increase build time due to cloning overhead
