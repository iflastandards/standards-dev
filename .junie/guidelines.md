# IFLA Standards Project Guidelines

This document provides essential information for developers working on the IFLA Standards project.

## Build/Configuration Instructions

### Project Structure
The IFLA Standards project is a monorepo containing multiple packages and standards sites:

- **packages/theme**: Contains the shared theme components and utilities
- **packages/preset-ifla**: Contains the Docusaurus preset for IFLA standards
- **standards/**: Contains individual standard sites (FRBR, ISBD, ISBDM, LRM, MulDiCat, UniMARC)
- **portal/**: The main portal site

### Nx Integration
The project has been restructured to integrate Nx for optimized builds, testing, and caching. Nx commands are now the **recommended approach** for development.

### Build Commands (Nx Optimized)

```bash
# Build specific sites (Nx commands - RECOMMENDED)
nx build portal                  # Portal (port 3000)
nx build isbdm                   # ISBDM (port 3001)
nx build lrm                     # LRM (port 3002)
nx build frbr                    # FRBR (port 3003)
nx build isbd                    # ISBD (port 3004)
nx build muldicat                # Muldicat (port 3005)
nx build unimarc                 # Unimarc (port 3006)
nx build @ifla/theme             # Build theme package

# Build all sites (Nx optimized)
nx run-many --target=build --all           # Build all sites in parallel
nx affected --target=build                 # Build only affected sites (faster)
pnpm build:all:nx                          # Package.json shortcut

# Legacy pnpm commands (still available)
pnpm build:portal     # Build the portal site
pnpm build:isbdm      # Build the ISBDM standard
pnpm build:lrm        # Build the LRM standard
pnpm build:frbr       # Build the FRBR standard
pnpm build:isbd       # Build the ISBD standard
pnpm build:muldicat   # Build the MulDiCat standard
pnpm build:unimarc    # Build the UniMARC standard
pnpm build:all        # Build all sites in parallel
pnpm build:all:safe   # Clear all builds first, then build all sites
```

### Development Commands (Nx Optimized)

```bash
# Start development servers with robust port cleanup (RECOMMENDED)
nx run portal:start:robust       # http://localhost:3000 (with port cleanup)
nx run isbdm:start:robust        # http://localhost:3001 (with port cleanup)
nx run lrm:start:robust          # http://localhost:3002 (with port cleanup)
nx run frbr:start:robust         # http://localhost:3003 (with port cleanup)
nx run isbd:start:robust         # http://localhost:3004 (with port cleanup)
nx run muldicat:start:robust     # http://localhost:3005 (with port cleanup)
nx run unimarc:start:robust      # http://localhost:3006 (with port cleanup)

# Start all sites with port cleanup
nx run standards-dev:start-all:robust      # Start all sites with port cleanup
pnpm start:robust                          # Package.json shortcut for robust start

# Port management
pnpm ports:kill                  # Kill all project ports
pnpm ports:kill:verbose          # Kill all ports with details
pnpm ports:kill:site portal      # Kill specific site port

# Legacy pnpm commands (still available)
pnpm start:portal     # Start the portal site (port 3000)
pnpm start:isbdm      # Start the ISBDM standard (port 3001)
pnpm start:lrm        # Start the LRM standard (port 3002)
pnpm start:frbr       # Start the FRBR standard (port 3003)
pnpm start:isbd       # Start the ISBD standard (port 3004)
pnpm start:muldicat   # Start the MulDiCat standard (port 3005)
pnpm start:unimarc    # Start the UniMARC standard (port 3006)
pnpm start:all        # Start all sites in parallel

# Serve built sites
pnpm serve:portal     # Serve the built portal site
pnpm serve:all        # Serve all built sites
```

### Cache Management

```bash
# Clear build artifacts
pnpm clear:all                   # Removes all .docusaurus and build folders
nx reset                         # Clear Nx cache
pnpm clear:webpack               # Clear webpack cache only
```

### Configuration Architecture

The project uses a hierarchical configuration system:

1. **Base configuration**: Defined in `packages/theme/src/config/siteConfigCore.ts`
2. **Site-specific configuration**: Each standard site has its own `docusaurus.config.ts`
3. **Environment-specific settings**: Different settings for development, preview, and production environments

## Testing Information

### Testing Framework

The project uses Vitest as the testing framework, with React Testing Library for component testing and jest-axe for accessibility testing.

### 🚀 Automated Testing (Zero Configuration Required)

#### Pre-commit (Runs automatically on `git commit`)
```bash
# These run automatically when you commit:
✅ TypeScript type checking
✅ ESLint code quality  
✅ Unit/integration tests (446 tests)
✅ Site configuration validation

# Duration: ~30-60 seconds
# Purpose: Fast feedback, prevent broken commits
```

#### Pre-push (Runs automatically on `git push`)
```bash
# Branch-aware testing:

🔒 Protected branches (main/dev):
✅ Full portal production build
✅ ISBDM production build  
✅ Portal E2E testing
✅ Complete regression suite
Duration: ~5-10 minutes

📝 Feature branches:
✅ Configuration validation
✅ Representative build test
✅ Abbreviated regression testing  
Duration: ~2-3 minutes
```

#### GitHub Actions (Runs automatically on push/PR)
```bash
✅ Unit Tests & Type Safety
✅ Site Configuration Testing
✅ Matrix Build Testing (7 sites in parallel)
✅ URL Validation & Link Checking
✅ Comprehensive Result Reporting
```

### Testing Strategy - 5 Test Groups

The project implements a comprehensive testing strategy organized into 5 distinct test groups:

#### 1. Selective Tests (On-Demand Development)
**Purpose**: Individual testing for focused development work
**When**: During active development, debugging, feature work

```bash
# Individual project tests
nx test @ifla/theme                    # Theme package only
nx test portal                         # Portal site only
nx test isbdm                          # ISBDM standard only

# Affected unit tests (recommended for development)
nx affected --target=test              # Only test changed projects
nx affected --target=test --parallel=3 # Parallel execution

# UI Tests (Playwright Multi-Browser)
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project="Mobile Chrome"

# Regression Tests (Targeted)
nx run standards-dev:regression:visual
nx run standards-dev:regression:performance
```

#### 2. Comprehensive Tests (Test Everything)
**Purpose**: Full validation before major releases
**When**: Release preparation, major refactoring validation

```bash
# Everything in parallel (recommended)
pnpm test:comprehensive

# Individual comprehensive suites
pnpm test:comprehensive:unit          # All unit tests
pnpm test:comprehensive:e2e           # All E2E tests  
pnpm test:comprehensive:builds        # All build validation
pnpm test:comprehensive:regression    # Full regression suite
```

#### 3. Pre-Commit Tests (Git Hook)
**Purpose**: Fast feedback loop preventing broken commits
**Optimization**: Only affected projects, parallel execution, under 60 seconds

#### 4. Pre-Push Tests (Git Hook - Deployment Focus)
**Purpose**: Deployment-focused validation before code reaches main branches
**Optimization**: Branch-aware, affected-only for features, comprehensive for protected branches

#### 5. CI Tests (Environment/Infrastructure Focus)
**Purpose**: Validate deployment environment, secrets, and infrastructure-specific issues
**Optimization**: Minimal, focused only on deployment environment issues

### Manual Testing Commands

```bash
# Development workflow
pnpm test                    # Unit tests only
pnpm test:full              # Unit + config validation
pnpm test:regression        # Full regression suite

# Specific testing
pnpm test:builds:config     # Fast config validation
pnpm test:builds:critical   # Portal + ISBDM builds
pnpm test:portal:e2e        # Portal end-to-end testing

# Individual components
pnpm typecheck              # TypeScript validation
pnpm lint --quiet           # Code quality check

# Run specific tests
npx vitest run [test-file-path]  # Run a specific test file
npx vitest run packages/theme/src/tests/utils/stringUtils.test.ts  # Example

# Run tests for affected files only
pnpm test:affected
```

### Test Coverage

| Test Type | Count | Duration | Automation |
|-----------|-------|----------|------------|
| **Unit/Integration** | 446 tests | ~5-10s | ✅ Pre-commit |
| **TypeScript** | All files | ~10-15s | ✅ Pre-commit |
| **ESLint** | All files | ~5-10s | ✅ Pre-commit |
| **Site Configs** | 7 sites | ~30s | ✅ Pre-commit |
| **Build Tests** | 7 sites | ~2-5min | ✅ Pre-push |
| **E2E Tests** | Portal | ~2-3min | ✅ Pre-push (main/dev) |

### Performance Targets

| Test Group | Target Time | Fallback Time | Optimization Focus |
|------------|-------------|---------------|-------------------|
| Selective | < 30s | < 60s | Affected only, single purpose |
| Comprehensive | < 300s | < 600s | Parallelization, smart scheduling |
| Pre-commit | < 60s | < 120s | Affected, essential checks only |
| Pre-push | < 180s | < 300s | Branch-aware, representative testing |
| CI | < 180s | < 240s | Environment focus, minimal redundancy |

### Test Structure

Tests are organized in the following structure:

- **Unit/Component Tests**: Located in `packages/theme/src/tests/`
  - `components/`: Tests for React components
  - `scripts/`: Tests for utility scripts
  - `config/`: Tests for configuration
  - `utils/`: Tests for utility functions

- **End-to-End Tests**: Located in `e2e/` directory and in standard-specific directories like `standards/ISBDM/e2e/`

### Adding New Tests

1. Create a new test file with the `.test.ts` or `.test.tsx` extension
2. Import the necessary testing utilities:
   ```typescript
   import { describe, it, expect } from 'vitest';
   import { render, screen } from '@testing-library/react'; // For component tests
   ```
3. Write your tests using the describe/it structure
4. Run the tests to verify they work

### Example Test

Here's an example of a simple utility function test:

```typescript
// File: packages/theme/src/utils/stringUtils.ts
export function capitalizeFirstLetter(str: string): string {
  if (!str || str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// File: packages/theme/src/tests/utils/stringUtils.test.ts
import { describe, it, expect } from 'vitest';
import { capitalizeFirstLetter } from '@ifla/theme/utils/stringUtils';

describe('String Utilities', () => {
  describe('capitalizeFirstLetter', () => {
    it('should capitalize the first letter of a string', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
      expect(capitalizeFirstLetter('world')).toBe('World');
    });

    it('should handle empty strings', () => {
      expect(capitalizeFirstLetter('')).toBe('');
    });
  });
});
```

## Port Conflict Resolution

### Problem & Solution
The project implements a robust port management system that automatically kills conflicting processes before starting new servers. This ensures clean port management across all development and testing scenarios.

### Port Mappings
- **Portal**: 3000
- **ISBDM**: 3001
- **LRM**: 3002
- **FRBR**: 3003
- **ISBD**: 3004
- **MulDiCat**: 3005
- **UniMARC**: 3006
- **NewTest**: 3008

### Port Management Commands
```bash
# Kill all ports
pnpm ports:kill                  # Silent mode
pnpm ports:kill:verbose          # Verbose mode

# Kill specific site port
pnpm ports:kill:site isbd        # Kill ISBD port (3004)
pnpm ports:kill:site portal      # Kill portal port (3000)

# Start servers with port cleanup
pnpm start:robust                # Start all development servers
pnpm start:robust:site isbd      # Start specific site
pnpm serve:robust                # Serve all built sites

# Manual port management
node scripts/utils/port-manager.js all --verbose
node scripts/utils/port-manager.js port 3004
node scripts/utils/port-manager.js site isbd
```

## Development Workflow

### Repository Setup

- **Main Repository**: `iflastandards/standards-dev` (upstream)
- **Development Fork**: Your personal fork (e.g., `username/standards-dev`)
- **Local Remotes**:
  - `origin`: `git@github.com:iflastandards/standards-dev.git`
  - `fork`: `git@github.com:username/standards-dev.git`

### Environment Deployment

| Environment | Branch | Repository | Deployment URL | Triggers |
|-------------|--------|------------|----------------|----------|
| **Development** | `dev` | `username/standards-dev` | `https://username.github.io/standards-dev/` | Push to `dev` branch |
| **Preview** | `main` | `iflastandards/standards-dev` | `https://iflastandards.github.io/standards-dev/` | Push/PR to `main` branch |
| **Production** | `main` | `iflastandards/standards-dev` | `https://iflastandards.info/` | Automatic from main |

### Development Process

1. **Development & Testing**:
   ```bash
   # Work on dev branch (your personal testing environment)
   git checkout dev
   git pull fork dev

   # Make changes, commit as usual
   git add .
   git commit -m "your changes"

   # Push to your fork - triggers deploy-dev.yml
   git push fork dev

   # Test changes at: https://username.github.io/standards-dev/
   ```

2. **Move to Preview (Create Pull Request)**:
   ```bash
   # Create PR from your fork's dev branch to upstream main
   gh pr create --repo iflastandards/standards-dev --base main --head username:dev --title "Your PR Title" --body "Description of changes"
   ```

3. **Preview & Production Deployment**:
   - **PR merge to main** → Triggers `ci-preview.yml` → Deploys to preview site
   - **Main branch updates** → Triggers `deploy-all.yml` → Deploys to production

### Workflow Summary

1. **Development**: `username/standards-dev:dev` → Test on personal GitHub Pages
2. **Preview**: PR to `iflastandards/standards-dev:main` → Preview on official staging
3. **Production**: Automatic deployment from main branch → Live site

### GitHub Actions

- **`deploy-dev.yml`**: Builds and deploys dev branch to personal GitHub Pages
- **`ci-preview.yml`**: Builds and deploys main branch to preview site (triggers on main branch only)
- **`deploy-all.yml`**: Handles production deployment

### Environment Configuration

Environment settings are defined in `packages/theme/src/config/siteConfigCore.ts`:

- `DocsEnv.Dev`: Personal development environment (`https://username.github.io`)
- `DocsEnv.Preview`: Official preview environment (`https://iflastandards.github.io`)
- `DocsEnv.Production`: Production environment (`https://iflastandards.info`)

## Configuration Architecture

### Current Configuration System

The project uses a hierarchical configuration system:

1. **Base configuration**: Defined in `packages/theme/src/config/siteConfigCore.ts`
2. **Site-specific configuration**: Each standard site has its own `docusaurus.config.ts`
3. **Environment-specific settings**: Different settings for development, preview, and production environments

### Configuration Improvements

#### Standardized Site Factory
The project includes `packages/theme/src/config/standardSiteFactory.ts` with `createStandardSiteConfig()` function that:

- **Reduces boilerplate**: 125+ lines → ~40 lines per site
- **Ensures consistency**: All sites get same base configuration
- **Leverages existing infrastructure**: Uses `VOCABULARY_DEFAULTS`, `getSiteUrl`, etc.
- **Maintains flexibility**: Allows site-specific customizations
- **Handles complex cases**: Supports custom sidebar generators, redirects, etc.

#### Benefits
- **66% reduction** in configuration code per site
- Single source of truth for common patterns
- Easier to update all sites simultaneously
- Consistent behavior across environments

## Nx Optimizations Applied

### Task Dependency Orchestration
The project implements comprehensive Nx optimizations with proper `dependsOn` rules:

```json
{
  "build": {
    "dependsOn": ["^build"],  // Dependencies build first
    "outputs": ["{projectRoot}/build", "{projectRoot}/dist", "{projectRoot}/.docusaurus"],
    "cache": true
  },
  "test": {
    "dependsOn": ["^build"],  // Tests run after dependencies are built
    "outputs": ["{projectRoot}/coverage", "{projectRoot}/test-results"]
  },
  "typecheck": {
    "dependsOn": ["^build"],  // TypeCheck after dependencies built
    "cache": true
  }
}
```

### Performance Benefits

#### Build Sequence Optimization
- Theme package builds first, then all sites can build in parallel
- Automatic orchestration ensures correct dependency order
- Smart scheduling optimizes resource utilization

#### Caching Improvements
- **Input-based cache invalidation**: Only affected projects rebuild
- **Output caching**: Built artifacts shared across environments
- **Remote caching ready**: Nx Cloud optimization enabled

#### Expected Performance Gains
- **Theme changes**: All sites rebuild (necessary)
- **Site-specific changes**: Only affected sites rebuild
- **Configuration changes**: Smart invalidation based on inputs

### Nx Features Leveraged

1. **Task Pipeline Configuration**: `dependsOn` rules ensure correct build order
2. **Input/Output Specification**: Precise caching and invalidation
3. **Named Inputs**: Reusable input patterns across projects
4. **Implicit Dependencies**: Theme package dependency management
5. **Affected Detection**: Only build/test what changed

## Additional Development Information

### Code Style

- The project uses ESLint for code quality and Prettier for code formatting
- TypeScript is used throughout the project for type safety
- React components follow a functional approach with hooks

### Docusaurus Configuration

- The project uses Docusaurus v3.8 for documentation sites
- Custom components are available in the `@ifla/theme` package
- Site configuration is managed through a hierarchical system

#### API Documentation References

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

- **Real-time Examples**: use `docuserve-context7` mcp for live code examples from Docusaurus community plugins
- **Type Definitions**: Prefer Context7 over static docs for up-to-date TypeScript types
- **Plugin Discovery**: Use Context7 to find and evaluate community plugins


### Nx Workflow Benefits

- **Smart Caching**: Nx caches build outputs, test results, and lint results locally and in the cloud
- **Affected Detection**: Only builds/tests projects that have changed or are affected by changes
- **Parallel Execution**: Runs tasks in parallel across multiple CPU cores
- **Distributed Execution**: CI jobs can run across multiple agents for faster completion
- **Build Analytics**: Track performance and optimization opportunities

### Performance Considerations

- **Use Nx commands**: Prefer `nx build portal` over `pnpm build:portal` for better caching
- **Affected builds**: Use `nx affected --target=build` for faster builds in PRs
- **Cache management**: Nx automatically handles cache invalidation based on file changes
- **Parallel testing**: Use `nx run-many --target=test --all` for parallel test execution
- **Port cleanup**: Use `:robust` variants for development servers to handle port conflicts

### Cost Management Strategy

#### Local Testing (Free)
- Comprehensive test coverage via git hooks
- Development tools validation
- Complete regression testing

#### CI Testing (Paid)
- Environment-specific validation only
- Infrastructure connectivity testing
- Production configuration validation
- No redundant testing of locally-validated functionality

This approach ensures high confidence in deployments while minimizing CI compute costs through smart local validation and targeted cloud testing.

### Troubleshooting

- **Build issues**: Try `pnpm clear:all` followed by `nx reset` to clear all caches
- **Port conflicts**: Use `pnpm ports:kill` to kill all project ports, or `pnpm ports:kill:site <sitename>` for specific sites
- **Test failures**: Check test output for specific error messages; use `pnpm test:ui` for interactive debugging
- **Dependency issues**: Ensure you're using the correct pnpm version; run `pnpm install` to refresh dependencies
- **Nx cache issues**: Use `nx reset` to clear Nx cache if builds behave unexpectedly
- **TypeScript errors**: Run `pnpm typecheck` to check for type errors across all projects

### 🚨 What Happens When Tests Fail

#### Pre-commit Failure
```bash
❌ TypeScript errors found. Please fix before committing.
# Commit is blocked until issues are resolved
```

#### Pre-push Failure  
```bash
❌ Portal build test failed.
# Push is blocked until issues are resolved
```

#### CI/CD Failure
- GitHub Actions provide detailed logs
- Failed build artifacts are automatically preserved
- PR status checks prevent merging until fixed

### 🔧 Bypassing Tests (Use Sparingly)

```bash
# Skip pre-commit (NOT recommended)
git commit --no-verify

# Skip pre-push (NOT recommended)  
git push --no-verify

# Run manual tests instead
pnpm test:pre-commit        # Equivalent to pre-commit hook
pnpm test:pre-push          # Equivalent to pre-push hook
```

### 🎉 Benefits

✅ **Automatic Quality Assurance** - No manual test execution required  
✅ **Fast Feedback** - Issues caught before they reach remote  
✅ **Branch Protection** - Stricter testing for main/dev branches  
✅ **Comprehensive Coverage** - Unit, integration, build, and E2E testing  
✅ **CI/CD Integration** - Seamless GitHub Actions automation  
✅ **Zero Configuration** - Works immediately for all developers  
✅ **Smart Caching** - Nx optimizations for faster builds and tests  
✅ **Port Management** - Automatic conflict resolution  
✅ **Cost Optimization** - Minimal CI usage through comprehensive local testing

**The testing strategy ensures high code quality and prevents regressions without requiring manual intervention!** 🚀
