# Plan: Revert to Individual Docusaurus Configs

## Overview
Move away from shared-config abstraction back to individual, self-contained docusaurus.config.ts files for each site to eliminate configuration contamination and simplify the architecture.

## Current Problems with Shared-Config
- ❌ **State contamination**: Sites getting wrong configurations during builds
- ❌ **Complex debugging**: Hard to trace where contamination occurs
- ❌ **Module caching issues**: Shared state persists across builds
- ❌ **Factory function complexity**: Multiple abstraction layers
- ❌ **Reduced maintainability**: What was meant to help became a liability

## Benefits of Individual Configs
- ✅ **Complete isolation**: No shared state between sites
- ✅ **Easier debugging**: Each site is self-contained
- ✅ **Standard Docusaurus patterns**: Follow framework conventions
- ✅ **No contamination possible**: Each config is independent
- ✅ **Simpler mental model**: Easier for new developers to understand

## Implementation Strategy

### Phase 0: Baseline Capture (NEW)
Capture the current state of all sites before making any changes to ensure no regression.

**Objective**: Create verifiable snapshots of all sites in their current working state.

#### 0.1 Create Baseline Capture Script
**File**: `/scripts/capture-baseline-snapshots.ts`

**Features**:
- Build all sites in production mode
- Use Playwright to capture:
  - Full page screenshots (desktop & mobile viewports)
  - DOM snapshots (complete HTML structure)
  - Critical element data:
    - Page title
    - Navbar branding text
    - All URLs and href attributes
    - Footer content
    - Meta tags
  - CSS computed styles for key components
  - Network resources loaded
- Store snapshots in `/baseline-snapshots/[env]/[site]/`
- Create JSON manifest with:
  - Timestamp
  - Build environment
  - File checksums
  - Site metadata

#### 0.2 Create Validation Test Suite
**File**: `/e2e/config-migration-validation.spec.ts`

**Tests**:
- Visual regression (screenshot comparison with threshold)
- DOM structure integrity
- URL/baseUrl consistency
- Brand/title accuracy
- CSS class preservation
- No 404s on critical resources

#### 0.3 Capture Priority Sites First
**Order**:
1. **Portal** - Already approved, must not change
2. **ISBDM** - Already approved, must not change
3. All other sites for completeness

**Verification Checkpoint**: Show captured baselines for review before proceeding

### Phase 1: Create Template Config
Create a self-contained template docusaurus.config.ts based on the working pre-centralized ISBDM pattern.

**Template location**: `/scripts/scaffold-template/docusaurus.config.ts` (enhanced)

**Key features**:
- **No shared-config imports** - Completely self-contained
- **Inlined environment logic** - URLs/baseUrls directly in config
- **Based on working pattern** - Uses proven ISBDM structure
- **Clean Docusaurus patterns** - Standard framework conventions
- **@ifla/theme only** - Minimal dependency that still works

**Key changes from current template**:
```typescript
// REMOVE all shared-config.old imports
// REPLACE with direct environment logic:
const config: Config = {
  title: '__TITLE__',
  tagline: '__TAGLINE__',
  url: process.env.DOCS_ENV === 'local' ? '__URL_LOCAL__' :
       process.env.DOCS_ENV === 'preview' ? '__URL_PREVIEW__' :
       process.env.DOCS_ENV === 'development' ? '__URL_DEVELOPMENT__' :
       '__URL_PRODUCTION__',
  baseUrl: process.env.DOCS_ENV === 'local' ? '__BASEURL_LOCAL__' :
           process.env.DOCS_ENV === 'preview' ? '__BASEURL_PREVIEW__' :
           process.env.DOCS_ENV === 'development' ? '__BASEURL_DEVELOPMENT__' :
           '__BASEURL_PRODUCTION__',
  // ... rest of config
};
```

### Phase 1.5: Portal Integration (NEW)
Create admin interface for site creation and enhance scaffolding process.

