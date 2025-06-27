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