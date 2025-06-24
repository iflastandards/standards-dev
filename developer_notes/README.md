# Developer Notes

This directory contains detailed documentation for developers working on the IFLA Standards project. These notes are designed to help future developers (human or AI) understand how the system works and how to modify it.

## Structure

### Site Management
- **`new-site-setup.md`** - Complete guide for setting up new standards sites
- **`configuration-architecture.md`** - Technical details of the configuration system
- **`quick-reference.md`** - Common commands and configuration snippets

### Technical Documentation
- **command-line-scripts/** - Documentation for CLI tools and build scripts
- **sites/** - Notes about individual site configurations and customizations
- **theme/** - Documentation about the shared theme package
  - `configuration-consolidation.md` - How theme config is shared across sites
  - `sass-integration.md` - SASS setup for theme components
  - `typescript-docusaurus-issues.md` - TypeScript compatibility notes
- **tools/** - Notes about development tools and utilities
  - `language-checking-scripts.md` - Language validation tools

### Testing and Validation
- **`build-regression-testing.md`** - Comprehensive build regression testing strategy
- **`testing-vocabulary-pages.md`** - Testing vocabulary page functionality
- **`vocabulary-comparison-testing.md`** - Testing vocabulary server responses
- **`url-validation-guide.md`** - URL validation and link checking
- **`link-validation-organization.md`** - Link validation system organization

## Recent Updates

### December 2024: Centralized Configuration Migration
- **✅ MAJOR REFACTOR COMPLETED** - Migrated from environment files to TypeScript configuration matrix
- **Created centralized configuration** - `libs/shared-config/src/lib/siteConfig.ts` as single source of truth
- **Removed 36+ .env files** - Replaced with type-safe configuration matrix
- **Updated SiteLink component** - New props (`siteKey`, `path`) for environment-aware navigation
- **All tests passing** - 445 unit tests updated and verified
- **Documentation updated** - Comprehensive developer guides created

### Key Benefits of New System
- **Single source of truth** - All site configuration in one TypeScript file
- **Type safety** - Compile-time validation of site keys and environments
- **Reduced complexity** - No environment file management required
- **Better maintainability** - All URLs visible in one place
- **Easier debugging** - Clear configuration matrix for troubleshooting

### Updated Documentation
- **`site-configuration-architecture.md`** - **NEW** Complete current system documentation
- **`configuration-architecture.md`** - Updated for new system
- **`new-site-setup.md`** - Updated with current configuration patterns
- **README.md** - Updated with centralized configuration links

### Previous Updates (2025-06-13)

#### Theme Configuration Consolidation
- Created `baseDocusaurusConfig` function for shared configuration
- Simplified footer implementation across all sites
- All sites now inherit common theme settings automatically

#### SASS Integration Fixed
- Fixed ElementReference component SASS compilation
- Added proper dependencies to theme package
- Updated tsup.config.ts for SASS support

#### New Language Checking Scripts
- Added multiple scripts for language tag validation
- Support for markdown and AI-friendly output formats
- Can check MDX files, vocabularies, and SKOS data

## Note Format

Each documentation file follows this structure:

1. **Quick Usage** - Simple instructions for common tasks
2. **Developer Guide** - Detailed technical information including:
   - Location and purpose of related code
   - How the feature works
   - Related files and configurations
   - Modification guidelines
   - Troubleshooting tips

## Contributing

When adding new features or modifying existing ones, please update or create corresponding documentation in this directory. This helps maintain institutional knowledge and makes onboarding easier.

### Adding New Sites

**Quick Start**: See `new-site-setup.md` for complete step-by-step instructions.

When adding new sites to the project:

1. **Add site to configuration matrix** in `libs/shared-config/src/lib/siteConfig.ts`
2. **Create site directory** with required files (`docusaurus.config.ts`, `package.json`, etc.)
3. **Use centralized configuration utilities** (`getSiteConfig`, `mapDocsEnvToEnvironment`)
4. **Add build scripts** to root `package.json`
5. **Test locally** before deployment

The centralized system ensures:
- **Type-safe configuration** - Compile-time validation of site keys and environments
- **Environment-aware URLs** - Automatic URL generation across all environments
- **Consistent navigation** - SiteLink component for cross-site navigation
- **Reduced maintenance** - Single configuration file for all sites

See `configuration-architecture.md` for technical details and `quick-reference.md` for common patterns.

## For AI Assistants

These notes are specifically written to be helpful for AI coding assistants. They include:
- Explicit file paths
- Code examples
- Common patterns used in the project
- Warnings about potential pitfalls
- Clear modification instructions