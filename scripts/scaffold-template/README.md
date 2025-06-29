# Scaffold Template

This directory contains template files used for scaffolding new IFLA standards sites.

## Template Placeholders

The following placeholders are used throughout the template files and should be replaced when scaffolding a new site:

### Required Placeholders

- `__CODE__` - The short code for the standard (e.g., "LRM", "ISBDM", "fr")
- `__LOWERCASE_CODE__` - The lowercase version of the code (e.g., "lrm", "isbdm", "fr")
- `__TITLE__` - The full title of the standard (e.g., "IFLA LRM", "ISBD for Manifestation")
- `__TAGLINE__` - A brief description/tagline for the standard
- `__PREFIX__` - The vocabulary prefix (e.g., "lrm", "isbdm", "ifla")
- `__NUMBER_PREFIX__` - The element number prefix (e.g., "E", "T")
- `__PROFILE__` - The main vocabulary profile CSV filename
- `__ELEMENTS_URI__` - The base URI for elements
- `__ELEMENTS_PROFILE__` - The elements profile CSV filename
- `__EDIT_URL__` - The GitHub edit URL for the standard

## Template Files

### Configuration Files

- `.config/docusaurus.config.ts` - Main Docusaurus configuration template
- `.config/sheet.json` - Google Sheets configuration template
- `.config/vocab.yaml` - Vocabulary configuration template
- `sidebars.ts` - Sidebar configuration template

### Content Files

- `docs/index.mdx` - Main landing page template with QuickStart and DownloadPanel components

### Directory Structure

- `blog/` - Blog posts directory (empty)
- `csv/` - CSV source files directory
- `csv/vocabs/` - Vocabulary CSV files directory
- `rdf/` - RDF output directories (jsonld, nt, ttl, xml)
- `scripts/` - Site-specific scripts directory

## Usage

This template is used by scaffolding scripts to create new standards sites with consistent structure and configuration. The scaffolding process should:

1. Copy all template files to the new site directory
2. Replace all placeholders with actual values
3. Set up the appropriate directory structure
4. Initialize any necessary configuration files

## Notes

- The template follows the current generic configuration pattern used by all IFLA standards sites
- All sites use the shared `@ifla/theme` package for components and configuration
- The configuration uses `createStandardSiteConfig()` for consistency across sites
