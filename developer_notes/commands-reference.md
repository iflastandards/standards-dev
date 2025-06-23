# IFLA Standards Dev - Complete Commands Reference

This document contains all available commands in the IFLA standards-dev monorepo project.

## Quick Usage
The most common commands you'll use:
- `pnpm build:{site}` - Build a specific site
- `pnpm lint:fix` - Fix linting issues
- `pnpm start:{site}` - Start dev server for a site
- `pnpm test` - Run tests

## Developer Information

### Command Categories
Commands are organized by their primary function. All commands are run from the project root unless otherwise specified.

### Port Assignments
- Portal: 3000
- ISBDM: 3001  
- LRM: 3002
- FRBR: 3003
- ISBD: 3004
- MulDiCat: 3005
- UNIMARC: 3006

---

## 🔨 Build Commands

### Build All Sites
```bash
pnpm build:all              # Build all sites in parallel (theme first)
pnpm build:all:safe         # Clear all builds then build everything
pnpm build:all:sequential   # Build all sites sequentially
pnpm deploy:build-all       # Build all for deployment
pnpm ci:build-all           # Build all for CI (includes vocab release dry-run)
```

### Build Individual Sites
```bash
pnpm build:portal           # Build portal site
pnpm build:isbdm            # Build ISBDM site
pnpm build:lrm              # Build LRM site
pnpm build:frbr             # Build FRBR site
pnpm build:isbd             # Build ISBD site
pnpm build:muldicat         # Build MulDiCat site
pnpm build:unimarc          # Build UNIMARC site
```

### Build Packages
```bash
pnpm build:theme            # Build the theme package
```

### Special Build Commands
```bash
pnpm build-env              # Build with environment configuration
pnpm docs:build             # Build documentation
```

## 🔍 Lint & Format Commands

### ESLint Commands
```bash
pnpm lint                   # Run ESLint on all files
pnpm lint:eslint            # Same as lint
pnpm lint:fix               # Run ESLint and fix issues
pnpm lint:quiet             # Run ESLint quietly (suppress warnings)
pnpm lint:quiet:fix         # Fix quietly (suppress warnings)
```

### MDX/Markdown Linting
```bash
pnpm lint:mdx               # Lint MDX/MD files with remark
pnpm format:mdx             # Format MDX files with remark
```

## 🧪 Test Commands

### Test Execution
```bash
pnpm test                   # Run vitest
pnpm test:ui                # Run vitest with UI
pnpm test:watch             # Run vitest in watch mode
pnpm ci:test                # Run lint and tests for CI
```

### Type Checking
```bash
pnpm typecheck              # Run TypeScript type checking (tsc --noEmit)
```

## 💻 Development Commands

### Start Development Servers
```bash
pnpm start                  # Start default dev server
pnpm start:all              # Start all dev servers (ports 3000-3006)
pnpm start:portal           # Start portal dev server (port 3000)
pnpm start:isbdm            # Start ISBDM dev server (port 3001)
pnpm start:lrm              # Start LRM dev server (port 3002)
pnpm start:frbr             # Start FRBR dev server (port 3003)
pnpm start:isbd             # Start ISBD dev server (port 3004)
pnpm start:muldicat         # Start MulDiCat dev server (port 3005)
pnpm start:unimarc          # Start UNIMARC dev server (port 3006)
pnpm stop:all               # Stop all dev servers
```

### Serve Built Sites
```bash
pnpm serve                  # Serve built portal
pnpm serve:all              # Serve all built sites
pnpm serve:portal           # Serve built portal
pnpm serve:isbdm            # Serve built ISBDM (port 3001)
pnpm serve:lrm              # Serve built LRM (port 3002)
pnpm serve:frbr             # Serve built FRBR (port 3003)
pnpm serve:isbd             # Serve built ISBD (port 3004)
pnpm serve:muldicat         # Serve built MulDiCat (port 3005)
pnpm serve:unimarc          # Serve built UNIMARC (port 3006)
```

## ✅ Validation Commands

### Link Validation
```bash
pnpm validate:navigation         # Validate navigation URLs
pnpm validate:navigation:show    # Show navigation validation results
pnpm validate:site-links         # Validate site links
pnpm validate:built-site         # Validate built site links
pnpm validate:env-urls           # Validate environment URLs
pnpm validate:isbdm-links        # Validate ISBDM-specific links
```

## 🧹 Clean Commands

### Clear Everything
```bash
pnpm clear:all              # Clear all builds, caches, and dist directories
```

### Clear Specific Areas
```bash
pnpm clear                  # Clear Docusaurus cache
pnpm clear:packages         # Clear theme dist directory
pnpm clear:sites            # Clear all site builds and .docusaurus directories
pnpm clear:theme            # Clear theme dist and .docusaurus directories
pnpm clear:webpack          # Clear webpack cache
```

