# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Development Workflows

### Essential Commands
- **Package manager**: Always use `pnpm` (never npm or yarn)
- **Build single site**: `nx build {name}` (e.g., `nx build portal`, `nx build isbdm`)
- **Start dev server**: `nx start {site}` or `nx run {site}:start:robust` (with port cleanup)
- **Serve built site**: `nx serve {site}` or `nx run {site}:serve:robust` (with port cleanup)
- **Test execution**: `pnpm test` (nx affected with parallel execution)
- **Type checking**: `pnpm typecheck` (nx affected with parallel execution)
- **Linting**: `pnpm lint` (nx affected with parallel execution)

### Site Scaffolding Commands
- **Create new site**: `pnpm tsx scripts/scaffold-site.ts --siteKey=newsite --title="New Standard" --tagline="A new IFLA standard"`
- **Template location**: Complete site template in `scripts/scaffold-template/` with ISBD-matching structure
- **Generated files**: `docusaurus.config.ts`, `project.json`, all content pages, and CompactButton component
- **Features**: Tabbed overview pages, comprehensive documentation structure, Nx integration
- **Documentation**: See `developer_notes/current-scaffolding-plan.md` for complete system details

### Nx Workflow Benefits and Optimization
- **Smart Caching**: Nx caches build outputs, test results, and lint results locally and in the cloud
- **Affected Detection**: Only builds/tests projects that have changed or are affected by changes
- **Parallel Execution**: Runs tasks in parallel across multiple CPU cores for optimal performance
- **Distributed Execution**: CI jobs can run across multiple agents for faster completion
- **Task Pipeline Configuration**: `dependsOn` rules ensure correct build order (theme builds first, then sites in parallel)
- **Build Analytics**: Track performance and optimization opportunities

### Performance Optimization Guidelines
- **Use Nx commands**: Prefer `nx build portal` over `pnpm build:portal` for better caching
- **Affected builds**: Use `nx affected --target=build` for faster builds in PRs
- **Robust port cleanup**: Use `:robust` variants (e.g., `nx run portal:start:robust`) for automatic port conflict resolution
- **Cache management**: Nx automatically handles cache invalidation based on file changes
- **Parallel testing**: Use `nx run-many --target=test --all` for parallel test execution across all projects

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

#### Deployment Debugging
- Always check the nx-mcp deployment logs when debugging deployment problems


#### Build & Configuration Testing
- **Config validation**: `node scripts/test-site-builds.js --site all --env local --skip-build`
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
- **What runs**: `nx affected --targets=typecheck,lint,test:unit --parallel=3` + config validation
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

#### Standardized Test Infrastructure
All projects now have consistent test targets:
- **`test`**: Full test suite for the project
- **`test:unit`**: Unit tests only (fast feedback, excludes external dependencies)
- **`test:integration`**: Integration tests only (external APIs, file system, CLI tools)

Example usage:
```bash
# Run all tests for affected projects
nx affected --target=test --parallel=3

# Run only unit tests for fast feedback
nx affected --target=test:unit --parallel=3

# Run integration tests for comprehensive validation
nx run-many --target=test:integration --all
```

### Build System Architecture
- **Nx monorepo** with workspace-level coordination and optimal caching
- **Docusaurus v3.8** for all site generation
- **Build targets**: Each site is an independent Nx project with its own build target
- **Theme package**: Custom `@ifla/theme` package provides shared components and configuration

#### Enhanced Nx Dependency Management
- **Automatic theme rebuilds**: All sites depend on `@ifla/theme` and rebuild when theme changes
- **Input patterns**: `docusaurus` and `docusaurus-no-theme` inputs optimize cache invalidation
- **Implicit dependencies**: Sites have `"implicitDependencies": ["@ifla/theme"]` for proper dependency tracking
- **Affected commands**: `nx affected` automatically detects which projects need rebuilding based on file changes
- **Parallel execution**: Up to 6 concurrent processes for optimal performance
- **Cache optimization**: Nx caching reduces build times by ~70% in CI environments

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
- **Template system**: `scripts/site-template.ts` and complete scaffold template in `scripts/scaffold-template/`
- **Individual configs**: Generated from template files with placeholder replacement
- **Rich content structure**: Tabbed overview pages, comprehensive documentation, CompactButton components
- **Configuration templates**: `docusaurus.config.ts.template` and `project.json.template` for dynamic generation
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
- **E2E testing**: Playwright for interface testing when needed
- **Always test before commits**: Tests must pass before offering to commit

