# IFLA Preset (@ifla/preset-ifla)

## Usage

The IFLA preset provides a complete Docusaurus configuration for IFLA standards sites. It eliminates the need for complex factory functions and prevents Node.js module caching contamination.

### Basic Usage

```typescript
// docusaurus.config.ts
import type { Config } from '@docusaurus/types';
import preset from '@ifla/preset-ifla';

const config: Config = {
  ...preset(
    {}, // context - empty for now
    {
      siteKey: 'LRM',
      title: 'IFLA LRM',
      tagline: 'Library Reference Model',
      
      // Optional: Override vocabulary defaults
      vocabularyDefaults: {
        numberPrefix: "E", // LRM uses "E" instead of default "T"
      },

      // Optional: Add custom navbar items
      customNavbarItems: [
        {
          type: 'doc',
          docId: 'intro/intro',
          position: 'left',
          label: 'Introduction',
        },
      ],

      // Optional: Navigation customization
      navigation: {
        hideCurrentSiteFromStandardsDropdown: true,
        standardsDropdownPosition: 'right',
        includeResourcesDropdown: false,
      },

      // Optional: GitHub edit URL
      editUrl: 'https://github.com/iflastandards/LRM/tree/main/',
    }
  )
};

export default config;
```

## Developer Section

### How It Works

The preset provides:
1. **URL Resolution** - Automatic environment-aware URLs (localhost/preview/production)
2. **Vocabulary Defaults** - Pre-configured settings for each standard (ISBDM, LRM, etc.)
3. **Cross-Site Navigation** - Standards dropdown and footer links
4. **Theme Configuration** - IFLA branding, dark mode, announcement bar
5. **Static Assets** - Shared IFLA logo, favicon from theme package
6. **CustomFields** - Proper setup for VocabularyTable and ElementReference components

### Key Files

- **Main preset**: `packages/preset-ifla/src/index.ts`
- **Theme builder**: `packages/preset-ifla/src/theme.ts`
- **URL utilities**: `packages/preset-ifla/src/utils.ts`
- **TypeScript types**: `packages/preset-ifla/src/types.ts`

### Environment Detection

The preset automatically detects the environment from `DOCS_ENV`:
- `localhost` - Development with port-specific URLs
- `preview` - GitHub Pages preview deployment
- `production` - Production deployment

### Vocabulary Defaults

Each standard has pre-configured vocabulary settings:
- **ISBDM**: prefix "isbdm", numberPrefix "T"
- **LRM**: prefix "lrm", numberPrefix "E"
- **ISBD**: prefix "isbd", numberPrefix "T"
- **Generic**: Fallback for other standards

### Building the Preset

```bash
# Build the preset package
pnpm --filter @ifla/preset-ifla build

# The preset must be built before sites can use it
```

### Migration from Factory

To migrate from the old factory approach:
1. Replace `createStandardSiteConfig` import with preset import
2. Wrap preset call with spread operator: `...preset({}, options)`
3. Remove `projectName` if it matches `siteKey`
4. Test the build works correctly

### Troubleshooting

**Module not found error**: Ensure the preset is built first
**404 for logo/favicon**: Check `staticDirectories` includes theme static folder
**Wrong environment URLs**: Check `DOCS_ENV` environment variable
**Missing customFields**: Ensure using latest preset version

### Important Notes

- The preset returns a complete Docusaurus config object
- Use spread operator to merge preset result into config
- The preset is stateless - each call gets a fresh instance
- No shared state between builds prevents contamination