#### 1.5.1 Portal Admin Form
**File**: `/portal/src/pages/manage/create-standard/index.tsx`

**Form Fields**:
- Code (lowercase, validated)
- Title (human-readable name)
- Tagline (description)
- Vocabulary prefix
- Number prefix (T/E dropdown)
- Profile filename
- Elements URI
- Elements profile filename
- GitHub edit URL (auto-generated with override)

**Features**:
- Live preview of generated config
- Validation against existing sites
- Submit creates PR via GitHub API

#### 1.5.2 Enhance Scaffold Script
**Update**: `/scripts/create-ifla-standard.ts`

**Enhancements**:
1. Add function export for API usage
2. Read SITE_CONFIG to get URL patterns
3. Replace URL/baseUrl placeholders with actual values:
   ```typescript
   // Read from SITE_CONFIG
   const urls = SITE_CONFIG[code];
   
   // Replace in template
   data = data
     .replace(/__URL_LOCAL__/g, urls.local.url)
     .replace(/__BASEURL_LOCAL__/g, urls.local.baseUrl)
     .replace(/__URL_PREVIEW__/g, urls.preview.url)
     // ... etc
   ```
4. Keep SITE_CONFIG as source of truth for URLs

#### 1.5.3 Backend API Endpoint
**Options**:
1. Serverless function (Vercel/Netlify)
2. GitHub Action triggered by issue
3. Local Node server for development

**Workflow**:
1. Validate form inputs
2. Update SITE_CONFIG with new site
3. Run enhanced scaffold script
4. Create PR with changes
5. Return status to frontend

### Phase 2: Site-by-Site Migration
Migrate each site individually to avoid breaking everything at once.

