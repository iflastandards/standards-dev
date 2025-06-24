export interface IFLAPluginOptions {
  /** Environment name for environment-specific configuration (required for pure functions) */
  environment: string;
  /** Enable Sass support (default: true) */
  enableSass?: boolean;
  /** Enable ideal image optimization (default: auto based on environment) */
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
 * @param options Configuration options for plugins including environment
 * @returns Array of plugin configurations for direct use in docusaurus.config.ts
 */
export function createIFLAPlugins(options: IFLAPluginOptions): any[] {
  const {
    environment,
    enableSass = true,
    enableIdealImage = environment === 'production', // Auto-default based on environment
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
    // Environment-based defaults for image configuration
    const defaultImageConfig = {
      quality: environment === 'production' ? 80 : 70,
      max: 1200,
      min: 640,
      steps: environment === 'production' ? 3 : 2,
      disableInDev: false,
    };
    
    plugins.push([
      '@docusaurus/plugin-ideal-image',
      {
        ...defaultImageConfig,
        ...imageConfig, // User overrides take precedence
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
 * @param environment - Environment name for pure function
 * @returns Array of plugins optimized for development
 */
export function createDevelopmentPlugins(environment: string): any[] {
  return createIFLAPlugins({
    environment,
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
 * @param environment - Environment name for pure function
 * @returns Array of plugins optimized for production
 */
export function createProductionPlugins(environment: string): any[] {
  return createIFLAPlugins({
    environment,
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