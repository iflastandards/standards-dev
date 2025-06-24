/**
 * IFLA Theme - Comprehensive shared theme system for IFLA standard sites
 * 
 * This package provides:
 * - Reusable React components for IFLA standards documentation
 * - Consistent IFLA branding and styling (SCSS variables, mixins)
 * - Base Docusaurus configuration templates
 * - Shared utilities and React hooks
 * - TypeScript type definitions
 * 
 * @version 1.0.0
 * @author IFLA
 * @license MIT
 */

// Import styles to include them in the bundle
import './styles/index.css';

// Export all components
export * from './components';

// Note: Configuration utilities have been moved to @ifla/shared-config
// Import directly: import { getSiteConfig, getSiteUrl } from '@ifla/shared-config';

// Export utilities and hooks
export * from './utils';
export * from './hooks';

// Note: Styles are available via the package exports './styles' path
// Import them in your site with: import '@ifla/theme/styles';

// Default export for convenience
import * as Components from './components';
import * as Utils from './utils';
import * as Hooks from './hooks';
import * as Types from './types';

export default {
  Components,
  Utils,
  Hooks,
  Types,
};

// Version information
export const VERSION = '1.0.0';
export const THEME_NAME = 'IFLA Theme';

/**
 * Initialize IFLA theme
 * This function can be called to set up any global theme configuration
 */
export function initializeIFLATheme(options: Partial<Types.IFLAThemeConfig> = {}) {
  // Add any global initialization logic here
  return options;
}