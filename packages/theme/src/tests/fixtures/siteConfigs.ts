// Standard site configuration fixtures for testing
import type { SiteConfig } from '../../config/siteConfig';

export const mockSiteConfig: Partial<SiteConfig> = {
  title: 'Test Site',
  url: 'https://test.ifla.org',
  baseUrl: '/test/',
  customFields: {
    siteKey: 'TEST',
    environment: 'localhost',
    vocabularyDefaults: {
      prefix: 'test',
      startCounter: 1000,
      uriStyle: 'numeric' as const,
      caseStyle: 'kebab-case' as const,
      defaultLanguage: 'en' as const,
      availableLanguages: ['en', 'fr', 'es'] as const
    }
  }
};

export const mockPortalConfig: Partial<SiteConfig> = {
  title: 'IFLA Standards Portal',
  url: 'https://standards.ifla.org',
  baseUrl: '/',
  customFields: {
    siteKey: 'portal',
    environment: 'production',
    isPortal: true
  }
};

export const mockStandardConfig: Partial<SiteConfig> = {
  title: 'ISBDM Test',
  url: 'https://standards.ifla.org',
  baseUrl: '/ISBDM/',
  customFields: {
    siteKey: 'ISBDM',
    environment: 'production',
    vocabularyDefaults: {
      prefix: 'isbdm',
      startCounter: 1000,
      uriStyle: 'numeric' as const,
      caseStyle: 'kebab-case' as const,
      defaultLanguage: 'en' as const,
      availableLanguages: ['en', 'fr', 'es', 'de'] as const
    }
  }
};

export const mockEnvironmentConfigs = {
  localhost: {
    url: 'http://localhost:3001',
    baseUrl: '/ISBDM/',
    environment: 'localhost'
  },
  preview: {
    url: 'https://ifla-standards-preview.netlify.app',
    baseUrl: '/ISBDM/',
    environment: 'preview'
  },
  production: {
    url: 'https://standards.ifla.org',
    baseUrl: '/ISBDM/',
    environment: 'production'
  }
};

// Docusaurus context mock for testing
export const mockDocusaurusContext = {
  siteConfig: mockSiteConfig,
  siteMetadata: {
    siteVersion: '1.0.0',
    docusaurusVersion: '3.8.1'
  },
  globalData: {},
  isClient: false,
  i18n: {
    currentLocale: 'en',
    locales: ['en'],
    defaultLocale: 'en',
    localeConfigs: {}
  }
};

export const createMockDocusaurusContext = (overrides: Partial<typeof mockDocusaurusContext> = {}) => ({
  ...mockDocusaurusContext,
  ...overrides,
  siteConfig: {
    ...mockDocusaurusContext.siteConfig,
    ...overrides.siteConfig
  }
});
