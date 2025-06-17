# IFLA Theme

A comprehensive shared theme system for IFLA standard sites built on Docusaurus 3.

## Features

- **🎨 Consistent IFLA Branding**: Navy, blue, and gold color scheme with proper dark mode support
- **📱 Responsive Components**: Mobile-first components optimized for all screen sizes
- **🔧 Reusable Components**: ElementReference, VocabularyTable, InLink, OutLink, and more
- **🎯 Type Safety**: Full TypeScript support with comprehensive type definitions
- **♿ Accessibility**: WCAG compliant with proper focus management and screen reader support
- **🌐 Internationalization**: Built-in support for multilingual content
- **⚡ Performance**: Optimized components with proper memoization and lazy loading
- **🔍 Search Integration**: Pre-configured search with @easyops-cn/docusaurus-search-local

## Installation

```bash
# Using pnpm (recommended)
pnpm add @ifla/theme

# Using npm
npm install @ifla/theme

# Using yarn
yarn add @ifla/theme
```

## Quick Start

### 1. Basic Setup

In your `docusaurus.config.ts`:

```typescript
import type { Config } from '@docusaurus/types';
import { commonDefaults, getSiteDocusaurusConfig, getCurrentEnv, DocsEnv, SiteKey } from '@ifla/theme/config/siteConfig.server';

// Unique key for the site, matching the key in siteConfig.ts
const siteKey: SiteKey = 'my-standard'; 

const currentEnv: DocsEnv = getCurrentEnv();
const currentSiteConfig = getSiteDocusaurusConfig(siteKey, currentEnv);

const config: Config = {
  ...commonDefaults,
  url: currentSiteConfig.url,
  baseUrl: currentSiteConfig.baseUrl,

  title: 'My IFLA Standard',
  tagline: 'A comprehensive library standard',

  organizationName: 'iflastandards',
  projectName: 'my-standard',

  // ... other site-specific configurations
};

export default config;
```

This setup leverages a centralized configuration that is aware of the deployment environment (`localhost`, `preview`, `production`) via the `DOCS_ENV` environment variable.

### 2. Import Styles

In your `src/css/custom.css`:

```css
@import '@ifla/theme/styles';

/* Your custom styles here */
```

### 3. Use Components

In your MDX files:

```mdx
import { ElementReference, VocabularyTable, InLink, SiteLink } from '@ifla/theme/components';

# My Element

<ElementReference frontMatter={frontMatter} />

## See Also

- See <InLink href="/docs/related-element">Related Element</InLink> for an internal link.
- See <SiteLink toSiteKey="other-standard" path="/docs/some-page">Another Standard</SiteLink> for a link to another site.

## Vocabulary

<VocabularyTable csvUrl="/data/vocabulary.csv" />

## Components

### SiteLink

Creates an environment-aware link to another Docusaurus site within the monorepo. It automatically resolves the correct URL for `localhost`, `preview`, and `production` builds.

```tsx
import { SiteLink } from '@ifla/theme/components';

<SiteLink toSiteKey="LRM" path="/docs/lrm-overview">Read the LRM Overview</SiteLink>
```

### ElementReference

Displays element information with tabs for different RDF formats (JSON-LD, Turtle, RDF/XML).

```tsx
import { ElementReference } from '@ifla/theme/components';

<ElementReference 
  frontMatter={{
    RDF: {
      label: "Title",
      definition: "A name given to the resource",
      uri: "https://example.org/elements/title",
      type: "Property"
    }
  }} 
/>
```

### VocabularyTable

Displays vocabulary terms in a filterable, sortable table.

```tsx
import { VocabularyTable } from '@ifla/theme/components';

<VocabularyTable
  csvUrl="/data/vocabulary.csv"
  showFilter={true}
  showURIs={true}
  allowDownload={true}
/>
```

### InLink / OutLink

Styled links for internal and external navigation.

```tsx
import { InLink, OutLink } from '@ifla/theme/components';

<InLink href="/docs/element/123">Internal Link</InLink>
<OutLink href="https://example.org">External Link</OutLink>
```

### SeeAlso / Mandatory / Unique

Semantic components for highlighting special content.

```tsx
import { SeeAlso, Mandatory, Unique } from '@ifla/theme/components';

<SeeAlso>Related elements: Element A, Element B</SeeAlso>
<Mandatory>This field is required</Mandatory>
<Unique>This value must be unique</Unique>
```

### Figure

Image component with caption support.

```tsx
import { Figure } from '@ifla/theme/components';

<Figure
  src="/img/diagram.png"
  alt="System diagram"
  caption="Figure 1: System architecture overview"
/>
```

### ExampleTable

Collapsible container for examples and additional content.

```tsx
import { ExampleTable } from '@ifla/theme/components';

<ExampleTable title="Examples" defaultOpen={false}>
  <table>
    <tr><th>Label</th><th>Value</th></tr>
    <tr><td>Example 1</td><td>Value 1</td></tr>
  </table>
