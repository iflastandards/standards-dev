export interface StandardsNavbarOptions {
  title: string;
  customItems?: any[];
  includeBlog?: boolean;
  includeVersionDropdown?: boolean;
  includeLocaleDropdown?: boolean;
  includeSearch?: boolean;
}

/**
 * Factory function to create a standardised navbar for IFLA standards sites.
 * Returns an immutable array of navbar items but with a mutable type signature
 * to satisfy TypeScript constraints from Docusaurus.
 */
export function createStandardsNavbar(options: StandardsNavbarOptions) {
  const {
    title,                // kept for future expansion – not mutated
    customItems = [],
    includeBlog = true,
    includeVersionDropdown = true,
    includeLocaleDropdown = true,
    includeSearch = true,
  } = options;

  const rightItems = [];

  if (includeBlog) {
    rightItems.push({ to: '/blog', label: 'Blog', position: 'right' });
  }
  if (includeVersionDropdown) {
    rightItems.push({ type: 'docsVersionDropdown', position: 'right' });
  }
  if (includeLocaleDropdown) {
    rightItems.push({ type: 'localeDropdown', position: 'right' });
  }
  if (includeSearch) {
    rightItems.push({ type: 'search', position: 'right' });
  }

  // Create a new array that combines customItems and rightItems
  // but don't mark it as readonly - Docusaurus expects a mutable array type
  // even though we'll make the actual object immutable
  const navbar = [...customItems, ...rightItems];

  // Make the object immutable at runtime while keeping the mutable type signature
  return Object.freeze(navbar);
}
