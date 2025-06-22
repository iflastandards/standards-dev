export interface IFLAPluginOptions {
  /** Enable Sass support (default: true) */
  enableSass?: boolean;
  /** Enable ideal image optimization (default: true) */
  enableIdealImage?: boolean;
  /** Enable local search (default: true) */
  enableLocalSearch?: boolean;
  /** Additional plugins to include */
  additionalPlugins?: any[];
  /** Local search configuration */
  searchConfig?: {
    hashed?: boolean;
    indexBlog?: boolean;
    language?: string[];
  };
  /** Ideal image configuration */
  imageConfig?: {
    quality?: number;
    max?: number;
    min?: number;
    steps?: number;
    disableInDev?: boolean;
  };
}

/**
 * Create IFLA standard plugins configuration as a pure function
 * 
 * This factory function creates plugin configuration that can be customized
 * per site while maintaining consistency across the IFLA standards ecosystem.
 * 
 * @param options Configuration options for plugins
 * @returns Array of plugin configurations for direct use in docusaurus.config.ts
 */
export function createIFLAPlugins(options: IFLAPluginOptions = {}): any[] {
  const {
    enableSass = true,
    enableIdealImage = true,
    enableLocalSearch = true,
    additionalPlugins = [],
    searchConfig = {},
    imageConfig = {},
  } = options;

  const plugins: any[] = [];

  // Sass support
  if (enableSass) {
    plugins.push('docusaurus-plugin-sass');
  }

  // Ideal image optimization
  if (enableIdealImage) {
    plugins.push([
      '@docusaurus/plugin-ideal-image',
      {
        quality: 70,
        max: 1030,
        min: 640,
        steps: 2,
        disableInDev: false,
        ...imageConfig,
      },
    ]);
  }

  // Local search functionality
  if (enableLocalSearch) {
    plugins.push([
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexBlog: false,
        language: ['en'],
        ...searchConfig,
      },
    ]);
  }

  // Add additional plugins
  plugins.push(...additionalPlugins);

  return plugins;
}

/**
 * Create a lightweight plugin set for development/testing
 * Disables heavy plugins for faster builds
 * 
 * @returns Array of plugins optimized for development
 */
export function createDevelopmentPlugins(): any[] {
  return createIFLAPlugins({
    enableIdealImage: false, // Disable image optimization in dev
    enableLocalSearch: false, // Disable search indexing in dev
    searchConfig: {
      indexBlog: false,
    },
  });
}

/**
 * Create a production-optimized plugin set
 * Enables all optimizations and plugins
 * 
 * @returns Array of plugins optimized for production
 */
export function createProductionPlugins(): any[] {
  return createIFLAPlugins({
    enableSass: true,
    enableIdealImage: true,
    enableLocalSearch: true,
    imageConfig: {
      quality: 80, // Higher quality for production
      max: 1200,
      min: 640,
      steps: 3, // More responsive breakpoints
      disableInDev: false,
    },
    searchConfig: {
      hashed: true,
      indexBlog: true, // Index blog in production
      language: ['en'], // Add more languages as needed
    },
  });
}