</ExampleTable>
```

## Styling System

### SCSS Variables

The theme provides comprehensive SCSS variables for consistent styling:

```scss
@import '@ifla/theme/styles/variables';

.my-component {
  background-color: $ifla-blue;
  color: $ifla-gold;
  padding: $ifla-spacing-md;
  border-radius: $ifla-border-radius-md;
}
```

### Mixins

Use IFLA mixins for common patterns:

```scss
@import '@ifla/theme/styles/mixins';

.my-button {
  @include ifla-button-primary;
}

.my-link {
  @include ifla-link-inline;
}

.my-table {
  @include ifla-table-base;
}

@include ifla-media-down(md) {
  .mobile-only {
    display: block;
  }
}
```

### Utility Classes

Pre-built utility classes for common styling needs:

```html
<div class="ifla-text-center ifla-mt-lg ifla-p-md">
  Centered text with large top margin and medium padding
</div>
```

## Configuration

### Vocabulary Defaults

Pre-configured settings for different IFLA standards:

```typescript
import { VOCABULARY_DEFAULTS } from '@ifla/theme/config';

// For ISBDM
const config = createIFLAConfig({
  // ... other config
  vocabularyDefaults: VOCABULARY_DEFAULTS.ISBDM
});

// For LRM
const config = createIFLAConfig({
  // ... other config
  vocabularyDefaults: VOCABULARY_DEFAULTS.LRM
});

// For custom standards
const config = createIFLAConfig({
  // ... other config
  vocabularyDefaults: {
    prefix: "mystandard",
    startCounter: 1000,
    uriStyle: "numeric",
    profile: "my-profile.csv",
    elementDefaults: {
      uri: "https://example.org/elements",
      classPrefix: "C",
      propertyPrefix: "P"
    }
  }
});
```

### Sidebar Configuration

Use the sidebar utilities for consistent navigation:

```typescript
import { applySidebarLevels, generateElementItems } from '@ifla/theme/config';

const sidebars = {
  mainSidebar: applySidebarLevels([
    {
      type: 'category',
      label: 'Elements',
      items: generateElementItems('attributes', ['1001', '1002', '1003'])
    }
  ])
};
```

## Utilities and Hooks

### Utilities

```typescript
import { 
  getLocalizedText, 
  createSlug, 
  parseCSVToConcepts,
  exportToCSV 
} from '@ifla/theme/utils';

// Handle multilingual text
const text = getLocalizedText(multilingualText, 'en', 'FRBR');

// Create URL-safe slugs
const slug = createSlug("My Element Title", "kebab-case");

// Parse CSV to concepts
const concepts = parseCSVToConcepts(csvData, vocabularyUri);
```

### React Hooks

```typescript
import { 
  useCsvLoader, 
  useMultilingualText, 
  useVocabularyTable,
  useLocalStorage 
} from '@ifla/theme/hooks';

// Load CSV data
const { data, loading, error } = useCsvLoader('/data/vocabulary.csv');

// Manage multilingual content
const { currentText, updateText } = useMultilingualText(initialText);

// Table state management
const { processedConcepts, handleSort } = useVocabularyTable(concepts);

// Persistent settings
const [settings, setSettings] = useLocalStorage('userSettings', defaultSettings);
```

## Advanced Usage

### Custom Component Theme

Create your own components that integrate with the IFLA theme:

```tsx
import React from 'react';
import clsx from 'clsx';
import { InLink } from '@ifla/theme/components';
import styles from './MyComponent.module.scss';

export function MyComponent({ className, children }) {
  return (
    <div className={clsx(styles.myComponent, 'ifla-p-md', className)}>
      {children}
      <InLink href="/docs/reference">Learn more</InLink>
    </div>
  );
}
```

### Extending Configuration

Extend the base configuration for site-specific needs:

```typescript
import { createIFLAConfig } from '@ifla/theme/config';

const baseConfig = createIFLAConfig({
  title: 'My Standard',
  // ... other options
});

const customConfig = {
  ...baseConfig,
  plugins: [
    ...baseConfig.plugins,
    // Add custom plugins
    ['my-custom-plugin', { option: 'value' }]
  ],
  themeConfig: {
    ...baseConfig.themeConfig,
    navbar: {
      ...baseConfig.themeConfig.navbar,
      items: [
        ...baseConfig.themeConfig.navbar.items,
        // Add custom navbar items
        { to: '/custom', label: 'Custom Page' }
      ]
    }
  }
};

export default customConfig;
```

## Browser Support

- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Accessibility**: WCAG 2.1 AA compliant

## Contributing

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Make your changes
4. Run tests: `pnpm test`
5. Build: `pnpm build`
6. Submit a pull request

## License

MIT International Federation of Library Associations and Institutions (IFLA)

## Support

- [Documentation](https://iflastandards.github.io/standards-dev/)
- [Issue Tracker](https://github.com/iflastandards/standards-dev/issues)
- [Discussions](https://github.com/iflastandards/standards-dev/discussions)
- Email: [standards@ifla.org](mailto:standards@ifla.org)

---

**Built with 🩷 by the IFLA community**
