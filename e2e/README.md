# End-to-End Tests

This directory contains Playwright end-to-end tests for validating the IFLA Standards sites.

## Test Files

- `portal-smoke.spec.ts` - Basic smoke tests for the portal site
- `standards-smoke.spec.ts` - Smoke tests for standards sites  
- `vocabulary-functionality.spec.ts` - Tests for vocabulary functionality
- `site-validation.spec.ts` - Comprehensive validation of all sites including:
  - URL validation for different environments
  - Image and graphics loading verification
  - Link validation (internal and external)
  - Base URL configuration checks
  - Critical resource loading (no 404s)
  - Navigation functionality

## Running Tests

### Local Development
```bash
# Run all e2e tests (requires servers to be running)
pnpm e2e

# Run site validation tests only
pnpm exec nx run standards-dev:e2e:site-validation

# Run with UI mode for debugging
pnpm exec nx run standards-dev:e2e:ui
```

### Environment-Specific Testing
```bash
# Test against dev environment
pnpm exec nx run standards-dev:e2e:site-validation:dev

# Test against preview environment  
pnpm exec nx run standards-dev:e2e:site-validation:preview

# Test against production environment
pnpm exec nx run standards-dev:e2e:site-validation:production
```

## Site Validation Test

The `site-validation.spec.ts` test validates each site across different environments:

### Environments
- `localhost` - Local development servers
- `dev` - Development environment (jonphipps.github.io)
- `preview` - Preview environment (iflastandards.github.io)
- `production` - Production environment (www.iflastandards.info)

### Test Coverage
1. **URL Validation** - Ensures sites load at correct URLs for each environment
2. **Image Loading** - Verifies all images and CSS background images load without errors
3. **Link Validation** - Checks that all links match the correct environment pattern
4. **Base URL Configuration** - Validates Docusaurus baseUrl configuration
5. **Resource Loading** - Ensures no critical resources return 404 errors
6. **Navigation** - Tests navigation menu functionality

### Configuration
The test uses the site configuration from `packages/theme/src/config/siteConfigCore.ts` which defines URLs and base paths for each site in each environment.

## CI Integration

The e2e tests are integrated into the CI pipeline:
- Run automatically on pull requests via `nx affected:e2e`
- Can be triggered manually via the `site-validation.yml` workflow
- Run after deployments to validate the deployed sites

## Troubleshooting

### Tests Timeout
- Ensure all required servers are running (`pnpm start:all`)
- Check that the correct environment is set via `DOCS_ENV` variable
- Verify network connectivity to external environments

### Failed Image/Link Checks
- Check console output for specific URLs that failed
- Verify base URL configuration in site settings
- Ensure assets are properly built and deployed