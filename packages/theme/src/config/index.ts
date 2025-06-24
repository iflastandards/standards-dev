// Configuration exports for IFLA theme

// Note: Site configuration utilities have been moved to @ifla/shared-config
// Import directly from @ifla/shared-config instead of this file:
// import { getSiteConfig } from '@ifla/shared-config';

// This file is kept for backwards compatibility
// All site configuration is now centralized in libs/shared-config

// Re-export the main configuration utilities for backwards compatibility
export { getSiteConfig, type SiteKey, type Environment } from '@ifla/shared-config';
