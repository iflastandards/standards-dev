# Build with Environment Script

## Quick Usage

The `build` command builds IFLA standards sites for different environments.

```bash
# Interactive mode (will prompt for all options)
pnpm build

# Build specific site for specific environment
pnpm build --env production --site portal

# Build all sites for preview environment with theme rebuild
pnpm build --env preview --site all --clean-theme

# Build single standard for localhost
pnpm build --env localhost --site isbdm
```

### Options
- `--env` : Environment to build for (localhost, preview, production)
- `--site` : Site to build (all, portal, isbdm, lrm, frbr, isbd, muldicat, unimarc)
- `--clean-theme` : Clean and rebuild theme package before building

## Developer Guide

### Location and Purpose
- **Script**: `/scripts/build-with-env.js`
- **Purpose**: Centralized build script that handles environment-specific builds for all IFLA sites
- **Called by**: `pnpm build` command in root package.json

### How It Works

1. **Environment Configuration**
   - Sets `DOCS_ENV` environment variable before building
   - This affects how Docusaurus configures URLs and paths
   - Valid environments: `localhost`, `preview`, `production`

2. **Interactive Mode**
   - Uses `inquirer` to prompt for missing options
   - Only prompts if arguments not provided via CLI
   - Asks for environment, site, and theme cleaning preference

3. **Theme Cleaning**
   - Optional step to ensure fresh theme build
   - Removes `packages/theme/dist` directory
   - Rebuilds theme using `pnpm --filter @ifla/theme build`
   - Useful when theme changes aren't being picked up

4. **Build Execution**
   - Delegates to individual build scripts in package.json
   - `build:all` uses concurrently to build in parallel
   - Individual builds: `build:portal`, `build:isbdm`, etc.

### Related Files

1. **package.json** (root)
   ```json
   "scripts": {
     "build": "node scripts/build-with-env.js",
     "build:all": "concurrently \"pnpm run build:portal\" ...",
     "build:portal": "docusaurus build portal",
     // ... individual build scripts
   }
   ```

2. **Site Configuration Files**
   - Each site has its own `docusaurus.config.ts`
   - These read `DOCS_ENV` to set appropriate baseUrl and url

### Environment Impact

The `DOCS_ENV` variable affects:
- **localhost**: baseUrl = '/', url = 'http://localhost:3000'
- **preview**: baseUrl = '/standards-dev/', url = 'https://iflastandards.github.io'
- **production**: baseUrl = '/', url = 'https://www.iflastandards.info'

### Modifying the Script

To add a new site:
1. Add the site name to `validSites` array
2. Ensure corresponding `build:{sitename}` script exists in package.json

To add a new environment:
1. Add to `validEnvironments` array
2. Update site config files to handle the new environment

To add new build options:
1. Add option using `program.option()`
2. Extract from `options` in main function
3. Add interactive prompt if needed
4. Implement the feature logic

### Troubleshooting

**Import errors with inquirer**
- The script uses CommonJS require syntax
- Note the `.default` when importing inquirer

**Theme not updating**
- Use `--clean-theme` flag to force rebuild
- Check that theme package.json has proper build script

**Build failures**
- Check that all sites have proper docusaurus.config.ts
- Ensure pnpm dependencies are installed
- Verify Node version meets requirements (>=18.0)

### Example Workflows

**Daily Development**
```bash
# Quick build for testing
pnpm build --env localhost --site portal
```

**Before PR/Deployment**
```bash
# Full clean build to catch issues
pnpm build --env preview --site all --clean-theme
```

**Testing Production URLs**
```bash
# Build with production URLs to verify links
pnpm build --env production --site all
```

## Troubleshooting

### Broken Links Error

If you get "Docusaurus found broken links!" errors during build:

1. **Check for missing pages**: Create placeholder pages for missing docs
2. **Verify link paths**: Ensure links match the actual file structure
3. **Check RDF files**: Ensure static RDF files exist in `static/rdf/` directories
4. **Temporary fix**: Set `onBrokenLinks: 'warn'` in docusaurus.config.ts

**Example fix for LRM site (2024-12-12)**:
- Created missing `docs/elements.md` and `docs/examples.md`
- Created `docs/intro/index.mdx` to match ISBDM pattern
- Created placeholder RDF files in `static/rdf/{ttl,jsonld,xml}/`
- Updated navbar `docId` to match folder structure
- Set `onBrokenLinks: 'warn'` to allow builds with warnings

### Build Script Import Errors

**inquirer.prompt is not a function**
- Check inquirer import: use `require('inquirer')` (not `.default`)
- Verify Node/pnpm versions meet requirements

### Theme Not Updating

**Changes not reflected in build**
- Use `--clean-theme` flag to force theme rebuild
- Check that `packages/theme/package.json` has proper build script
- Verify theme package dependencies are installed