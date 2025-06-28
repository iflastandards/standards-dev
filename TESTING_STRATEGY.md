# IFLA Standards Testing Strategy

## Test Groups Overview

This document outlines the five distinct test groups that organize all testing activities in the IFLA Standards monorepo, optimized for developer efficiency and CI cost management.

## 1. Selective Tests (On-Demand Development)

**Purpose**: Individual testing for focused development work
**When**: During active development, debugging, feature work
**Optimization**: Uses `nx affected` heavily, smart caching

### Unit Tests
```bash
# Individual project tests
nx test @ifla/theme                    # Theme package only
nx test portal                         # Portal site only
nx test isbdm                          # ISBDM standard only

# Affected unit tests (recommended for development)
nx affected --target=test              # Only test changed projects
nx affected --target=test --parallel=3 # Parallel execution

# All unit tests (when needed)
nx run-many --target=test --all        # All projects
```

### UI Tests (Playwright Multi-Browser)
```bash
# Individual browser testing
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project="Mobile Chrome"

# Specific test files
npx playwright test e2e/portal-smoke.spec.ts
npx playwright test e2e/vocabulary-functionality.spec.ts

# Debug mode
npx playwright test --debug
npx playwright test --ui
```

### Regression Tests (Targeted)
```bash
# Visual regression
nx run standards-dev:regression:visual

# Performance regression
nx run standards-dev:regression:performance

# Build regression (affected only)
nx run standards-dev:regression:affected
```

## 2. Comprehensive Tests (Test Everything)

**Purpose**: Full validation before major releases or when comprehensive coverage needed
**When**: Release preparation, major refactoring validation, troubleshooting
**Optimization**: Parallelized where possible, uses all available cores

### Full Test Suite
```bash
# Everything in parallel (recommended)
pnpm test:comprehensive

# Individual comprehensive suites
pnpm test:comprehensive:unit          # All unit tests
pnpm test:comprehensive:e2e           # All E2E tests  
pnpm test:comprehensive:builds        # All build validation
pnpm test:comprehensive:regression    # Full regression suite
```

### Implementation
```bash
# Equivalent to:
nx run-many --target=typecheck --all --parallel &&
nx run-many --target=lint --all --parallel &&
nx run-many --target=test --all --parallel &&
nx run-many --target=build --all --parallel &&
nx run standards-dev:e2e &&
nx run standards-dev:regression:full
```

## 3. Pre-Commit Tests (Git Hook)

**Purpose**: Fast feedback loop preventing broken commits
**When**: Automatically on `git commit`
**Optimization**: Only affected projects, parallel execution, under 60 seconds

### What Runs
```bash
# Parallel execution of affected projects only
nx affected --target=typecheck --parallel=3 &
nx affected --target=lint --parallel=3 &
nx affected --target=test --parallel=3 &
wait

# Quick config validation (no builds)
node scripts/test-site-builds-affected.js --env local --skip-build
```

### Speed Targets
- **Target time**: < 60 seconds for typical changes
- **Fallback**: < 120 seconds for large changes
- **Uses**: Nx cache aggressively, only affected projects

## 4. Pre-Push Tests (Git Hook - Deployment Focus)

**Purpose**: Deployment-focused validation before code reaches main branches
**When**: Automatically on `git push`
**Optimization**: Branch-aware, affected-only for features, comprehensive for protected branches

### Feature Branches (Fast Path)
```bash
# Affected validation
nx affected --target=typecheck --parallel=3
nx affected --target=lint --parallel=3  
nx affected --target=test --parallel=3

# Configuration validation only
node scripts/test-site-builds.js --site all --env localhost --skip-build

# Representative build test (if portal affected)
nx run portal:build
```

### Protected Branches (main/dev - Comprehensive)
```bash
# Full affected testing
nx affected --target=test --parallel=3
nx affected --target=build --parallel=3

# Complete configuration validation
node scripts/test-site-builds.js --site all --env localhost --skip-build

# Critical E2E (if portal affected)
nx run portal:e2e
```

### Speed Targets
- **Feature branches**: < 180 seconds
- **Protected branches**: < 300 seconds

