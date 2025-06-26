# Current Site Scaffolding Plan
**IMPORTANT: Read and update this before each phase**

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

1. **Backup current configs** - Save existing docusaurus.config.ts for each site before changes
2. **Re-scaffold priority sites**: muldicat → isbd → others using updated template
3. **Test each site individually** using their own build/serve scripts (e.g., `build:muldicat`)
4. **Visual regression validation** after each site migration

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