# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Development Workflows

### Essential Commands
- **Package manager**: Always use `pnpm` (never npm or yarn)
- **Build single site**: `pnpm build standards/{name}` or `nx build {name}`
- **Start dev server**: `pnpm start:{site}` (e.g., `pnpm start:portal`, `pnpm start:isbdm`)
- **Test execution**: `pnpm test --skip-nx-cache` (always skip nx cache for tests)
- **Type checking**: `pnpm typecheck`
- **Linting**: `pnpm lint`

### Testing Commands

#### NX Testing Commands
- **All unit tests**: `nx test` or `nx run-many --target=test --all`
- **Specific project tests**: `nx test @ifla/theme` or `nx test portal`
- **Affected tests only**: `nx affected --target=test`
- **Test with UI**: `nx test --ui` (opens Vitest UI)
- **Watch mode**: `nx test --watch`

#### E2E Testing Commands  
- **All E2E tests**: `nx run standards-dev:e2e` or `pnpm test:e2e`
- **Specific site E2E**: `nx run portal:e2e` or `nx run isbdm:e2e`
- **E2E with UI**: `nx run standards-dev:e2e:ui`
- **Site validation**: `nx run standards-dev:e2e:site-validation`
- **Environment-specific**: `nx run standards-dev:e2e:site-validation:production`

#### Build & Configuration Testing
- **Config validation**: `node scripts/test-site-builds.js --site all --env localhost --skip-build`
- **Full build tests**: `node scripts/test-site-builds.js --site all --env production`
- **Affected builds**: `nx run standards-dev:build-affected`
- **Build validation**: `nx run standards-dev:validate:builds`

#### Comprehensive Test Suites
### Testing Commands (5 Organized Groups)

The project uses a 5-group testing strategy optimized for efficiency and cost management:

#### Group 1: Selective Tests (On-Demand Development)
- **Individual unit tests**: `nx test portal`, `nx test @ifla/theme`, `nx test isbdm`
- **Affected tests**: `pnpm test` (now Nx-optimized: `nx affected --target=test --parallel=3`)
- **All unit tests**: `pnpm test:all` (parallel across all projects)
- **E2E by browser**: `pnpm test:e2e:chromium`, `pnpm test:e2e:firefox`, `pnpm test:e2e:mobile`
- **Debug E2E**: `pnpm test:e2e:debug`, `pnpm test:e2e:ui`
- **Visual regression**: `pnpm test:regression:visual`

#### Group 2: Comprehensive Tests (Test Everything)
- **Full suite**: `pnpm test:comprehensive` (typecheck + lint + test + build + E2E)
- **All unit tests**: `pnpm test:comprehensive:unit`
- **All E2E tests**: `pnpm test:comprehensive:e2e`
- **All builds**: `pnpm test:comprehensive:builds`

#### Group 3: Pre-Commit Tests (Git Hook - Fast Feedback)
- **Automatic**: Runs on `git commit`
- **Manual**: `pnpm test:pre-commit`
- **What runs**: `nx affected --targets=typecheck,lint,test --parallel=3` + config validation
- **Target**: < 60 seconds

#### Group 4: Pre-Push Tests (Git Hook - Deployment Focus)
- **Automatic**: Runs on `git push` (branch-aware)
- **Manual**: `pnpm test:pre-push`
- **Feature branch**: Fast validation only
- **Protected branch**: Full affected testing + builds
- **Target**: < 180 seconds

#### Group 5: CI Tests (Environment/Infrastructure Focus)
- **CI suite**: `pnpm test:ci` (deployment-critical tests only)
- **Connectivity**: `pnpm test:ci:connectivity` (external services)
- **Config validation**: `pnpm test:ci:config` (production environment)
- **Focus**: Environment-specific issues, not development tools

#### Core Development Commands (Nx-Optimized)
- **Lint**: `pnpm lint` (now: `nx affected --target=lint --parallel=3`)
- **TypeCheck**: `pnpm typecheck` (now: `nx affected --target=typecheck --parallel=3`)
- **Build affected**: `pnpm build:affected` (now: `nx affected --target=build --parallel=3`)