## 5. CI Tests (Environment/Infrastructure Focus)

**Purpose**: Validate deployment environment, secrets, and infrastructure-specific issues
**When**: GitHub Actions CI pipeline
**Optimization**: Minimal, focused only on deployment environment issues

### What CI Tests
```bash
# Type checking (build-critical)
pnpm typecheck

# Deployment-critical component tests only
pnpm vitest run --config vitest.config.ci.ts

# Environment/secrets validation
# - Google Sheets API connectivity
# - GitHub token availability
# - Configuration validation for production environment

# Production configuration validation
node scripts/test-site-builds.js --site all --env production --skip-build

# Affected builds for deployment
nx affected --target=build --parallel=6
```

### What CI Doesn't Test
- ❌ Development tool functionality (vocabulary-comparison, language detection)
- ❌ Comprehensive unit test suites (already validated locally)
- ❌ Full E2E suites (expensive, redundant with local validation)
- ❌ Linting (already validated locally)

### Speed Targets
- **Target time**: < 180 seconds total
- **Focus**: Environment-specific failures only

## Script Organization

### Core Development Commands (Nx-Optimized)
```bash
# Primary development workflow
pnpm lint                             # nx affected --target=lint
pnpm typecheck                        # nx affected --target=typecheck  
pnpm test                             # nx affected --target=test
pnpm build:affected                   # nx affected --target=build

# Comprehensive alternatives
pnpm lint:all                         # nx run-many --target=lint --all
pnpm typecheck:all                    # nx run-many --target=typecheck --all
pnpm test:all                         # nx run-many --target=test --all
pnpm build:all                        # nx run-many --target=build --all
```

### Test Group Commands
```bash
# Group 1: Selective
pnpm test:unit:{project}              # Individual project testing
pnpm test:e2e:{browser}               # Browser-specific E2E
pnpm test:regression:{type}           # Specific regression testing

# Group 2: Comprehensive  
pnpm test:comprehensive               # Everything, parallelized
pnpm test:comprehensive:{type}        # Comprehensive subset

# Group 3: Pre-commit (automatic via git hook)
pnpm test:pre-commit                  # Manual trigger for hook equivalent

# Group 4: Pre-push (automatic via git hook)  
pnpm test:pre-push                    # Manual trigger for hook equivalent
pnpm test:pre-push:feature            # Feature branch simulation
pnpm test:pre-push:protected          # Protected branch simulation

# Group 5: CI
pnpm test:ci                          # CI environment simulation
pnpm test:ci:connectivity             # External service connectivity only
```

## Nx Optimizations Applied

### Affected Detection
- All core commands use `nx affected` instead of running everything
- Git-based change detection determines what needs testing
- Cache-aware execution prevents redundant work

### Parallel Execution
- Multi-core utilization with `--parallel=3` (or appropriate core count)
- Background job execution in git hooks
- Load balancing across available resources

### Smart Caching
- Nx cache enabled by default (`--skip-nx-cache=false`)
- Input-based cache invalidation
- Shared cache across team members (if Nx Cloud configured)

### Dependency Management
- Projects only rebuild/test when dependencies change
- Proper dependency graph ensures correct build order
- Task pipeline optimization

## Performance Targets

| Test Group | Target Time | Fallback Time | Optimization Focus |
|------------|-------------|---------------|-------------------|
| Selective | < 30s | < 60s | Affected only, single purpose |
| Comprehensive | < 300s | < 600s | Parallelization, smart scheduling |
| Pre-commit | < 60s | < 120s | Affected, essential checks only |
| Pre-push | < 180s | < 300s | Branch-aware, representative testing |
| CI | < 180s | < 240s | Environment focus, minimal redundancy |

## Cost Management Strategy

### Local Testing (Free)
- Comprehensive test coverage via git hooks
- Development tools validation
- Complete regression testing

### CI Testing (Paid)
- Environment-specific validation only
- Infrastructure connectivity testing
- Production configuration validation
- No redundant testing of locally-validated functionality

This approach ensures high confidence in deployments while minimizing CI compute costs through smart local validation and targeted cloud testing.