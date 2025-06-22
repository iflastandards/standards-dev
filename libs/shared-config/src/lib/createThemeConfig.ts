import type { ThemeConfigOptions } from './types';
import { themes as prismThemes } from 'prism-react-renderer';

/**
 * Factory function to create theme configuration
 * This is a pure function that returns a consistent theme object
 */
export function createThemeConfig(options: ThemeConfigOptions) {
  return {
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['turtle', 'sparql'],
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: options.navbarTitle,
      logo: {
        alt: 'IFLA Logo',
        src: 'img/logo-ifla_black.png',
      },
      items: options.navbarItems || [],
    },
    footer: {
      style: 'dark',
      links: options.footerLinks || [],
      copyright: options.copyright || `Copyright © ${new Date().getFullYear()} IFLA`,
    },
  };
}