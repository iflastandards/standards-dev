# Build Regression Testing - Developer Guide

This guide covers the comprehensive build regression testing strategy for the IFLA Standards project, ensuring reliable builds and deployments across all sites and environments.

## Quick Start

### Automated Testing (Recommended)

**Pre-commit (automatic on `git commit`):**
```bash
# Runs automatically - includes:
# ✅ TypeScript checking
# ✅ ESLint validation  
# ✅ Unit tests
# ✅ Configuration validation

# Manual equivalent:
pnpm test:pre-commit
```

**Pre-push (automatic on `git push`):**
```bash
# Runs automatically based on branch:
# 🔒 main/dev: Full regression testing
# 📝 feature: Abbreviated testing

# Manual equivalent:
pnpm test:pre-push        # Feature branch level
pnpm test:regression      # Full regression suite
```

### Manual Testing Commands

```bash
# Quick development checks
pnpm test:full              # Unit + config tests
pnpm test:regression        # Full regression suite

# Specific test categories  
pnpm test                   # Unit/integration tests only
pnpm typecheck             # TypeScript validation
pnpm lint --quiet          # Code quality check

# Build regression tests
pnpm test:builds:config     # Configuration validation (fast)
pnpm test:builds:critical   # Portal + ISBDM builds  
pnpm test:builds:production # All sites production build
pnpm test:portal:e2e        # Portal end-to-end testing

# Individual site testing
node scripts/test-site-builds.js --site ISBDM --env local
./scripts/test-portal-builds.sh
```

### CI/CD Workflow
```bash
# Trigger manual testing workflow
gh workflow run test-site-builds.yml -f site=all -f environment=production
```

## Automated Testing Strategy

### Git Hooks (Husky)

#### Pre-commit Hook (`.husky/pre-commit`)
**Triggers on:** Every `git commit`  
**Purpose:** Fast feedback loop, prevent broken commits
**Tests:**
- ✅ TypeScript type checking (`pnpm typecheck`)
- ✅ ESLint code quality (`pnpm lint --quiet`) 
- ✅ Unit/integration tests (`pnpm test --run`)
- ✅ Site configuration validation (`test-site-builds.js --skip-build`)

**Duration:** ~30-60 seconds

#### Pre-push Hook (`.husky/pre-push`)
**Triggers on:** Every `git push`  
**Purpose:** Comprehensive validation before remote changes
**Branch-aware testing:**

**Protected branches (main/dev):**
- ✅ Full portal production build + validation
- ✅ ISBDM production build + validation  
- ✅ Portal E2E testing across environments
- ✅ Complete regression suite

**Feature branches:**
- ✅ All site configuration validation
- ✅ Representative portal build test
- ✅ Abbreviated regression testing

**Duration:** 2-10 minutes (depending on branch)

### GitHub Actions CI/CD

#### Enhanced Workflow Architecture
```
test-unit-and-types (NEW!)
├─ TypeScript compilation
├─ ESLint validation  
├─ 446 unit/integration tests
└─ Test artifact upload

test-configurations
├─ Site config validation  
├─ Environment URL checking
└─ Docusaurus v4 compliance

test-site-builds (Matrix)
├─ [portal, ISBDM, LRM, FRBR, isbd, muldicat, unimarc]
├─ Full compilation testing
├─ Sitemap generation
└─ Build artifact preservation

test-url-validation  
├─ Post-build URL validation
├─ Cross-site link testing
└─ Environment consistency

summary
└─ Comprehensive result reporting
```

#### Trigger Optimization
- **Path-based triggers:** Only runs on relevant file changes
- **Protected branch enforcement:** Stricter testing for main/dev
- **Manual dispatch:** Configurable testing scenarios
- **Parallel execution:** Matrix strategy for efficiency

## Testing Architecture