#### Performance Targets
- **Selective**: < 30s
- **Comprehensive**: < 300s  
- **Pre-commit**: < 60s
- **Pre-push**: < 180s
- **CI**: < 180s

### Build System Architecture
- **Nx monorepo** with workspace-level coordination
- **Docusaurus v3.8** for all site generation
- **Build targets**: Each site is an independent Nx project with its own build target
- **Theme package**: Custom `@ifla/theme` package provides shared components and configuration

### Site Configuration System
The project recently migrated (December 2024) from shared-config to **self-contained configurations**:

- **Configuration source**: `packages/theme/src/config/siteConfig.ts` (single source of truth)
- **Environment handling**: Set via `DOCS_ENV` environment variable (local, preview, development, production)
- **Inter-site navigation**: Use `SiteLink` component from theme, never hardcode URLs
- **Site generation**: Use `scripts/generate-individual-config.ts` for creating new site configs

### Critical Build Configuration
**REQUIRED for all sites** - Include this in every `docusaurus.config.ts`:
```typescript
future: {
  v4: true,
  experimental_faster: true,  // CRITICAL: Fixes static state contamination
},
```

This prevents cross-site contamination during builds where sites inherit each other's configurations.

## Project Architecture

### Monorepo Structure
```
standards-dev/
├── portal/                    # Main IFLA portal site
├── standards/{site}/          # Individual standard documentation sites
├── packages/theme/            # Custom Docusaurus theme with shared components
├── scripts/                   # Build automation and site generation scripts
└── developer_notes/           # Architecture documentation
```

### Site Types and Patterns
1. **Portal** (`portal/`): Main landing site with management interface
2. **Standards** (`standards/{name}/`): Individual standard documentation (ISBDM, LRM, FRBR, isbd, muldicat, unimarc)
3. **All sites** use the same theme package but have unique configurations

### Key Configuration Patterns

#### Site Config Generation
- **Template system**: `scripts/site-template.ts` generates complete site configurations
- **Individual configs**: Each site has a `site-config.json` defining its unique properties
- **Feature flags**: Support for custom sidebars, element redirects, RDF downloads, etc.

#### Environment and Navigation
- **Docusaurus customFields**: Only safe place for site-specific data (validated by Docusaurus schema)
- **Environment isolation**: DOCS_ENV only used in `docusaurus.config.ts`, stored in customFields for component access
- **SiteConfigMap**: Available to all components via Docusaurus context for inter-site navigation

## Development Guidelines

### Testing Strategy
- **Pre-commit**: TypeScript, ESLint, unit tests run automatically
- **Pre-push**: Build regression tests (branch-aware) run automatically  
- **Test runner**: Vitest for unit/integration tests
- **E2E testing**: Puppeteer for interface testing when needed
- **Always test before commits**: Tests must pass before offering to commit

### Content and Navigation Rules
- **Never hardcode URLs**: Always use SiteLink component or configuration-based URLs
- **Broken links categorization**:
  - *Acceptable*: Links within correct baseURL to non-existent pages (future content)
  - *Problematic*: Links pointing to wrong baseURL/site (configuration errors)

### Complex Project Management
- **Planning approach**: Break complex projects into epics and tasks
- **Progress tracking**: Use TodoWrite/TodoRead tools for systematic tracking
- **Documentation**: Always consult Docusaurus v3.8 docs during planning

### Search and Code Discovery
- **Search priority**: Search `/Users/jonphipps/Code/IFLA/standards-dev` first, then git history/branches, then `/Users/jonphipps/Code/IFLA/`
- **Site URL references**: Use `/Users/jonphipps/Code/IFLA/standards-dev/packages/theme/src/config/siteConfig.ts` for URL configuration
- **Context7 integration**: Always use Context7 for code examples at session start

### Deployment and Build Management
- **Server coordination**: Ask user to start servers/builds rather than waiting for timeouts
- **Environment awareness**: Warn when environment isn't set to project root
- **Nx optimization**: Use `--skip-nx-cache` for reliable test runs

