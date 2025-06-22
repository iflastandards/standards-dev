/**
 * Factory function to create static directories configuration based on site type
 * This is a pure function that returns consistent static directory paths
 */
export function createStaticDirectories(siteType: 'portal' | 'standard'): string[] {
  const baseDirectories = ['static'];
  
  if (siteType === 'portal') {
    // Portal is one level up from packages/theme
    return [...baseDirectories, '../packages/theme/static'];
  } else {
    // Standards are two levels up from packages/theme  
    return [...baseDirectories, '../../packages/theme/static'];
  }
}