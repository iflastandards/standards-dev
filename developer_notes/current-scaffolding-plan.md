# Current Site Scaffolding System
**Status: COMPLETED AND OPERATIONAL**

## Overview
The scaffolding system is a complete site generation framework that creates new IFLA standards sites with:
- **Comprehensive template structure** matching the current ISBD pattern
- **Dynamic configuration generation** from template files
- **Rich content structure** with tabbed overview pages
- **Consistent UI components** and styling

### Core Components:
1. **scaffold-site.ts** - Main scaffolding script using the complete template system
2. **scaffold-template/** - Complete site template with all structure and components
3. **site-template.ts** - Template generation logic with placeholder replacement
4. **Individual site configs** - Self-contained configurations for each site

## Current Scaffold Template Structure

### **Template Files (Generated):**
- **`docusaurus.config.ts.template`** - Complete Docusaurus configuration with placeholders
- **`project.json.template`** - Nx project configuration for workspace integration

### **Content Structure:**
```
scripts/scaffold-template/
├── docs/
│   ├── index.mdx                    # Tabbed overview (Element Sets, Vocabularies, Documentation)
│   ├── about.mdx                    # Standard background and history
│   ├── assessment.mdx               # Implementation guidelines
│   ├── examples.mdx                 # Practical usage examples
│   ├── glossary.mdx                 # Key terms and definitions
│   ├── introduction.mdx             # Getting started guide
│   ├── elements/index.mdx           # Elements overview with DocCardList
│   └── terms/index.mdx              # Vocabularies overview with DocCardList
├── src/
│   ├── pages/
│   │   ├── index.mdx                # Homepage with IFLA branding
│   │   ├── manage.mdx               # Management dashboard
│   │   ├── rdf.tsx                  # RDF downloads page
│   │   ├── sitemap.module.scss      # Sitemap styling
│   │   └── sitemap.tsx              # Sitemap component
│   ├── components/
│   │   ├── CompactButton.tsx        # Reusable button component
│   │   └── CompactButton.module.css # Button styling
│   └── css/custom.scss              # Site-specific styles
├── blog/
│   └── authors.yml                  # Blog authors template
├── rdf/                             # RDF output directories (with .gitkeep files)
│   ├── jsonld/ ├── nt/ ├── ttl/ └── xml/
├── static/img/                      # Static assets (with .gitkeep)
├── tsconfig.json                    # TypeScript configuration
├── sidebars.ts                      # Navigation structure
└── site-config.json                # Configuration placeholder
```

### **Key Features:**

#### **Tabbed Overview Page:**
- **Element Sets tab**: Shows constrained and unconstrained elements
- **Value Vocabularies tab**: Displays primary, supporting, and extension vocabularies  
- **Documentation tab**: Links to all documentation sections
- **CompactButton component**: Consistent navigation styling

#### **Template Placeholders:**
- `{{TITLE}}` - Site title
- `{{TAGLINE}}` - Site tagline/description
- `{{SITE_KEY}}` - Site identifier (e.g., 'isbd', 'lrm')
- `{{SITE_KEY_LOWER}}` - Lowercase site key
- `{{PORT}}` - Development server port
- `{{VOCABULARY_PREFIX}}` - Vocabulary URI prefix
- `{{ELEMENT_URI}}` - Element namespace URI
- `{{PROJECT_NAME}}` - GitHub project name
- `{{NAVBAR_TITLE}}` - Navigation bar title
- `{{SITE_CODE}}` - Short site code
- `{{LAST_UPDATED}}` - Last modification date

## Scaffolding Workflow

### **Creating a New Site:**
```bash
pnpm tsx scripts/scaffold-site.ts \
  --siteKey=newsite \
  --title="New Standard" \
  --tagline="A new IFLA standard"
```

### **What Happens:**
1. **Validates site key** (alphanumeric, starts with letter, max 20 chars)
2. **Creates directory structure** from scaffold-template
3. **Generates configurations** from .template files with placeholder replacement
4. **Updates package.json** with site-specific scripts
5. **Creates blog content** from site configuration
6. **Sets up Nx integration** with proper dependencies

### **Template Integration:**
- **Uses ISBD pattern**: Matches current ISBD site structure and styling
- **Component consistency**: Shared CompactButton and navigation patterns
- **Theme integration**: Leverages @ifla/theme components and utilities
- **TypeScript compliant**: Full type safety and IntelliSense support

## Component Documentation

### **CompactButton Component:**
```typescript
interface CompactButtonProps {
  href: string;
  children: React.ReactNode;
}
```
- **Usage**: Navigation buttons in tabbed overview and documentation pages
- **Styling**: CSS module with consistent IFLA theme styling
- **Integration**: Uses @ifla/theme InLink component for site-aware navigation

### **Template Configuration:**
- **TypeScript compliant**: Full composite project setup with references
- **Nx integration**: Proper workspace dependencies and caching
- **SCSS support**: Updated from CSS to SCSS for consistency
- **Port management**: Automatic port assignment and conflict resolution

## Maintenance Guide

### **Updating the Scaffold Template:**
When making changes that should apply to all future sites:

1. **Update template files** in `scripts/scaffold-template/`
2. **Test template generation** with scaffold-site script
3. **Verify TypeScript compilation** and lint checks
4. **Update documentation** if structure changes
5. **Consider impact** on existing sites (may need migration)

### **Adding New Template Features:**
1. **Add to scaffold-template/** with appropriate placeholders
2. **Update site-template.ts** if new placeholders needed
3. **Test with actual site generation**
4. **Document new features** in this file and README

### **Troubleshooting:**
- **Build failures**: Check TypeScript configuration and theme references
- **Missing components**: Ensure CompactButton and other dependencies are copied
- **Port conflicts**: Use robust startup commands or port manager
- **Broken links**: Verify placeholder replacement and site structure

## Current Status
- ✅ **Scaffold template**: Complete with ISBD-matching structure
- ✅ **Component system**: CompactButton and tabbed overview implemented
- ✅ **Configuration generation**: Self-contained configs with proper isolation
- ✅ **Nx integration**: Full workspace support with dependencies
- ✅ **TypeScript compliance**: Composite projects with proper references
- ✅ **Testing integration**: Pre-commit and build validation
- ✅ **Documentation**: Rich content structure with professional presentation

## Active Sites Using Template:
- **Portal**: Management and landing site
- **ISBD**: International Standard Bibliographic Description
- **ISBDM**: ISBD Manifesto
- **LRM**: Library Reference Model  
- **FRBR**: Functional Requirements for Bibliographic Records
- **MulDiCat**: Multilingual Dictionary of Cataloguing
- **UniMARC**: Universal MARC format
- **NewTest**: Testing site for new features

Last Updated: 2025-01-30