Note: All clear commands use `rimraf` for cross-platform compatibility.

## 📊 Vocabulary & Sheet Commands

### Sheet Operations
```bash
pnpm sheets:export          # Export sheets
pnpm sheets:import          # Import sheets
pnpm sheets:ingest          # Ingest sheets to MDX
pnpm sheet:create           # Create new sheet
```

### Vocabulary Management
```bash
pnpm vocabulary:create      # Create vocabulary sheet
pnpm vocabulary:create-action # Create vocabulary sheet action
pnpm compare:vocabulary     # Compare vocabularies
pnpm compare:vocabulary:md  # Compare vocabularies (markdown output)
pnpm compare:vocabulary:validate # Validate vocabulary comparison
pnpm vocab:release          # Release vocabulary
```

## 🚢 Deploy Commands

```bash
pnpm deploy                 # Trigger GitHub deploy workflow
pnpm deploy:status          # Check deploy status (last 5 runs)
pnpm docs:release           # Release documentation
```

## 🛠️ Utility Commands

### Scaffolding & Generation
```bash
pnpm scaffold               # Create new IFLA standard (tsx script)
pnpm dctap:generate         # Generate DCTAP spreadsheet template
pnpm write-heading-ids      # Write heading IDs to MDX files
pnpm write-translations     # Write translations
```

### Language & Content Checks
```bash
pnpm check:languages        # Check missing languages
pnpm check:languages:help   # Show help for language check
pnpm check:language-tags    # Check mediatype languages
pnpm check:language-tags:ai # Check with AI assistance
pnpm check:language-tags:ai:md # AI check with markdown output
pnpm check:language-tags:ai:test # Test AI language tag checking
pnpm check:language-tags:help # Show help for language tags
pnpm check:language-tags:md # Check language tags (markdown output)
pnpm detect:language-mismatches # Detect language mismatches
pnpm detect:language-mismatches-local # Detect local language mismatches
pnpm detect:language-mismatches-skos # Detect SKOS language mismatches
```

### RDF Operations
```bash
pnpm rdf:to-csv             # Convert RDF to CSV
pnpm rdf:folder-to-csv      # Convert RDF folder to CSV
```

### Profile Management
```bash
pnpm profile-copy           # Copy profiles (tsx tool)
```

### Docusaurus Commands
```bash
pnpm swizzle                # Docusaurus swizzle components
```

### Git Hooks
```bash
pnpm prepare                # Setup Husky git hooks
```

## 🎯 Common Workflows

### Before Committing
```bash
pnpm lint:fix               # Fix linting issues
pnpm typecheck              # Check TypeScript
pnpm test                   # Run tests
```

### Building After Theme Changes
```bash
pnpm build:theme            # Build the theme package
pnpm build:lrm              # Test with one site first
```

### Full Site Validation
```bash
pnpm build:all:safe         # Clean build everything
pnpm validate:navigation    # Check navigation
pnpm validate:built-site    # Check built sites
pnpm validate:env-urls      # Check environment URLs
```

### Testing a Single Site
```bash
pnpm build:lrm              # Build specific site
pnpm serve:lrm              # Serve to test
# OR for development
pnpm start:lrm              # Start dev server
```

### Cleaning Up Problems
```bash
pnpm clear:all              # Clear all caches, builds, and dist directories
pnpm clear:packages         # Clear just theme dist
pnpm clear:sites            # Clear just site builds
pnpm clear:webpack          # Just clear webpack cache
pnpm build:all:safe         # Clean rebuild everything
```

## 📝 Notes

### Environment Variables
- `DOCS_ENV` - Controls environment (localhost, preview, production)
- `NODE_ENV` - Standard Node environment variable

### Lint-Staged
Configured to run `eslint --quiet --fix` on staged JS/JSX/TS/TSX files

### Package Management
- Using pnpm v10.12.1
- Node v22.16.0 (via Volta)
- Workspaces configured for monorepo

### CI/CD
- GitHub Actions workflow: `deploy-all.yml`
- Runs on push to main branch
- Smart change detection for selective builds

---

## Modification Hints

To add a new site:
1. Create the site directory under `standards/`
2. Add build command to package.json: `"build:newsite": "docusaurus build standards/newsite"`
3. Add start command: `"start:newsite": "docusaurus start standards/newsite --port 30XX"`
4. Add serve command: `"serve:newsite": "docusaurus serve standards/newsite --port 30XX"`
5. Update build:all commands to include the new site
6. Add to SITES array in shared-config configuration

To add a new validation:
1. Create script in `scripts/` directory
2. Add command to package.json scripts section
3. Follow naming pattern: `validate:thing-to-validate`