### Scaffolding and Templates
- **CRITICAL**: Always check and update scaffolding templates when making configuration changes that affect all sites
- **Template system**: Complete site template in `scripts/scaffold-template/` with rich content structure
- **Template files**: `docusaurus.config.ts.template`, `project.json.template`, and complete directory structure
- **Key components**: CompactButton component, tabbed overview pages, comprehensive documentation structure
- **Scaffolding script**: `scripts/scaffold-site.ts` generates new sites from template with placeholder replacement
- **Template structure**: Matches ISBD pattern with Element Sets, Value Vocabularies, and Documentation tabs
- **Pattern**: When fixing issues in existing sites, verify the scaffold template doesn't propagate the same issue to future sites
- **Component consistency**: Template includes reusable CompactButton and navigation patterns
- **Example**: If removing test targets from existing sites, also remove from site template
- **Documentation**: See `developer_notes/current-scaffolding-plan.md` for complete system documentation

## Test Placement Decision Tree (CRITICAL - Reference When Creating Tests)

**ALWAYS use this decision tree when creating new tests to ensure they run in the correct scenario:**

### 🎯 **Where to Put New Tests**

```
📁 Test Placement Decision Tree
│
├── 🔧 **Unit Tests** (Pure logic, no external deps)
│   └── 📍 Location: `packages/theme/src/tests/components/ComponentName.test.tsx`
│   └── 🎯 Target: Runs in `test:unit` (pre-commit) + `test` (comprehensive)
│   └── ✅ Examples: Component rendering, pure functions, config parsing
│
├── 🔗 **Integration Tests** (External APIs, file system, CLI tools)
│   ├── 📍 Scripts: `packages/theme/src/tests/scripts/`
│   ├── 📍 External Services: `packages/theme/src/tests/deployment/`
│   └── 🎯 Target: Only runs in `test:integration` (comprehensive testing)
│   └── ✅ Examples: Google Sheets API, file operations, CLI execution
│
├── 🌐 **E2E Tests** (Browser automation, full user workflows)
│   ├── 📍 Workspace: `/e2e/site-validation.spec.ts`
│   ├── 📍 Site-specific: `standards/SITE/e2e/feature.e2e.test.ts`
│   └── 🎯 Target: `nx run standards-dev:e2e` or `nx run SITE:e2e`
│   └── ✅ Examples: Navigation, form submission, visual checks
│
└── 🎯 **Performance/Visual** (Screenshots, load testing)
    └── 📍 Location: `/e2e/visual-regression-enhanced.spec.ts`
    └── 🎯 Target: Specialized E2E runs
```

### 🚦 **Quick Decision Questions**

**Ask yourself when creating a test:**

1. **Does it make network calls or use external APIs?** → Integration test
2. **Does it render in a browser or test user flows?** → E2E test  
3. **Does it test component logic in isolation?** → Unit test
4. **Does it validate file system operations?** → Integration test
5. **Does it test configuration parsing only?** → Unit test

### 📋 **Test Coverage by Scenario**

| Scenario | Unit Tests | Integration Tests | E2E Tests | When It Runs |
|----------|------------|-------------------|-----------|--------------|
| **Pre-commit** | ✅ Fast feedback | ❌ Too slow | ❌ Too slow | Every `git commit` |
| **Pre-push** | ✅ | ✅ | ❌ | Every `git push` |  
| **Comprehensive** | ✅ | ✅ | ✅ | Manual/CI full runs |
| **Affected** | ✅ Only changed | ✅ Only changed | ❌ | Development workflow |
| **CI** | ✅ | ✅ | ✅ | Production deployments |

### 🎪 **Examples of Correct Placement**

```typescript
// ✅ Unit Test - packages/theme/src/tests/components/
describe('VocabularyTable', () => {
  it('renders headers correctly', () => {
    // Tests pure component logic
  });
});

// ✅ Integration Test - packages/theme/src/tests/scripts/  
describe('Google Sheets API', () => {
  it('fetches vocabulary data', async () => {
    // Tests external API integration
  });
});

// ✅ E2E Test - /e2e/
test('user can navigate between sites', async ({ page }) => {
  // Tests full browser workflows
});
```

**Key principle**: Unit tests run fast in pre-commit for immediate feedback, integration tests run in comprehensive scenarios, E2E tests validate complete user experiences.

### 🛠️ **Test Utilities**

For consistent directory handling in tests, use the `workspaceUtils` helper:

```typescript
import { findWorkspaceRoot, getScriptPath, setupTestPaths } from '../utils/workspaceUtils';

// Get workspace root reliably (instead of process.cwd())
const workspaceRoot = findWorkspaceRoot();

// Get path to scripts
const scriptPath = getScriptPath('vocabulary-comparison.mjs');

// Get common test paths
const { workspaceRoot, scriptsDir, tmpDir, packagesDir, themeDir } = setupTestPaths();
```

