export interface StandardsNavbarOptions {
  title: string;
  customItems?: any[];
  includeBlog?: boolean;
  includeVersionDropdown?: boolean;
  includeLocaleDropdown?: boolean;
  includeSearch?: boolean;
}

/**
 * Factory function to create standardized navbar for IFLA standards sites
 * This is a pure function that returns consistent navbar configuration
 */
export function createStandardsNavbar(options: StandardsNavbarOptions) {
  const {
    title,
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
    rightItems.push({
      type: 'docsVersionDropdown',
      position: 'right',
    });
  }

  if (includeLocaleDropdown) {
    rightItems.push({
      type: 'localeDropdown', 
      position: 'right',
    });
  }

  if (includeSearch) {
    rightItems.push({
      type: 'search',
      position: 'right',
    });
  }

  return [
    ...customItems,
    ...rightItems,
  ];
}