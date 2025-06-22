# Environment-Based Configuration Refactor Plan

## Overview
Transform the current centralized configuration system into a layered approach using site-specific `.env` files, shared base configurations, and deep merging to balance simplicity and flexibility in the Nx monorepo.

## Architecture

### 1. Three-Layer Configuration Model
```
Layer 1: Shared Base Config (libs/shared-config) - Pure functions & JSON
Layer 2: Environment Variables (.env files per site) - Deployment specifics
Layer 3: Site-Specific Overrides (in docusaurus.config.ts) - Custom needs
```

### 2. Directory Structure
```
libs/
└── shared-config/
    └── src/
        ├── createBaseConfig.ts     # Factory function for base config
        ├── createThemeConfig.ts    # Factory function for theme config
        ├── createPluginConfig.ts   # Factory function for plugins
        ├── createFooterConfig.ts   # Factory function for footer
        ├── utils/                  # Utility functions
        │   ├── loadEnvConfig.ts    # Load env files
        │   └── getSiteUrl.ts       # URL building utilities
        ├── defaults.json           # Static default values
        ├── types.ts                # TypeScript interfaces
        └── index.ts                # Exports

portal/
├── .env.local          # localhost development
├── .env.development    # dev environment
├── .env.preview        # preview/staging
├── .env.production     # production
└── docusaurus.config.ts

standards/muldicat/
├── .env.local
├── .env.development
├── .env.preview
├── .env.production
└── docusaurus.config.ts
```

### 3. Environment Variables Pattern
```env
# Core site configuration
SITE_URL=http://localhost:3000
SITE_BASE_URL=/portal/
SITE_PORT=3000
SITE_TITLE=IFLA Standards Portal
SITE_TAGLINE=International Federation of Library Associations

# GitHub configuration
GITHUB_EDIT_URL=https://github.com/iflastandards/standards-dev/tree/main/portal/
GITHUB_REPO_URL=https://github.com/iflastandards/standards-dev

# RDF/Vocabulary (standards sites only)
VOCABULARY_PREFIX=ifla
VOCABULARY_NUMBER_PREFIX=T
VOCABULARY_URI=https://www.iflastandards.info/elements
VOCABULARY_CLASS_PREFIX=class
VOCABULARY_PROPERTY_PREFIX=prop
```

### 4. Shared Configuration (Pure Functions)
```typescript
// libs/shared-config/src/createBaseConfig.ts
export function createBaseConfig(options: BaseConfigOptions) {
  return {
    title: options.title,
    tagline: options.tagline,
    url: options.url,
    baseUrl: options.baseUrl,
    projectName: options.projectName,
    // Static values
    future: { experimental_faster: false, v4: true },
    favicon: '/img/favicon.ico',
    organizationName: 'iflastandards',
    trailingSlash: false,
    onBrokenLinks: 'warn' as const,
    onBrokenMarkdownLinks: 'warn' as const,
    onBrokenAnchors: 'warn' as const,
    onDuplicateRoutes: 'warn' as const,
    i18n: {
      defaultLocale: 'en',
      locales: ['en'],
    },
  };
}

// libs/shared-config/src/createThemeConfig.ts
export function createThemeConfig(options: ThemeConfigOptions) {
  return {
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: options.navbarTitle,
      logo: {
        alt: 'IFLA Logo',
        src: 'img/logo-ifla_black.png',
      },
      items: options.navbarItems || [],
    },
    footer: {
      style: 'dark',
      links: options.footerLinks || [],
      copyright: options.copyright || `Copyright © ${new Date().getFullYear()} IFLA`,
    },
  };
}
```