**Always use `workspaceUtils` instead of `process.cwd()` in integration tests** to ensure consistent directory resolution regardless of test execution context.

### Content and Navigation Rules
- **Never hardcode URLs**: Always use SiteLink component or configuration-based URLs
- **Broken links categorization**:
  - *Acceptable*: Links within correct baseURL to non-existent pages (future content)
  - *Problematic*: Links pointing to wrong baseURL/site (configuration errors)

### Complex Project Management
- **Planning approach**: Break complex projects into epics and tasks
- **Progress tracking**: Use TodoWrite/TodoRead tools for systematic tracking
- **Documentation**: Always consult Docusaurus v3.8 docs during planning

### API Documentation References

**Core Docusaurus v3.8 Documentation**:
- **Main Documentation**: https://docusaurus.io/docs - Core concepts, configuration, and guides
- **CLI Reference**: https://docusaurus.io/docs/cli - Command-line interface documentation
- **API Reference**: https://docusaurus.io/docs/api/docusaurus-config - Configuration API details
- **Plugin APIs**: https://docusaurus.io/docs/api/plugins - Plugin development and configuration
- **Theme APIs**: https://docusaurus.io/docs/api/themes - Theme customization and components

**Styling and UI Framework**:
- **Infima CSS Framework**: https://infima.dev/docs/ - Design system and CSS utilities used by Docusaurus
- **Styling Guide**: https://docusaurus.io/docs/styling-layout - Layout and styling best practices

**Community Resources**:
- **Docusaurus Community**: https://docusaurus.community/ - Community plugins and resources
- **Awesome Docusaurus**: https://github.com/weecology/awesome-docusaurus - Curated list of resources
- **Official Docusaurus Website Source**: https://github.com/facebook/docusaurus/tree/main/website - Real-world implementation patterns and configurations

**Development Tools**:
- **TypeScript Support**: https://docusaurus.io/docs/typescript-support - TypeScript configuration and usage
- **MDX Documentation**: https://mdxjs.com/docs/ - MDX syntax and component integration
- **React Documentation**: https://react.dev/reference/react - React APIs for custom components
- **FontAwesome React**: https://docs.fontawesome.com/web/use-with/react - Icon integration for React components

**UI Components**:
- **MUI X Data Grid**: https://mui.com/x/react-data-grid/ - Advanced data grid component with sorting, filtering, and pagination
- **MUI X Tree View**: https://mui.com/x/react-tree-view/ - Tree view component for hierarchical data display
- **Base UI React**: https://base-ui.com/react/overview/quick-start - Headless React components for building custom UIs

#### API Documentation Usage Guidelines

**For Development Planning**:
1. **Configuration Changes**: Always reference https://docusaurus.io/docs/api/docusaurus-config before modifying `docusaurus.config.ts`
2. **Plugin Integration**: Check https://docusaurus.io/docs/api/plugins for plugin APIs and lifecycle methods
3. **Theme Customization**: Use https://docusaurus.io/docs/api/themes for theme component overrides
4. **Component Development**: Reference React docs for hooks and component patterns
5. **Icon Integration**: Use https://docs.fontawesome.com/web/use-with/react for FontAwesome icon implementation in React components
6. **Data Grid Components**: Use https://mui.com/x/react-data-grid/ for advanced table functionality with sorting, filtering, and pagination
7. **Tree View Components**: Use https://mui.com/x/react-tree-view/ for hierarchical data display and navigation
8. **Custom UI Components**: Use https://base-ui.com/react/overview/quick-start for headless components when building custom interfaces

**For Code Implementation**:
1. **Version Compatibility**: Always verify Docusaurus version (≥3.8) before suggesting APIs
2. **TypeScript Types**: Prefer official TypeScript definitions from Docusaurus packages
3. **Best Practices**: Follow patterns from official documentation examples
4. **Performance**: Reference optimization guides for build and runtime performance

**For Troubleshooting**:
1. **Error Resolution**: Check official troubleshooting guides first
2. **Migration Issues**: Use migration guides for version updates
3. **Community Solutions**: Search community resources for common issues
4. **GitHub Issues**: Reference official Docusaurus GitHub for known issues

#### Context7 MCP Integration
- **Real-time Examples**: Use Context7 MCP for live code examples from Docusaurus community plugins
- **Type Definitions**: Prefer Context7 over static docs for up-to-date TypeScript types
- **Plugin Discovery**: Use Context7 to find and evaluate community plugins

