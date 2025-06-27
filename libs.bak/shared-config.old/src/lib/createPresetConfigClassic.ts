
/**
 * Factory function to create classic preset configuration for standards sites
 * This is a pure function that returns consistent preset configuration
 */
export function createStandardsPresetConfig(options: {
  editUrl: string;
  enableBlog?: boolean;
  sidebarItemsGenerator?: any;
  docsPath?: string;
  showLastUpdateAuthor?: boolean;
  showLastUpdateTime?: boolean;
}) {
  const {
    editUrl,
    enableBlog = true,
    sidebarItemsGenerator,
    docsPath = './docs',
    showLastUpdateAuthor = true,
    showLastUpdateTime = true,
  } = options;

  return {
    docs: {
      path: docsPath,
      sidebarPath: './sidebars.ts',
      editUrl,
      showLastUpdateAuthor,
      showLastUpdateTime,
      remarkPlugins: [],
      ...(sidebarItemsGenerator && { sidebarItemsGenerator }),
    },
    ...(enableBlog && {
      blog: {
        showReadingTime: true,
        editUrl,
      }
    }),
    theme: {
      customCss: './src/css/custom.css',
    },
  };
}