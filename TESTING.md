# IFLA Standards Regression Testing

This document describes the automated regression testing system for IFLA standards sites.

## Overview

The regression testing system validates that all sites build correctly and have proper URL configuration across different environments. It consists of:

1. **Configuration Testing** - Validates docusaurus.config.ts files
2. **Build Testing** - Ensures sites build without errors
3. **URL Validation** - Checks sitemap generation and URL consistency
4. **Automated CI/CD** - GitHub Actions workflow for continuous testing

## Test Script Usage

### Basic Commands

```bash
# Test all sites for production environment
pnpm test:builds:all

# Test specific site
pnpm test:builds:portal
node scripts/test-site-builds.js --site ISBDM

# Test configuration only (skip builds)
pnpm test:builds:config

# Test with different environment
node scripts/test-site-builds.js --site all --env localhost

# Verbose output
node scripts/test-site-builds.js --site ISBDM --verbose
```

### Available Options

- `--site <site>` - Test specific site, "portal", or "all" (default: prompted)
- `--env <env>` - Environment: localhost, preview, production (default: localhost)
- `--skip-build` - Only test configuration, skip building
- `--verbose` - Show detailed command output

### Valid Sites

- `portal` - IFLA Standards Portal
- `ISBDM` - ISBD for Manifestation
- `LRM` - Library Reference Model
- `FRBR` - FR Family of Models
- `isbd` - International Standard Bibliographic Description
- `muldicat` - Multilingual Dictionary of Cataloguing Terms
- `unimarc` - Universal MARC Format

## What Gets Tested

### Configuration Tests

For each site's `docusaurus.config.ts`:

- ✅ **Future flags** - Checks for required `future` configuration block
- ✅ **Environment integration** - Validates use of `getSiteDocusaurusConfig` and `getCurrentEnv`
- ✅ **Site registration** - Confirms site exists in `siteConfigCore`
- ✅ **URL configuration** - Validates URL and baseUrl settings
- ✅ **Environment consistency** - Ensures no localhost URLs in production configs

### Build Tests

For each site build:

- ✅ **Clean build** - Removes previous build artifacts
- ✅ **Successful compilation** - Site builds without errors
- ✅ **Output verification** - Build directory and sitemap.xml are created
- ✅ **URL consistency** - Sitemap URLs match expected environment configuration
- ✅ **Environment isolation** - No cross-environment URL contamination

### URL Validation Tests

- ✅ **Sitemap generation** - XML sitemap is properly created
- ✅ **URL structure** - All URLs follow expected patterns
- ✅ **Environment matching** - URLs match the target environment
- ✅ **No hardcoded localhost** - Production builds don't contain localhost URLs

## Continuous Integration

### GitHub Actions Workflow

The workflow (`.github/workflows/test-site-builds.yml`) runs automatically on:

- Push to `main` or `dev` branches
- Pull requests to `main` or `dev`
- Manual trigger with custom parameters

### Workflow Jobs

1. **test-configurations** - Fast configuration validation
2. **test-site-builds** - Matrix build testing for all sites
3. **test-url-validation** - URL and sitemap validation
4. **summary** - Aggregated results and status

### Workflow Inputs

When manually triggered:

- **site** - Which site(s) to test (default: all)
- **environment** - Target environment (default: production)

### Artifacts

On test failures, the workflow uploads:

- Failed build directories
- Build logs
- Validation reports

## Future Configuration Requirements

All sites must include this configuration block:

```typescript
// Future flags for performance
future: {
  experimental_faster: false,
  v4: true,
},
```

This ensures consistent Docusaurus behavior and performance optimizations.

## Environment Configuration

Sites must use the shared configuration system:

```typescript
import { getSiteDocusaurusConfig } from '@ifla/theme/config';
import { getCurrentEnv } from '@ifla/theme/config/siteConfig.server';

const siteKey = 'ISBDM'; // or appropriate site key
const currentEnv = getCurrentEnv();
const { url, baseUrl } = getSiteDocusaurusConfig(siteKey, currentEnv);
```

This ensures proper URL generation for different deployment environments.

## Common Issues and Solutions

### Configuration Issues

**Missing future flags:**
```bash
# Error: Missing "future" configuration block
# Solution: Add the future configuration block to docusaurus.config.ts
```

**Environment configuration:**
```bash
# Error: Not using getSiteDocusaurusConfig for URL configuration
# Solution: Import and use the shared configuration functions
```

### Build Issues

**Memory issues:**
```bash
# Use higher memory limit
NODE_OPTIONS=--max-old-space-size=8192 pnpm test:builds
```

**Cache issues:**
```bash
# Clear all caches before testing
pnpm clear:all && pnpm test:builds:all
```

### URL Issues

**Localhost URLs in production:**
```bash
# Error: Sitemap contains localhost URLs in non-localhost build
# Solution: Check for hardcoded localhost URLs in source files
```

## Performance Considerations

- **Parallel testing** - Sites are tested in parallel in CI
- **Build caching** - Node modules and build artifacts are cached
- **Selective testing** - Can test individual sites to save time
- **Memory optimization** - Increased memory limits for large sites

## Extending the Tests

### Adding New Validation Rules

Edit `scripts/test-site-builds.js` in the `testSiteConfig()` function:

```javascript
// Add new configuration checks
if (!configContent.includes('newRequiredConfig')) {
  errors.push('Missing required configuration');
}
```

### Adding Site-Specific Tests

```javascript
// Add site-specific validation
if (siteKey === 'ISBDM' && !configContent.includes('vocabularyDefaults')) {
  errors.push('ISBDM missing vocabulary configuration');
}
```

### Adding New Test Commands

Add to `package.json`:

```json
{
  "scripts": {
    "test:builds:my-test": "node scripts/test-site-builds.js --my-option"
  }
}
```

## Integration with Link Validation

The regression tests work alongside the existing link validation system:

- **Build tests** ensure sites compile and have correct URLs
- **Link validation** (`validate-environment-urls.js`) checks that links work
- **Combined coverage** provides comprehensive site health monitoring

## Troubleshooting

### Local Testing

```bash
# Test just configuration (fast)
pnpm test:builds:config

# Test single site build
node scripts/test-site-builds.js --site portal --verbose

# Test with specific environment
DOCS_ENV=localhost node scripts/test-site-builds.js --site ISBDM
```

### CI/CD Debugging

1. Check workflow logs in GitHub Actions
2. Download build artifacts for failed tests
3. Review configuration validation errors
4. Verify environment variables are set correctly

### Common Fix Patterns

1. **Add future config** to missing sites
2. **Update imports** to use shared configuration
3. **Fix hardcoded URLs** in source files
4. **Clear caches** when builds are inconsistent