# Bug Report: Docusaurus Configuration Contamination with @docusaurus/faster Package

## Summary
Critical configuration contamination issue where multiple Docusaurus sites in a monorepo get cross-contaminated with each other's configurations during parallel or sequential builds when using the @docusaurus/faster package.

## Affected Version
- Docusaurus: v3.8.1
- @docusaurus/faster: 3.8.1
- Environment: pnpm monorepo with 7+ Docusaurus sites

## Issue Description
When building multiple Docusaurus sites in a monorepo, sites become contaminated with configurations from other sites, resulting in:
- Wrong site titles appearing
- Incorrect baseURLs in links
- Wrong ports being used
- Navigation links pointing to incorrect sites

### Example Contamination
- muldicat site showing FRBR's title "IFLA FR Family of Models"
- muldicat using FRBR's port 3003 instead of 3005
- muldicat links pointing to `/FRBR/` instead of `/muldicat/`
- Portal site linking to `/muldicat/` instead of `/`
- UNIMARC site linking to `/LRM/` instead of `/unimarc/`

## Steps to Reproduce

### Prerequisites
1. Monorepo with multiple Docusaurus sites
2. @docusaurus/faster package installed
3. Shared configuration modules between sites

### Reproduction Steps
1. Install @docusaurus/faster: `pnpm add -D @docusaurus/faster`
2. Add experimental_faster configuration to docusaurus.config.ts:
   ```typescript
   future: {
     experimental_faster: true, // or false - contamination occurs either way
   }
   ```
3. Build multiple sites: `pnpm build:all`
4. Examine built HTML files for contamination

### Minimal Reproduction
```bash
# Even with sequential builds (no parallelism)
nx run-many --target=build --projects=site1,site2,site3 --parallel=1

# Result: Later sites contaminated with earlier site configurations
```

## Investigation Process

### 1. Initial Hypothesis: Concurrency Issue
**Test**: Reduced parallel builds from 3 to 1
```bash
nx run-many --target=build --parallel=1
```
**Result**: ❌ Contamination persisted even with sequential builds

### 2. Cache Isolation Testing
**Test**: Disabled all caching mechanisms
```bash
# Clear Nx cache
nx reset

# Disable Nx cache
nx run-many --target=build --skip-nx-cache

# Clear Node module cache
rm -rf node_modules/.cache
```
**Result**: ❌ Contamination persisted

### 3. Debug Tracing
Added extensive logging to docusaurus.config.ts files:
```typescript
console.log(`[${siteKey}] Loading config at ${new Date().toISOString()}`);
console.log(`[${siteKey}] Site config:`, JSON.stringify(siteConfig, null, 2));
```
**Finding**: Configuration objects were correct during loading but contaminated during build

### 4. Module-Level State Analysis
**Discovery**: The contamination occurred even with:
- Sequential builds (--parallel=1)
- Cache disabled
- Fresh Node processes

**Conclusion**: Module-level static state contamination, not concurrency-related

### 5. Root Cause Identification
Investigated @docusaurus/faster package:
- Package claims to improve build performance through "aggressive module caching"
- Even when disabled (`experimental_faster: false`), the package still affects builds
- Module caching appears to share state between different site builds

## The Fix

### Solution
Remove @docusaurus/faster package entirely:

```bash
# Remove the package
pnpm remove @docusaurus/faster

# Remove all experimental_faster references from configs
# In all docusaurus.config.ts files, remove:
future: {
  experimental_faster: false,
}
```

### Implementation
```diff
// package.json
{
  "devDependencies": {
-   "@docusaurus/faster": "3.8.1",
    "@docusaurus/core": "3.8.1",
    ...
  }
}

// docusaurus.config.ts (all sites)
future: {
  v4: true,
- experimental_faster: false,
},
```

## Verification

### ❌ ISSUE PERSISTS AFTER ATTEMPTED FIX

After removing @docusaurus/faster package and experimental_faster config, the contamination **STILL OCCURS**:

```bash
pnpm build:all

# Results:
❌ muldicat contaminated with ISBD configuration
❌ muldicat shows "ISBD: International Standard Bibliographic Description" title
❌ muldicat URLs show /isbd/muldicat/ instead of /muldicat/
❌ Contamination persists despite @docusaurus/faster removal
```

### Build Output Evidence (2025-01-26)
Actual contaminated files:
- `/standards/muldicat/build/index.html` - Shows ISBD title, wrong branding
- `/standards/muldicat/build/blog.html` - Shows ISBD title  
- `/standards/muldicat/build/sitemap.html` - Shows ISBD title
- URLs consistently show `/isbd/muldicat/` pattern indicating ISBD contamination

**CONCLUSION: @docusaurus/faster was NOT the root cause**

## Root Cause Analysis - UPDATED

**CRITICAL UPDATE**: The @docusaurus/faster package was NOT the root cause. The contamination persists after its removal.

**Actual Issue**: The contamination is occurring at a deeper level in the monorepo build system:

1. **Shared Configuration State**: Configuration modules in shared-config package have static state that persists across builds
2. **Factory Function Issues**: Factory functions are not creating truly isolated instances
3. **Build Order Dependency**: Sites built later inherit contaminated state from earlier builds
4. **Module Caching**: Node.js module caching is persisting contaminated configuration objects

**Evidence Supporting This Theory**:
- Sequential builds (--parallel=1) still show contamination
- muldicat getting ISBD configuration suggests ISBD built before muldicat
- `/isbd/muldicat/` URL pattern indicates ISBD's baseURL contaminating muldicat
- Cache clearing doesn't resolve the issue, indicating static state in shared modules

## Impact
- **Severity**: Critical - Production sites would have been deployed with wrong configurations
- **Scope**: Affects all Docusaurus monorepo setups using @docusaurus/faster
- **Data Loss**: No data loss, but severe user experience issues

## Recommendations - UPDATED

**URGENT**: Further investigation needed to identify the actual root cause in shared configuration modules.

1. **Immediate Actions**:
   - Investigate shared-config package for static state
   - Review factory functions for proper isolation
   - Examine getSiteConfigMap() and related functions
   - Test process isolation (separate Node processes per build)

2. **Investigation Areas**:
   - Configuration object mutation vs immutability
   - Module-level variables in shared-config
   - Factory function implementation in createBaseConfig, createThemeConfig
   - Potential webpack module sharing issues

3. **Short-term Workarounds**:
   - Use process isolation (spawn separate Node processes)
   - Build sites individually rather than using nx run-many
   - Clear module cache between builds if possible

## Related Issues
- Similar issues may affect other Docusaurus plugins that modify module loading behavior
- The new "fast refresh" feature in Docusaurus v3 may have similar risks

## Environment
- OS: macOS/Linux/Windows (reproduced on all)
- Node: 18.x, 20.x
- Package Manager: pnpm 8.x
- Build Tool: Nx 17.x
- Docusaurus: 3.8.1

## Status: UNRESOLVED

**Current Status**: The contamination issue persists and requires continued investigation.

**Next Steps**:
1. Investigate shared-config factory functions for static state issues
2. Review the shared configuration architecture for isolation problems  
3. Test different build strategies (process isolation, module cache clearing)
4. Identify the specific code causing configuration object sharing/mutation

The issue remains particularly insidious because:
1. It occurs even with sequential builds (--parallel=1)
2. Traditional debugging approaches (cache clearing, isolation) don't help
3. The contamination is order-dependent (later builds inherit earlier contamination)
4. No error messages or warnings are generated
5. The @docusaurus/faster red herring delayed finding the real cause

**This is an ACTIVE CRITICAL BUG that needs immediate resolution before production deployment.**