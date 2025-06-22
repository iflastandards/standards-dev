/**
 * @ifla/preset-ifla
 * 
 * Official IFLA Docusaurus preset for standards sites.
 * Provides standardized plugins and themes for all IFLA documentation sites.
 */

import type { LoadContext, Preset } from '@docusaurus/types';

/**
 * IFLA Docusaurus Preset
 * 
 * This preset provides:
 * - Standard plugins (sass, ideal-image, search)
 * - No navigation or theme configuration (handled by sites)
 * 
 * @param context Docusaurus LoadContext
 * @param options Options passed to the preset
 * @returns Docusaurus preset configuration
 */
export default function preset(
  _context: LoadContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _options: any
): Preset {
  return {
    themes: [],
    
    plugins: [
      // Sass support
      'docusaurus-plugin-sass',
      
      // Ideal image optimization
      [
        '@docusaurus/plugin-ideal-image',
        {
          quality: 70,
          max: 1030,
          min: 640,
          steps: 2,
          disableInDev: false,
        },
      ],
      
      // Local search functionality
      [
        '@easyops-cn/docusaurus-search-local',
        {
          hashed: true,
          indexBlog: false,
          language: ['en'],
        },
      ],
    ],
  };
}