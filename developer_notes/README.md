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

## Recent Updates (2025-06-15)

### Configuration Factory System
- **Created `standardSiteFactory.ts`** - Reduces site configuration from 125+ lines to ~43 lines (66% reduction)
- **Centralized configuration** - All sites use `siteConfigCore.ts` as source of truth for paths and environments
- **Environment-aware URLs** - Automatic URL generation for localhost, preview, and production
- **Standardized navigation** - All sites get consistent navigation with site-specific customizations

### Site Configuration Improvements
- **LRM site refactored** - Successfully migrated to use factory configuration
- **Portal configuration optimized** - Already well-structured, no changes needed
- **Vocabulary defaults centralized** - Leverages existing `VOCABULARY_DEFAULTS` infrastructure
- **Consistent navigation** - All sites get `standardsDropdown` and proper cross-site links

### Documentation Added
- **`new-site-setup.md`** - Complete guide for site administrators
- **`configuration-architecture.md`** - Technical documentation for developers
- **`quick-reference.md`** - Common commands and configuration snippets

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

1. **Add site to core configuration** in `packages/theme/src/config/siteConfigCore.ts`
2. **Create site directory** with required files (`docusaurus.config.ts`, `package.json`, etc.)
3. **Use the factory function** `createStandardSiteConfig()` for consistent configuration
4. **Add build scripts** to root `package.json`
5. **Test locally** before deployment

The factory system ensures:
- **Automatic tooling integration** - Link validation, navigation, deployment workflows
- **Consistent configuration** - All sites get same base features and navigation
- **Environment-aware URLs** - Proper URL generation across localhost, preview, production
- **Reduced maintenance** - 66% less configuration code per site

See `configuration-architecture.md` for technical details and `quick-reference.md` for common patterns.

## For AI Assistants

These notes are specifically written to be helpful for AI coding assistants. They include:
- Explicit file paths
- Code examples
- Common patterns used in the project
- Warnings about potential pitfalls
- Clear modification instructions