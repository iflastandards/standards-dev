# Build Configuration Contamination Investigation

## Summary
Investigation and resolution of configuration contamination issues during parallel builds that caused sites to get incorrect footer links from other sites.

## Problem Description
During parallel builds using `pnpm build:all`, some sites were getting footer links from other sites instead of their own correct links. For example, `muldicat` and `unimarc` sites were getting `/LRM/` links in their footer instead of their own site-specific links.

## Root Cause
The issue was **NOT** with parallel builds or the `concurrently` package. The root cause was **deep cloning configuration objects** using `JSON.parse(JSON.stringify())` which corrupted configuration objects containing functions and broke object references.

## Investigation Timeline

### Initial Symptoms
- Sites getting cross-contaminated footer links during parallel builds
- `muldicat` and `unimarc` getting `/LRM/` links instead of their own
- Individual builds worked correctly
- Sequential builds also showed contamination

### Failed Attempts
1. **Deep Cloning "Fix"** - Added `JSON.parse(JSON.stringify())` to prevent object mutation
   - **Result**: Made the problem worse by corrupting configuration objects
   - **Issue**: Functions and special objects were lost during serialization

2. **Process Isolation** - Created separate Node.js processes for each build
   - **Result**: Still had contamination because the issue was in our configuration logic
   - **Issue**: The problem wasn't process sharing, it was our broken deep cloning

### Successful Resolution
**Reverted all deep cloning changes** back to the original configuration logic:
- Removed `JSON.parse(JSON.stringify())` from `packages/theme/src/config/docusaurus.ts`
- Removed `JSON.parse(JSON.stringify())` from `packages/theme/src/config/standardSiteFactory.ts`
- Restored original object spreading and references

## Key Findings

### What Works Correctly
✅ **Original configuration logic** - No contamination when using normal object spreading
✅ **Parallel builds** (`pnpm build:all`) - Work perfectly with original configuration
✅ **Sequential builds** (`pnpm build:all:sequential`) - Work correctly
✅ **Individual builds** (`pnpm build:muldicat`) - Work correctly

### What Breaks Configuration
❌ **Deep cloning with JSON.parse(JSON.stringify())** - Corrupts objects with functions
❌ **Over-engineering solutions** - The original code was correct

## Technical Details

### Why Deep Cloning Failed
```javascript
// This breaks configuration objects:
JSON.parse(JSON.stringify(sharedThemeConfig))

// Issues:
// 1. Functions are removed during serialization
// 2. Object references are broken
// 3. Special objects (Date, RegExp) are corrupted
// 4. Prototype chains are lost
```

### Correct Approach
```javascript
// This works correctly:
{
  ...sharedThemeConfig,
  navbar: {
    ...sharedThemeConfig.navbar,
    // site-specific overrides
  }
}
```

## Lessons Learned

1. **Trust the original implementation** - If individual builds work, the logic is correct
2. **Don't over-engineer solutions** - Simple object spreading is often sufficient
3. **Deep cloning is dangerous** - Only use when absolutely necessary and with proper cloning libraries
4. **Test thoroughly** - Always verify that "fixes" don't introduce new problems
5. **Parallel builds aren't always the culprit** - Module-level contamination can have other causes

## Current Status
- ✅ All build methods work correctly without contamination
- ✅ Sites get proper footer configuration (Resources vs Sites sections)
- ✅ No cross-site link contamination
- ✅ Only expected broken links (./rdf for scaffolded sites)

## Related Files
- `packages/theme/src/config/docusaurus.ts` - Base configuration factory
- `packages/theme/src/config/standardSiteFactory.ts` - Site-specific configuration factory
- `package.json` - Build commands (kept `build:all:sequential` as backup option)

## Future Recommendations
- Use the standard `pnpm build:all` for parallel builds (fastest)
- Keep `pnpm build:all:sequential` as backup for debugging
- Avoid deep cloning configuration objects unless absolutely necessary
- If deep cloning is needed, use proper libraries like `lodash.cloneDeep` instead of JSON methods