### 5. Site Configuration with Deep Merge
```typescript
// portal/docusaurus.config.ts
import 'dotenv/config';
import type { Config } from '@docusaurus/types';
import { deepmerge } from 'deepmerge-ts';
import { createBaseConfig, createThemeConfig } from '@ifla/shared-config';
import navbarItems from './navbar';

const config: Config = deepmerge(
  createBaseConfig({
    title: process.env.SITE_TITLE!,
    tagline: process.env.SITE_TAGLINE!,
    url: process.env.SITE_URL!,
    baseUrl: process.env.SITE_BASE_URL!,
    projectName: 'portal',
  }),
  {
    // Site-specific overrides
    onBrokenAnchors: 'ignore', // Portal-specific
    
    presets: [
      [
        'classic',
        {
          docs: {
            sidebarPath: './sidebars.ts',
            editUrl: process.env.GITHUB_EDIT_URL,
          },
          blog: {
            showReadingTime: true,
            editUrl: process.env.GITHUB_EDIT_URL,
          },
          theme: {
            customCss: './src/css/custom.css',
          },
        },
      ],
      '@ifla/preset-ifla',
    ],
    
    themeConfig: createThemeConfig({
      navbarTitle: process.env.SITE_TITLE!,
      navbarItems: [
        ...navbarItems,
        // Note: standardsDropdown removed as requested
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          type: 'search',
          position: 'right',
        },
      ],
      footerLinks: [
        // Site-specific footer configuration
      ],
    }),
  }
);

export default config;
```

## Test & Validation Script Updates

### Core Test Updates
```typescript
// packages/theme/src/tests/config/siteConfig.test.ts
import { describe, it, expect } from 'vitest';
import { loadEnvConfig, buildSiteUrl } from '@ifla/shared-config';

describe('getSiteUrl', () => {
  it('should load from env files', () => {
    const env = loadEnvConfig('portal', 'local');
    const url = buildSiteUrl(env, '/docs/intro');
    expect(url).toBe('http://localhost:3000/portal/docs/intro');
  });
});
```

### Build Regression Tests
```javascript
// scripts/test-site-builds.js
function loadSiteEnvConfig(siteKey, environment) {
  const envFile = path.join(getSiteDir(siteKey), `.env.${environment}`);
  return dotenv.parse(fs.readFileSync(envFile));
}

function discoverSites() {
  // Scan portal and standards directories
  const sites = ['portal'];
  const standardsDir = path.join(__dirname, '../standards');
  fs.readdirSync(standardsDir).forEach(dir => {
    if (fs.existsSync(path.join(standardsDir, dir, 'docusaurus.config.ts'))) {
      sites.push(dir);
    }
  });
  return sites;
}
```

### Validation Script Updates

#### validate-environment-urls.js
```javascript
function loadSiteConfig(siteKey, environment) {
  const envFile = path.join(getSiteDir(siteKey), `.env.${environment}`);
  const env = dotenv.parse(fs.readFileSync(envFile));
  return {
    url: env.SITE_URL,
    baseUrl: env.SITE_BASE_URL,
    port: env.SITE_PORT
  };
}
```

#### build-with-env.js
```javascript
const envMap = {
  'localhost': 'local',
  'preview': 'preview',
  'production': 'production',
  'dev': 'development'
};

execSync(`pnpm run ${buildScript}`, {
  env: {
    ...process.env,
    NODE_ENV: envMap[env] || 'production'
  }
});
```

### GitHub Actions Updates
```yaml
# .github/workflows/test-site-builds.yml
- name: Build Site
  run: |
    cd ${{ matrix.site-dir }}
    NODE_ENV=${{ matrix.environment }} pnpm build
```

## Regression Test Categories

### Unit Tests (446+ tests)
- Update imports from siteConfigCore to shared-config
- Add tests for env file loading
- Add tests for deep merge functionality
- Test factory functions with various inputs

### Integration Tests
- Test complete site configurations
- Verify env file precedence
- Test cross-site URL generation
- Validate plugin/theme merging

### Build Tests
- Update test-site-builds.js to discover sites dynamically
- Load configurations from env files
- Test all environments for each site
- Verify no cross-contamination

### E2E Tests
- Update portal E2E tests to use env configs
- Test navigation across sites
- Verify environment-specific URLs
- Check for hardcoded localhost URLs