### 1. Multi-Layer Testing Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                   Build Regression Testing                  │
├─────────────────────────────────────────────────────────────┤
│ Unit/Integration (Vitest)                                  │
│ ├─ Component functionality                                  │
│ ├─ Configuration logic                                      │
│ ├─ Type safety                                             │
│ └─ Cross-contamination prevention                          │
├─────────────────────────────────────────────────────────────┤
│ Configuration Testing (Node.js)                            │
│ ├─ Site configuration validation                           │
│ ├─ Environment-specific URL checking                       │
│ ├─ Future flags compliance                                 │
│ └─ Docusaurus v4 compatibility                             │
├─────────────────────────────────────────────────────────────┤
│ Build Process Testing (Node.js)                            │
│ ├─ Site compilation verification                           │
│ ├─ Sitemap generation                                      │
│ ├─ Asset generation                                        │
│ └─ URL correctness validation                              │
├─────────────────────────────────────────────────────────────┤
│ End-to-End Testing (Puppeteer)                             │
│ ├─ Portal link validation                                  │
│ ├─ Multi-environment deployment                            │
│ ├─ HTTP server testing                                     │
│ └─ Cross-site navigation                                   │
└─────────────────────────────────────────────────────────────┘
```

### 2. Test Coverage Matrix

| Test Type | Purpose | Framework | Coverage |
|-----------|---------|-----------|----------|
| **Unit Tests** | Component logic | Vitest + RTL | 446 tests, 100% pass rate |
| **Integration Tests** | Cross-component interaction | Vitest | StandardSiteFactory, VocabularyTable |
| **Config Tests** | Site configuration validation | Node.js | URL generation, environment settings |
| **Build Tests** | Compilation verification | Node.js | All 7 sites, sitemap generation |
| **E2E Tests** | User workflow validation | Puppeteer | Portal navigation, link checking |

## Test Suites

### 1. Vitest Unit/Integration Tests
**Location**: `packages/theme/src/tests/`, `standards/*/docs/examples/__tests__/`
**NX Commands**: `nx test`, `nx test @ifla/theme`, `nx affected --target=test`

#### Key Test Areas:
- **StandardSiteFactory**: Configuration isolation, deep cloning prevention
- **VocabularyTable**: Multilingual support, CSV parsing, user interactions
- **ElementReference**: RDF serialization, component rendering
- **Component Integration**: Cross-site navigation, theme consistency
- **Build Scripts**: Vocabulary comparison, site generation utilities

#### Critical Test Cases:
```typescript
// Configuration isolation (prevents cross-site contamination)
it('should create independent plugin configurations for different sites', () => {
  const config1 = createStandardSiteConfig({ siteKey: 'LRM' });
  const config2 = createStandardSiteConfig({ siteKey: 'ISBDM' });
  expect(config1.plugins).not.toBe(config2.plugins);
});

// NX project-specific testing
it('should run tests for specific projects', () => {
  // nx test @ifla/theme
  // nx test portal
  // nx test isbdm
});

// Performance testing with CI optimizations
it('should handle CI environment constraints', () => {
  // Tests run with process forks, timeouts, and retry logic
  expect(process.env.CI ? 'sequential' : 'parallel').toBeTruthy();
});
```

### 2. Configuration Regression Tests
**Location**: `scripts/test-site-builds.js`
**Command**: `node scripts/test-site-builds.js --site all --env production --skip-build`

#### Validation Points:
- ✅ **Environment Configuration**: URL generation per environment
- ✅ **Future Flags**: Docusaurus v4 compliance (`future: { v4: true }`)
- ✅ **Site Registration**: All sites properly registered in `siteConfigCore`
- ✅ **Configuration Factory**: Proper use of `createStandardSiteConfig()`

#### Example Output:
```
============================================================
IFLA Standards Site Regression Testing
============================================================
ℹ Testing against environment: production
⚠ Build step will be skipped
ℹ Sites to test: portal, ISBDM, LRM, FRBR, isbd, muldicat, unimarc

✓ portal passed all tests
✓ ISBDM passed all tests
✓ LRM passed all tests
...
```

### 3. Build Process Tests
**Location**: `scripts/test-site-builds.js`
**Command**: `node scripts/test-site-builds.js --site ISBDM --env local`

#### Build Verification:
- ✅ **Compilation Success**: All TypeScript/MDX files compile
- ✅ **Sitemap Generation**: Valid sitemap.xml with correct URLs
- ✅ **Asset Generation**: CSS, JS, images properly built
- ✅ **URL Consistency**: No localhost URLs in production builds

#### Sitemap Validation:
```javascript
// Verify sitemap URLs match expected environment
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
const expectedUrlPrefix = `${siteConfig.url}${siteConfig.baseUrl}`;
if (!sitemapContent.includes(expectedUrlPrefix)) {
  throw new Error(`Sitemap doesn't contain expected URL prefix: ${expectedUrlPrefix}`);
}
```

### 4. Portal End-to-End Tests
**Location**: `scripts/test-portal-builds.sh`
**Command**: `./scripts/test-portal-builds.sh`

#### Multi-Environment Testing:
- ✅ **Localhost Build**: Development environment validation
- ✅ **Preview Build**: Staging environment validation  
- ✅ **Production Build**: Production environment validation
- ✅ **Link Validation**: All cross-site links functional

#### Environment Test Flow:
```bash
# For each environment (localhost, preview, production):
1. Build portal with DOCS_ENV=$ENV_NAME
2. Serve build on HTTP server
3. Run Puppeteer link validation
4. Check all cross-site navigation
5. Cleanup and move to next environment
```

## GitHub Actions CI/CD

### Workflow: `.github/workflows/test-site-builds.yml`

#### Jobs Architecture:
```yaml
test-configurations:     # Fast configuration validation
  └─ Validates all site configs without building

test-site-builds:        # Matrix build testing  
  strategy:
    matrix:
      site: [portal, ISBDM, LRM, FRBR, isbd, muldicat, unimarc]
  └─ Full build test for each site

test-url-validation:     # Post-build validation
  └─ Sitemap and URL validation

summary:                 # Results aggregation
  └─ Overall test status reporting
```

#### Trigger Conditions:
- ✅ **Push to main/dev**: Full test suite
- ✅ **Pull Requests**: Full test suite  
- ✅ **Manual Dispatch**: Configurable site/environment testing

## Critical Test Cases

### 1. Configuration Isolation
**Problem**: Sites getting cross-contaminated configuration during parallel builds
**Test**: `standardSiteFactory.test.ts` - Configuration isolation tests
**Solution**: Deep cloning with proper object handling

### 2. TypeScript Compatibility  
**Problem**: Legacy TypeScript errors blocking development
**Test**: `pnpm typecheck` - Compilation validation
**Solution**: Type assertion and test file exclusion

### 3. URL Environment Consistency
**Problem**: Localhost URLs appearing in production builds
**Test**: Sitemap validation in build tests
**Solution**: Environment-aware URL generation

### 4. Build Cross-Contamination
**Problem**: Parallel builds causing footer link contamination
**Test**: Individual and parallel build validation
**Solution**: Proper object spreading without deep cloning corruption

## Performance Benchmarks

### Test Execution Times
- **Unit Tests**: ~5-6 seconds (446+ tests with Vitest)
- **Configuration Tests**: ~1-2 seconds per site
- **Build Tests**: ~30-60 seconds per site
- **Portal E2E Tests**: ~2-3 minutes per environment
- **NX Affected Tests**: ~10-30 seconds (feature branches)

### CI/CD Pipeline Performance
- **Total Pipeline**: ~8-12 minutes for full test suite
- **Matrix Parallelization**: 7 sites tested simultaneously
- **NX Caching**: Significant speedup for unchanged projects
- **Artifact Upload**: Failed builds automatically preserved
- **Branch Optimization**: Feature branches run 60-80% faster

## Test Data and Fixtures

### Shared Test Data
```typescript
// Mock site configuration
const mockSiteConfig = {
  customFields: {
    vocabularyDefaults: {
      prefix: 'isbdm',
      startCounter: 1000,
      uriStyle: 'numeric' as const,
      caseStyle: 'kebab-case' as const,
      // ... other defaults
    }
  }
};

// CSV test data for VocabularyTable
const csvTestData = [
  {
    uri: "sensoryspec:T1001",
    "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
    "skos:prefLabel@en": "aural",
    "skos:prefLabel@fr": "auditif",
    // ... multilingual data
  }
];
```

### Environment Variables
```bash
# Build environment selection
DOCS_ENV=localhost|preview|production

# Node.js memory allocation for large builds
NODE_OPTIONS=--max-old-space-size=8192
```

## Debugging and Troubleshooting

### Common Issues

#### 1. Test Timeouts
```bash
# Increase timeout for slow operations
await waitFor(() => {
  expect(screen.getByText('expected')).toBeInTheDocument();
}, { timeout: 5000 });
```

#### 2. Build Failures
```bash
# Check build logs
pnpm build 2>&1 | tee build.log

# Verify dependencies
pnpm install --frozen-lockfile
```

#### 3. Configuration Issues
```bash
# Validate site configuration
node scripts/test-site-builds.js --site ISBDM --skip-build --verbose
```

#### 4. TypeScript Errors
```bash
# Check specific files
npx tsc --noEmit packages/theme/src/config/standardSiteFactory.ts
```

### Debug Commands
```bash
# Verbose test output
pnpm test --reporter=verbose

# CI environment simulation
act -j test-site-builds

# Manual build testing
DOCS_ENV=production pnpm build ISBDM
```

## Maintenance Guidelines

### Adding New Sites
1. **Register in siteConfigCore.ts**: Add site configuration for all environments
2. **Create build test**: Add to matrix in GitHub Actions workflow
3. **Test locally**: Run full test suite before deployment
4. **Update documentation**: Add site-specific testing notes

### Updating Test Coverage
1. **Monitor test metrics**: Ensure >95% pass rate maintained
2. **Add regression tests**: For each bug fix, add preventing test
3. **Performance testing**: Monitor build time increases
4. **Documentation updates**: Keep test documentation current

### CI/CD Improvements
1. **Cache optimization**: Leverage pnpm and Node.js caching
2. **Parallel execution**: Optimize matrix strategy
3. **Artifact management**: Efficient failed build debugging
4. **Notification setup**: Alert on test failures

## Related Documentation

- **`testing-vocabulary-pages.md`** - Component-level testing strategies
- **`configuration-architecture.md`** - Site configuration system
- **`build_contamination_investigation.md`** - Historical build issue resolution
- **`new-site-setup.md`** - Adding new sites with proper testing

## Test File Locations

### Unit/Integration Tests
```
packages/theme/src/tests/
├── components/
│   ├── VocabularyTable/
│   ├── ElementReference/
│   └── ...
├── config/
│   └── standardSiteFactory.test.ts
└── scripts/
    └── ...

standards/*/docs/examples/__tests__/
└── *-integration.test.tsx
```

### Build Regression Scripts
```
scripts/
├── test-site-builds.js          # Configuration and build testing
├── test-portal-builds.sh        # Portal-specific E2E testing
└── validate-environment-urls.js  # URL validation

.github/workflows/
└── test-site-builds.yml         # CI/CD automation
```

### Configuration Files
```
vitest.config.ts                 # Unit test configuration
playwright.config.ts             # E2E test configuration (per site)
tsconfig.json                    # TypeScript configuration
```

This comprehensive testing strategy ensures reliable, consistent builds across all IFLA standards sites while preventing regressions and maintaining high code quality.