**Migration order**:
1. Start with `muldicat` (currently contaminated)
2. Move to `isbd` (suspected source of contamination)  
3. Migrate remaining sites: `LRM`, `FRBR`, `unimarc`
4. **Keep portal with shared-config** (it's the source of truth)

### Phase 3: Remove Shared-Config Dependencies
After all sites are migrated:
- Remove shared-config package
- Update package.json scripts
- Clean up dependencies
- Update documentation

## Detailed Implementation Plan

### Phase 1: Template Creation

#### 1.1 Create Base Template
**File**: `/scripts/scaffold-template/docusaurus.config.template.ts`

```typescript
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// Site-specific configuration - CUSTOMIZE FOR EACH SITE
const SITE_CONFIG = {
  // Basic site info
  title: '__SITE_TITLE__',
  tagline: '__SITE_TAGLINE__',
  favicon: 'img/favicon.ico',
  
  // URL configuration based on environment
  url: process.env.DOCS_ENV === 'local' ? 'http://localhost:__PORT__' :
       process.env.DOCS_ENV === 'preview' ? 'https://iflastandards.github.io' :
       process.env.DOCS_ENV === 'development' ? 'https://jonphipps.github.io' :
       'https://www.iflastandards.info',
       
  baseUrl: process.env.DOCS_ENV === 'local' ? '/__SITE_KEY__/' :
           process.env.DOCS_ENV === 'preview' ? '/standards-dev/__SITE_KEY__/' :
           process.env.DOCS_ENV === 'development' ? '/standards-dev/__SITE_KEY__/' :
           '/__SITE_KEY__/',
  
  // GitHub configuration
  organizationName: 'iflastandards',
  projectName: 'standards-dev',
  
  // Build configuration
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  onBrokenAnchors: 'warn',
  onDuplicateRoutes: 'warn',
};

// Theme configuration
const themeConfig: Preset.ThemeConfig = {
  navbar: {
    title: '__SITE_TITLE__',
    logo: {
      alt: 'IFLA Logo',
      src: 'img/logo-ifla_black.png',
    },
    items: [
      // Site-specific navbar items
      {
        type: 'docSidebar',
        sidebarId: 'tutorialSidebar',
        position: 'left',
        label: 'Introduction',
      },
      { to: '/blog', label: 'Blog', position: 'right' },
      { to: '/docs', label: 'Next', position: 'right' },
      // Language dropdown, search, etc.
    ],
  },
  footer: {
    style: 'dark',
    links: [
      {
        title: 'Resources',
        items: [
          { label: 'RDF Downloads', to: '/rdf' },
          { label: 'Sitemap', to: '/sitemap' },
        ],
      },
      {
        title: 'Community',
        items: [
          { label: 'IFLA Website', href: 'https://www.ifla.org/' },
          { label: 'IFLA Standards', href: 'https://www.ifla.org/programmes/ifla-standards/' },
        ],
      },
      {
        title: 'More',
        items: [
          { label: 'Blog', to: '/blog' },
          { label: 'GitHub', href: 'https://github.com/iflastandards/standards-dev' },
        ],
      },
    ],
    copyright: `Copyright © ${new Date().getFullYear()} International Federation of Library Associations and Institutions (IFLA)`,
  },
  // Other theme config...
};

const config: Config = {
  title: SITE_CONFIG.title,
  tagline: SITE_CONFIG.tagline,
  favicon: SITE_CONFIG.favicon,
  url: SITE_CONFIG.url,
  baseUrl: SITE_CONFIG.baseUrl,
  organizationName: SITE_CONFIG.organizationName,
  projectName: SITE_CONFIG.projectName,
  onBrokenLinks: SITE_CONFIG.onBrokenLinks,
  onBrokenMarkdownLinks: SITE_CONFIG.onBrokenMarkdownLinks,
  onBrokenAnchors: SITE_CONFIG.onBrokenAnchors,
  onDuplicateRoutes: SITE_CONFIG.onDuplicateRoutes,

  future: {
    v4: true,
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: '__GITHUB_EDIT_URL__',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: {
          showReadingTime: true,
          editUrl: '__GITHUB_EDIT_URL__',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    // Site-specific plugins
  ],

  themeConfig,
};

export default config;
```

#### 1.2 Create Customization Script
**File**: `/scripts/create-individual-config.ts`

Script to generate individual configs from template:
```typescript
// Script to create individual docusaurus.config.ts from template
// Usage: tsx scripts/create-individual-config.ts --site muldicat
```

### Phase 2: Site-by-Site Migration

#### 2.1 Migrate muldicat (First)
**Steps**:
1. Generate individual config for muldicat
2. Test that it works correctly
3. Verify no contamination in built output
4. Update build dependencies

**Expected outcome**: muldicat builds with correct MulDiCat branding

#### 2.2 Migrate isbd (Second)
**Reasoning**: isbd appears to be contaminating muldicat, so fix the source
**Verification**: Ensure isbd builds correctly and doesn't affect other sites

#### 2.3 Migrate remaining sites
**Order**: portal → ISBDM → LRM → FRBR → unimarc
**Process**: One at a time, test after each migration

### Phase 3: Cleanup

#### 3.1 Refactor Shared-Config Package
- **Keep for portal use** - Portal remains the source of truth
- **Keep SITE_CONFIG** - Used by portal and scaffolding
- **Remove factory functions** - No longer needed by sites
- **Update exports** - Only export what portal needs

#### 3.2 Update Build Scripts
- Remove shared-config from site build dependencies
- Keep for portal build only
- Update start scripts to only build @ifla/theme
- Simplify build:all script

#### 3.3 Update Documentation
- Update developer notes
- Document new portal-driven site creation
- Update new site setup guide
- Document the hybrid approach (portal centralized, sites isolated)

## Migration Checklist

### Pre-Migration
- [ ] Create baseline capture script
- [ ] Capture baseline snapshots of all sites
- [ ] Verify portal and ISBDM baselines are perfect
- [ ] Create validation test suite
- [ ] Update scaffold template to be self-contained
- [ ] Enhance scaffold script with URL inlining
- [ ] Create portal admin form
- [ ] Test template with new scaffold approach

### Per-Site Migration
- [ ] Run baseline capture for specific site
- [ ] Generate individual config using enhanced scaffold
- [ ] Remove all shared-config imports
- [ ] Inline all environment URLs
- [ ] Test development server (`start:site`)
- [ ] Test production build
- [ ] **Run baseline validation tests**
- [ ] Verify no visual regression
- [ ] Verify correct branding/URLs
- [ ] Check no contamination from other sites

### Post-Migration Cleanup
- [ ] Refactor shared-config (keep for portal only)
- [ ] Update package.json scripts
- [ ] Update nx.json workspace
- [ ] Update documentation
- [ ] Run full build:all test
- [ ] **Run full baseline validation suite**
- [ ] Verify complete isolation between sites

## Risk Assessment

### Low Risk
- **Template creation**: Safe, doesn't affect existing sites
- **Individual migrations**: Each site can be tested independently
- **Rollback**: Easy to revert individual sites if needed

### Medium Risk
- **Build script changes**: Need to update dependencies carefully
- **Theme package**: Still shared, but much simpler than current setup

### High Risk
- **None**: Migration is incremental and reversible

## Success Criteria

1. **No configuration contamination**: Each site builds with correct configuration
2. **Maintained functionality**: All current features continue to work
3. **Simpler debugging**: Issues are site-specific and easier to trace
4. **Standard patterns**: Follows conventional Docusaurus setup
5. **Easy maintenance**: New developers can understand and modify configs easily

## Timeline Estimate

- **Phase 1 (Template)**: 1-2 days
- **Phase 2 (Migration)**: 3-5 days (depending on site complexity)
- **Phase 3 (Cleanup)**: 1 day
- **Total**: 5-8 days

## Alternative Approaches Considered

1. **Fix shared-config contamination**: Too complex, root cause unclear
2. **Process isolation**: Would require major build system changes
3. **Hybrid approach**: Keep some shared utilities, but eliminate state

**Chosen approach reasoning**: Complete isolation is the most reliable solution for preventing contamination while being straightforward to implement and maintain.

## Conclusion

Moving to individual docusaurus.config.ts files will:
- **Solve the contamination problem definitively**
- **Simplify the architecture significantly** 
- **Follow standard Docusaurus patterns**
- **Make the codebase easier to maintain**

The slight increase in code duplication is acceptable given the elimination of a major architectural complexity and the critical bug it introduced.

## Progress Tracking

### Current Status: Phase 0 - Baseline Capture
**Date Started**: 2025-01-26

#### Completed
- [x] Created comprehensive plan with baseline strategy
- [x] Updated planning document with enhanced approach
- [x] Identified working pre-centralized ISBDM config as template base

#### Completed
- [x] Created baseline capture scripts
- [x] Built all sites successfully with cache clearing
- [x] **CRITICAL DISCOVERY**: Contamination confirmed in shared-config navbar functions

#### Current Findings (26 Jan 2025)
**Contamination Status**:
- ✅ **LRM** - Clean (no contamination)
- ✅ **ISBDM** - Clean (no contamination) 
- ❌ **Portal** - Contaminated when built after other sites
- ❌ **isbd** - Contaminated (fails clean individual build)
- ❌ **muldicat** - Contaminated 
- ❌ **FRBR** - Contaminated
- ❌ **unimarc** - Contaminated

**Root Cause**: Contamination occurs in shared-config navbar/theme functions, NOT just baseUrl issues. Individual clean builds of portal work, but isbd fails even individually, suggesting state persistence in shared functions.

#### Next Steps
1. Investigate shared-config navbar/theme factory functions for state contamination
2. Capture baseline snapshots including contaminated state
3. Create completely isolated configs based on LRM/ISBDM clean patterns

#### Verification Points
- **After baseline capture**: Review screenshots and data
- **After scaffold template update**: Test with dummy site
- **After first migration (muldicat)**: Full validation suite
- **After each subsequent migration**: Baseline comparison