### Validation Scripts
- validate-environment-urls.js - Load from env files
- validate-navigation-urls.js - Remove siteConfigCore dependency
- validate-site-links.js - Use env-based configuration
- check-portal-homepage-links.mjs - Update imports and URL building

## Migration Steps

1. Create libs/shared-config with Nx
2. Install dependencies: `dotenv`, `deepmerge-ts`
3. Implement shared config factory functions
4. Create utility functions for env loading
5. **Update unit tests to use new system**
6. Create .env files for portal (test site)
7. Update portal's docusaurus.config.ts
8. **Run full regression test suite**
9. Update validation scripts to use env files
10. **Test all validation scripts**
11. Test portal with all environments
12. **Verify build tests still work**
13. Document the new pattern
14. Roll out to remaining sites
15. **Run regression tests after each site**
16. Update build scripts
17. **Final full regression test**
18. Remove old configuration system
19. **Verify CI/CD still passes**
20. Update documentation

## Test Automation Strategy

### Pre-commit (unchanged)
- TypeScript checking
- ESLint validation
- Unit tests (updated for new config)
- Config validation (using env files)

### Pre-push (enhanced)
- Build tests use env files
- Validation scripts use new config
- E2E tests verify env-specific URLs

### CI/CD (updated)
- Set NODE_ENV appropriately
- Verify env files are loaded
- Test matrix across environments

## Backward Compatibility During Migration
```typescript
// Temporary compatibility layer
export function getSiteUrl(site, path, env) {
  // Try new system first
  try {
    const envConfig = loadEnvConfig(site, env);
    return buildSiteUrl(envConfig, path);
  } catch {
    // Fall back to old system
    return oldGetSiteUrl(site, path, env);
  }
}
```

## Regression Test Coverage

| Test Category | Files to Update | Purpose |
|--------------|-----------------|---------|
| **Config Tests** | siteConfig.test.ts, standardSiteFactory.test.ts | Test new env loading |
| **Build Tests** | test-site-builds.js, build-regression-testing.md | Use env files |
| **Validation** | All validate-*.js scripts | Remove siteConfigCore |
| **E2E Tests** | Portal E2E, sensory-test-vocabulary.e2e.test.ts | Verify URLs |
| **Unit Tests** | Component tests that use config | Update imports |
| **Scripts** | All scripts using site config | Use env files |

## Success Criteria
- All 446+ unit tests pass
- Build regression tests work with env files
- Validation scripts function correctly
- E2E tests pass in all environments
- No cross-site contamination
- CI/CD pipeline remains green
- Pre-commit/pre-push hooks work
- Performance remains the same or better

## Risk Mitigation
- Keep old system during migration
- Test each site thoroughly
- Run regression tests frequently
- Have rollback plan ready
- Document all changes
- Test in feature branch first

## Files to Remove (After Migration)
- `/packages/theme/src/config/siteConfigCore.ts`
- `/packages/theme/src/config/siteConfig.ts`
- `/packages/theme/src/config/siteConfig.server.ts`
- `getCurrentEnv()` function and DOCS_ENV usage
- `standardsDropdown` from all navbar configurations

## Key Benefits
- **Simplicity**: 80% of config is centralized in shared functions
- **Flexibility**: Sites can override anything via deep merge
- **No Contamination**: Each site has isolated env configuration
- **Type Safety**: Full TypeScript support
- **Nx Compatibility**: Pure functions ensure perfect caching
- **Standard Pattern**: Uses industry-standard .env files
- **Easy Testing**: Scripts work with env files directly

## Documentation Requirements
Create comprehensive documentation covering:
- How to add a new site
- How to override shared configurations
- Environment variable naming conventions
- How validation scripts work with env files
- CI/CD environment setup

## Notes from Discussion
- Shared directory must contain only pure, cacheable content (functions and JSON)
- Place .env files in each site directory (Nx monorepo best practice)
- Remove standardsDropdown navigation as requested
- Ensure all test and validation scripts are updated
- Consider regression tests at every step of migration