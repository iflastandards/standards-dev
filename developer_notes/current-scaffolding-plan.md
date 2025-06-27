# Current Site Scaffolding Plan
**IMPORTANT: Read and update this before each phase**

## Overview
The scaffolding system consists of two main scripts:
1. **scaffold-site.ts** - Uses `scripts/scaffold-template` directory to establish folders and static files for a new site
2. **generate-individual-config.ts** - Generates the docusaurus.config.ts file by:
   - Loading a `site-config.json` file from the site directory (built from future form/wizard)
   - Using this config data to generate a self-contained docusaurus.config.ts
   - For re-scaffolding existing sites: store site-config.json in existing directory
   - For new sites: store site-config.json in newly created directory

## Phase 1: Move siteConfig.ts to Theme & Update Template Generator
**Move configuration logic and fix template generation:**

1. **Move siteConfig.ts** from `libs/shared-config/src/lib/` to `packages/theme/src/config/`
2. **Update site-template.ts** to generate self-contained docusaurus.config.ts:
   - Inline the SITE_CONFIG data structure directly in generated config
   - Inline getSiteConfig function directly in generated config
   - **Error handling**: If no DOCS_ENV, throw clear error (don't substitute)
   - Add siteConfigMap to customFields for sister site URLs
3. **Add new site support** to SITE_CONFIG for testing new site scaffolding

## Phase 2: Fix UNIMARC URL/BaseURL Resolution
**Update UNIMARC to use proper environment resolution:**

1. UNIMARC is already good except for hardcoded url/baseUrl
2. Replace hardcoded values with environment-based resolution using DOCS_ENV
3. **Test using existing scripts**: `build:unimarc`, `start:unimarc`, etc.
4. Verify isolation and no contamination

## Phase 3: Re-scaffold Existing Sites (Moved ahead of scaffold-site)
**Apply clean configs to eliminate contamination:**

### Procedure for Each Site:
1. **Make a backup** of the site's current docusaurus.config.ts (e.g., `mv docusaurus.config.ts docusaurus.config.ts.backup-YYYYMMDD`)
2. **Read that config** to extract values and build a site-config.json
3. **Load that JSON file** in the generate-individual-config.ts script and generate a new docusaurus.config.ts
4. **Compare the generated config** to a known-good config (e.g., correct unimarc config) for structure/patterns
5. **Refine if needed** and then build the site using the new config
6. **Serve the site** and run visual regression tests:
   - Use `pnpm test:visual-regression` with the visual-regression.spec.ts test
   - Compare against baseline snapshots in ./tests
7. **Manual review** - Have user look at it and offer suggestions

**Note**: Can rename existing docusaurus.config.ts instead of copying for backup

### Sites to Re-scaffold:
1. ✅ **LRM** (Library Reference Model) - **COMPLETED**
   - Generated site-config.json from existing config
   - Used updated generate-individual-config.ts script
   - Fixed import path: `@ifla/theme/config/siteConfig` (not `@ifla/theme`)
   - Fixed navbar docId: `intro/intro` (due to folder structure)
   - **Build successful**: `DOCS_ENV=local pnpm build:lrm --skip-nx-cache`
   - **Server working**: `DOCS_ENV=local pnpm serve:lrm` → http://localhost:3002/LRM/
   - **Known issues**: Some broken links to placeholder content (expected)
2. **muldicat** → **isbd** → others using updated template
3. **Test each site individually** using their own build/serve scripts (e.g., `build:muldicat`)

### Key Fixes for LRM Re-scaffolding:
- **Import path must be specific**: Use `@ifla/theme/config/siteConfig` to avoid React component loading during config phase
- **Document structure matters**: LRM has `intro/intro.mdx` not `intro.mdx`, so navbar needs `docId: 'intro/intro'`
- **Site-config.json template works**: Template in `scripts/scaffold-template/site-config.json` successfully generates configs

## Phase 4: Enhanced Scaffold-Site Script  
**Complete the scaffolding system:**

1. **Hybrid approach**: Copy from scaffold-template directory + generate clean config
2. **Support both**: re-scaffolding existing sites AND creating entirely new sites
3. **Leverage existing infrastructure**: Use testsite pattern and existing package.json scripts

## Key Points:
- ✅ Move siteConfig to theme (eliminate shared-config dependency)
- ✅ Generate completely self-contained configs (no imports)
- ✅ Backup existing configs before re-scaffolding
- ✅ Test each site with its own scripts
- ✅ Handle new sites in SITE_CONFIG for testing
- ✅ Error if DOCS_ENV missing (don't substitute)

## Progress Tracking:
- [x] Phase 1: Move siteConfig & Update Template
  - ✅ Moved siteConfig.ts from shared-config to theme
  - ✅ Added test site support (testsite, newtest) 
  - ✅ Updated individualConfigTemplate to be self-contained (inline SITE_CONFIG)
  - ✅ Added siteConfigMap to customFields
  - ✅ Updated footer Portal link to use siteConfigMap
  - ✅ Built theme successfully
- [x] Phase 2: Fix UNIMARC
  - ✅ Generated new self-contained config using updated template
  - ✅ Replaced hardcoded URLs with environment-based resolution
  - ✅ Tested build with multiple environments (local, preview)
  - ✅ Verified isolation and no contamination
  - ✅ Fixed copyright image path to use relative URL
- [ ] Phase 3: Re-scaffold Sites
- [ ] Phase 4: Enhanced Scaffold Script

Last Updated: 2025-01-26