### Search and Code Discovery
- **Search priority**: Search `/Users/jonphipps/Code/IFLA/standards-dev` first, then git history/branches, then `/Users/jonphipps/Code/IFLA/`
- **Site URL references**: Use `/Users/jonphipps/Code/IFLA/standards-dev/packages/theme/src/config/siteConfig.ts` for URL configuration
- **Context7 integration**: Always use Context7 for code examples at session start

### Deployment and Build Management
- **Server coordination**: Ask user to start servers/builds rather than waiting for timeouts
- **Environment awareness**: Warn when environment isn't set to project root
- **Nx optimization**: Use nx cache for performance; only skip with `--skip-nx-cache` when debugging cache-specific issues

### Port Management System
The project includes robust port conflict resolution integrated with Nx targets to prevent server startup failures:

#### Port Mappings
- **Portal**: 3000, **ISBDM**: 3001, **LRM**: 3002, **FRBR**: 3003
- **ISBD**: 3004, **MulDiCat**: 3005, **UniMARC**: 3006, **NewTest**: 3008

#### Essential Port Commands
- **Kill all ports**: `pnpm ports:kill` (silent) or `pnpm ports:kill:verbose`
- **Kill specific site**: `pnpm ports:kill:site isbd`
- **Robust server startup**: `pnpm start:robust` or `pnpm start:robust:nx`
- **Robust built site serving**: `pnpm serve:robust` or `pnpm serve:robust:nx`

#### Nx-Integrated Commands
- **Single site robust start**: `nx run {site}:start:robust` (e.g., `nx run portal:start:robust`)
- **Single site robust serve**: `nx run {site}:serve:robust` (e.g., `nx run isbdm:serve:robust`)
- **All sites robust start**: `nx run standards-dev:start-all:robust`
- **All sites robust serve**: `nx run standards-dev:serve-all:robust`

#### Key Components
- **Port Manager** (`scripts/utils/port-manager.js`): Detects and kills processes on specific ports using `lsof` and `kill -9`
- **Robust Startup** (`scripts/start-with-port-cleanup.js`): Automatically clears ports before starting servers
- **Nx Targets**: All projects have `start:robust` and `serve:robust` targets integrated with port cleanup
- **Playwright Integration**: E2E tests use robust startup to prevent port conflicts

#### Usage Guidelines
- **Prefer robust commands** when starting dev servers to avoid port conflicts
- **Use Nx targets** for consistent workspace-level operations
- **Automatic conflict resolution**: Scripts detect occupied ports and kill conflicting processes
- **Testing integration**: Port cleanup runs automatically during E2E test initialization
- **Graceful shutdown**: Scripts handle SIGTERM/SIGINT for clean port cleanup

#### Problem Solved
Previously, tests would fail with "port already in use" errors when dev servers were running. The port management system automatically kills conflicting processes, ensuring reliable server startup regardless of existing processes. Now fully integrated with Nx for consistent workspace management.

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
node scripts/test-site-builds.js --site portal --env local --skip-build
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

## Branch-Aware Testing and Git Hooks

### Pre-Commit Testing (Automatic)
Runs automatically on every `git commit` for fast feedback:
- **TypeScript checking**: Full type validation across affected projects
- **ESLint validation**: Code quality checks with auto-fixing where possible
- **Unit tests**: 446+ unit/integration tests for fast feedback loops
- **Configuration validation**: Site config validation without builds
- **Target time**: < 60 seconds for immediate feedback

### Pre-Push Testing (Branch-Aware)
Automatically runs on `git push` with different strategies based on branch:

#### Protected Branches (main/dev)
- **Full portal production build**: Complete build validation
- **ISBDM production build**: Critical site build testing
- **Portal E2E testing**: User workflow validation
- **Complete regression suite**: Comprehensive validation
- **Target time**: ~5-10 minutes for complete confidence

#### Feature Branches
- **Configuration validation**: Fast config checks
- **Representative build testing**: Sample build validation
- **Abbreviated regression testing**: Essential checks only
- **Target time**: ~2-3 minutes for efficient development

### GitHub Actions Integration
- **Matrix builds**: All 7 sites built in parallel across multiple runners
- **Environment testing**: Validates deployment configurations
- **URL validation**: Comprehensive link checking
- **Smart caching**: Nx cache optimization reduces CI time by ~70%

### Cost Optimization Strategy
**Local Testing (Free)**: Comprehensive coverage via automated git hooks ensures high quality
**CI Testing (Paid)**: Focused on environment-specific validation, avoiding redundant testing of locally-validated functionality

This approach provides high deployment confidence while minimizing CI compute costs through intelligent local validation.
