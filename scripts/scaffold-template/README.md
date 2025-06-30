# Scaffold Template

This directory contains a complete site template used for scaffolding new IFLA standards sites. The template provides a rich, professional structure that matches the current ISBD site pattern while remaining generic for any standard.

## Template Structure

### **Generated Configuration Files**
- `docusaurus.config.ts.template` - Complete Docusaurus configuration with placeholders
- `project.json.template` - Nx project configuration for workspace integration
- `tsconfig.json` - TypeScript configuration with composite project setup

### **Complete Content Structure**

#### **Documentation (`docs/`)**
- `index.mdx` - **Tabbed overview page** with Element Sets, Value Vocabularies, and Documentation tabs
- `about.mdx` - Standard background and history
- `assessment.mdx` - Implementation guidelines and evaluation criteria
- `examples.mdx` - Practical usage examples and use cases
- `glossary.mdx` - Key terms and definitions
- `introduction.mdx` - Getting started guide
- `elements/index.mdx` - Elements overview with DocCardList component
- `terms/index.mdx` - Vocabularies overview with DocCardList component

#### **Application Pages (`src/pages/`)**
- `index.mdx` - **Homepage** with IFLA branding and feature highlights
- `manage.mdx` - **Management dashboard** using SiteManagement component
- `rdf.tsx` - **RDF downloads page** for data exports
- `sitemap.tsx` - Site navigation map
- `sitemap.module.scss` - Sitemap styling

#### **Components (`src/components/`)**
- `CompactButton.tsx` - **Reusable navigation button** component
- `CompactButton.module.css` - Button styling with consistent IFLA theme

#### **Styling (`src/css/`)**
- `custom.scss` - Site-specific SCSS styles (updated from CSS)

#### **Blog System (`blog/`)**
- `authors.yml` - Blog authors template with placeholders

#### **Data Directories**
- `rdf/` - RDF output directories (jsonld, nt, ttl, xml) with .gitkeep files
- `static/img/` - Static assets directory with .gitkeep

### **Navigation**
- `sidebars.ts` - Sidebar configuration template

## Template Placeholders

### **Primary Placeholders**
- `{{TITLE}}` - Full site title (e.g., "International Standard Bibliographic Description")
- `{{TAGLINE}}` - Site tagline/description
- `{{SITE_KEY}}` - Site identifier (e.g., 'isbd', 'lrm')
- `{{SITE_KEY_LOWER}}` - Lowercase site key
- `{{NAVBAR_TITLE}}` - Navigation bar title
- `{{SITE_CODE}}` - Short site code

### **Configuration Placeholders**
- `{{PORT}}` - Development server port
- `{{PROJECT_NAME}}` - GitHub project name
- `{{VOCABULARY_PREFIX}}` - Vocabulary URI prefix
- `{{VOCABULARY_PROFILE}}` - Main vocabulary profile filename
- `{{ELEMENT_URI}}` - Element namespace URI
- `{{ELEMENT_PROFILE}}` - Elements profile filename

### **Content Placeholders**
- `{{LAST_UPDATED}}` - Last modification date

## Key Features

### **Tabbed Overview Page**
The main `docs/index.mdx` provides a comprehensive overview with three tabs:

1. **Element Sets Tab**: 
   - Constrained and unconstrained elements
   - Feature highlights with element counts
   - Navigation to element documentation

2. **Value Vocabularies Tab**:
   - Primary, supporting, and extension vocabularies
   - Linked data integration information
   - URI and semantic web details

3. **Documentation Tab**:
   - Links to all documentation sections
   - Consistent navigation with CompactButton components
   - Complete content organization

### **CompactButton Component**
```typescript
interface CompactButtonProps {
  href: string;
  children: React.ReactNode;
}
```
- Consistent styling across all navigation elements
- Integration with @ifla/theme InLink component
- CSS module for scoped styling

### **Professional Content Structure**
- **Rich documentation**: Comprehensive pages for all aspects of standards
- **IFLA branding**: Consistent visual identity and messaging
- **Responsive design**: Mobile-friendly layouts and components
- **Accessibility**: Semantic markup and proper navigation

## Usage

### **Automatic Scaffolding**
```bash
pnpm tsx scripts/scaffold-site.ts \
  --siteKey=newsite \
  --title="New Standard" \
  --tagline="A new IFLA standard"
```

### **Scaffolding Process**
1. **Validates input** (site key format, uniqueness)
2. **Copies template structure** to new site directory
3. **Generates configurations** from .template files
4. **Replaces placeholders** throughout all files
5. **Updates package.json** with site-specific scripts
6. **Creates blog content** from configuration
7. **Sets up Nx integration** with proper dependencies

### **Template Integration**
- **Theme components**: Uses @ifla/theme for consistent UI
- **TypeScript support**: Full type safety and IntelliSense
- **Nx workspace**: Integrated build system and caching
- **SCSS styling**: Modern styling with variables and mixins

## Maintenance

### **Updating the Template**
When making changes that should apply to all future sites:

1. **Update template files** in this directory
2. **Test with scaffold-site script** to ensure generation works
3. **Verify TypeScript compilation** and lint checks pass
4. **Update this README** if structure changes significantly
5. **Consider impact** on existing sites (may need migration)

### **Adding New Features**
1. **Add to appropriate template directories** with placeholders
2. **Update site-template.ts** if new placeholders are needed
3. **Test generation** with actual scaffolding
4. **Document new features** in this README and main developer docs

## Technical Requirements

- **Node.js/TypeScript**: Full TypeScript integration
- **React Components**: JSX/TSX support with proper typing
- **SCSS Styling**: Sass preprocessing and CSS modules
- **Nx Workspace**: Build system integration and caching
- **Docusaurus v3.8**: Latest features and optimizations

## Notes

- **ISBD Pattern**: Template structure matches current ISBD site for consistency
- **Self-contained**: Generated configurations don't rely on shared configs
- **Isolation**: Each site operates independently to prevent contamination
- **Extensible**: Easy to add new components and features
- **Professional**: Enterprise-ready with complete documentation structure