## Vocabulary and Content Management

### RDF and Vocabulary Systems
- **Vocabulary generation**: `pnpm vocabulary:create` for creating vocabulary sheets
- **RDF export**: `pnpm vocab:release` for RDF generation
- **CSV validation**: Vocabulary tables support CSV profile validation

### Content Validation
- **Site links**: `pnpm validate:site-links`
- **Navigation**: `pnpm validate:navigation` 
- **Environment URLs**: `pnpm validate:env-urls`

## Site-Specific Features

### ISBDM (Complex Configuration)
- **Custom sidebar generator**: Filters out index.mdx files automatically
- **Element redirects**: Redirects `/docs/elements/{id}` from legacy paths
- **Complex navbar**: Multi-level dropdown navigation structure

### Portal (Management Interface)
- **Site management**: Central dashboard for all IFLA sites
- **GitHub integration**: Direct links to projects, issues, PRs
- **Team management**: Organization-level tools

## Static State Contamination (Critical Issue)

### Problem
Multi-site builds can cause sites to inherit configuration from previously built sites, resulting in incorrect navigation links.

### Root Cause
Module-level static state contamination in shared modules, occurring regardless of concurrency level.

### Solution
Adding `experimental_faster: true` to Docusaurus `future` config completely fixes the issue by enabling better module isolation.

### Evidence Pattern
- **Acceptable broken links**: `/site/intro` (correct baseURL, missing page)
- **Problematic broken links**: `/wrong-site/intro` (wrong baseURL, configuration contamination)

## Testing Infrastructure

### Test Framework Overview
- **Unit/Integration**: Vitest with React Testing Library (446+ tests)
- **E2E**: Playwright across multiple browsers and environments  
- **Build Testing**: Custom Node.js scripts for configuration and build validation
- **Visual Regression**: Playwright-based screenshot comparison

### Unit Tests (Vitest + RTL)

#### NX Commands
```bash
# All projects unit tests
nx test
nx run-many --target=test --all

# Specific project testing
nx test @ifla/theme              # Theme package tests
nx test portal                   # Portal site tests  
nx test isbdm                    # ISBDM standard tests

# Development workflow
nx test --watch                  # Watch mode
nx test --ui                     # Open Vitest UI
nx affected --target=test        # Only test affected projects
```

#### Configuration: `vite.config.ts`
- **Environment**: jsdom with comprehensive Docusaurus mocks
- **Setup**: `packages/theme/src/tests/setup.ts` with testing-library/jest-dom
- **Aliases**: Complete Docusaurus module aliasing in `resolve.alias`
- **CI Optimizations**: Process forks, timeout increases, retry logic

#### Key Test Areas
- **Component Testing**: VocabularyTable, ElementReference, SiteLink components
- **Configuration Testing**: StandardSiteFactory isolation, environment handling
- **Integration Testing**: Cross-component workflows, API integrations
- **Script Testing**: Build scripts, vocabulary comparison tools

### E2E Tests (Playwright)

#### NX E2E Targets
```bash
# Workspace-level E2E
nx run standards-dev:e2e              # Full E2E suite
nx run standards-dev:e2e:ui           # Interactive mode
nx run standards-dev:e2e:site-validation   # Site validation only

# Project-specific E2E  
nx run portal:e2e                     # Portal smoke tests
nx run isbdm:e2e                      # ISBDM + vocabulary tests

# Environment-specific validation
nx run standards-dev:e2e:site-validation:production
nx run standards-dev:e2e:site-validation:preview
```

#### Multi-Browser Testing
```bash
# Run across all browsers (Chromium, Firefox, WebKit, Mobile)
npx playwright test

# Specific browser projects
npx playwright test --project=chromium
npx playwright test --project="Mobile Chrome"

# Debug and development
npx playwright test --debug          # Step through tests
npx playwright test --headed         # Watch execution
npx playwright test --ui             # Interactive UI
```

#### Configuration: `playwright.config.ts`
- **Auto-server**: Starts `pnpm start:all` for local development
- **CI Optimization**: Sequential execution, retry logic
- **Multi-device**: Desktop and mobile viewport testing
- **Reporting**: HTML reports with failure artifacts

