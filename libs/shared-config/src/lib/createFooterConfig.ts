import type { FooterConfigOptions } from './types';

/**
 * Factory function to create footer configuration
 * This is a pure function that returns a consistent footer configuration.
 * It now returns a frozen object so the result cannot be changed later.
 */
export function createFooterConfig(options: FooterConfigOptions) {
  const { links = [], copyright } = options;

  // clone the array so callers can't mutate the version we return
  const safeLinks = [...links];

  const footerConfig = {
    style: 'dark' as const,
    links: safeLinks,
    copyright:
      copyright ??
      `Copyright © ${new Date().getFullYear()} International Federation of Library Associations and Institutions (IFLA)`,
  } as const;

  // freeze guarantees deep-ish immutability for consumers
  return Object.freeze(footerConfig);
}