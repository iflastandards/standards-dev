import type { FooterConfigOptions } from './types';

/**
 * Factory function to create footer configuration
 * This is a pure function that returns a consistent footer configuration
 */
export function createFooterConfig(options: FooterConfigOptions) {
  const { links = [], copyright } = options;
  
  return {
    style: 'dark',
    links,
    copyright: copyright || `Copyright © ${new Date().getFullYear()} International Federation of Library Associations and Institutions (IFLA)`,
  };
}