### Build & Configuration Testing

#### Site Build Validation
```bash
# NX build testing
nx run standards-dev:build-all        # All sites parallel build
nx run standards-dev:build-affected   # Only affected sites
nx run standards-dev:validate:builds  # Post-build validation

# Script-based testing
node scripts/test-site-builds.js --site all --env production
node scripts/test-site-builds.js --site portal --env localhost --skip-build
```

#### Comprehensive Test Suites
```bash
# Pre-commit suite (automatic)
pnpm test:pre-commit
# ✅ TypeScript checking
# ✅ ESLint validation  
# ✅ Unit tests
# ✅ Configuration validation

# Regression testing
nx run standards-dev:regression:full
# ✅ All checks above + builds + E2E

nx run standards-dev:regression:fast  
# ✅ Affected-only testing for feature branches
```

### Advanced Testing Features

#### Performance & Memory Optimization
- **CI Stability**: Reduced concurrency, process isolation
- **Custom Cache**: Vitest cache in `./.vitest-cache`
- **Memory Monitoring**: Heap usage tracking in CI
- **Retry Logic**: Automatic retry for flaky tests

#### Visual Regression Testing
```bash
# Screenshot comparison
npx playwright test e2e/visual-regression.spec.ts

# Update baselines when UI changes
npx playwright test e2e/visual-regression.spec.ts --update-snapshots
```

#### Test File Organization
```
packages/theme/src/tests/
├── components/                    # Component unit tests
├── config/                        # Configuration tests  
├── scripts/                       # Build script tests
├── fixtures/                      # Test data and mocks
├── __mocks__/                     # Docusaurus mocks
└── setup.ts                       # Test environment setup

e2e/
├── site-validation.spec.ts        # Comprehensive site validation
├── visual-regression.spec.ts      # UI screenshot tests
└── portal-smoke.spec.ts           # Portal-specific tests
```

### Git Hooks and Automated Testing

#### Pre-commit Hook (`.husky/pre-commit`)
**Fast feedback** - runs automatically on every `git commit`:
```bash
# TypeScript type checking
pnpm typecheck

# ESLint code quality validation
pnpm lint --quiet

# Unit/integration tests
pnpm test --run

# Configuration validation (no builds)
node scripts/test-site-builds.js --site all --env local --skip-build
```

#### Pre-push Hook (`.husky/pre-push-optimized`)
**Branch-aware testing** - runs automatically on `git push`:

**Protected branches (main/dev)**:
- Complete regression testing with E2E
- Full production build validation
- Cross-site link verification

**Feature branches**:
- NX affected testing only
- Fast configuration validation
- Representative build testing

#### NX Test Targets by Project
Each project includes standardized targets:
- **`test`**: Vitest unit/integration tests
- **`typecheck`**: TypeScript compilation validation
- **`build`**: Production build verification
- **`e2e`**: Playwright end-to-end tests (where applicable)

### Testing Best Practices

#### Development Workflow
```bash
# Quick development validation (< 30 seconds)
nx affected --target=test --parallel=3
pnpm typecheck && pnpm lint --quiet

# Pre-commit equivalent (manual)
pnpm test:pre-commit

# Comprehensive testing (2-5 minutes)
nx run standards-dev:regression:full
```

#### CI/CD Integration
- **Parallel execution**: Matrix builds across all sites
- **Smart caching**: NX workspace cache optimization
- **Artifact preservation**: Failed builds saved for debugging
- **Environment testing**: Multi-environment validation

#### Test File Standards
```
# Component tests
packages/theme/src/tests/components/VocabularyTable/
├── VocabularyTable.test.tsx
├── LanguageSelector.test.tsx
└── fixtures/

# Integration tests  
packages/theme/src/tests/config/
├── standardSiteFactory.test.ts
└── siteConfigCore.test.ts

# E2E tests
e2e/
├── site-validation.spec.ts
├── portal-smoke.spec.ts
└── vocabulary-functionality.spec.ts
```