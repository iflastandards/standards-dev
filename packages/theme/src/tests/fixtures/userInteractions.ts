// Common user interaction patterns for testing
import { fireEvent, screen, waitFor } from '@testing-library/react';
import type { Page } from '@playwright/test';

// React Testing Library interaction helpers
export const userInteractions = {
  // Vocabulary table interactions
  searchVocabulary: async (searchTerm: string) => {
    const searchInput = screen.getByPlaceholderText(/Filter values/i);
    fireEvent.change(searchInput, { target: { value: searchTerm } });
    
    await waitFor(() => {
      expect(searchInput).toHaveValue(searchTerm);
    });
  },
  
  switchLanguage: async (language: string) => {
    const languageTab = screen.getByRole('tab', { name: new RegExp(language, 'i') });
    fireEvent.click(languageTab);
    
    await waitFor(() => {
      expect(languageTab).toHaveAttribute('aria-selected', 'true');
    });
  },
  
  // Navigation interactions
  clickNavItem: async (itemName: string) => {
    const navItem = screen.getByRole('link', { name: new RegExp(itemName, 'i') });
    fireEvent.click(navItem);
  },
  
  // Form interactions
  fillInput: async (labelText: string, value: string) => {
    const input = screen.getByLabelText(new RegExp(labelText, 'i'));
    fireEvent.change(input, { target: { value } });
    
    await waitFor(() => {
      expect(input).toHaveValue(value);
    });
  }
};

// Playwright E2E interaction helpers
export const e2eInteractions = {
  // Vocabulary table E2E interactions
  searchVocabularyE2E: async (page: Page, searchTerm: string) => {
    await page.locator('input[placeholder*="Filter"]').first().fill(searchTerm);
    await page.waitForTimeout(500); // Allow search to process
  },
  
  switchLanguageE2E: async (page: Page, languageCode: string) => {
    const languageTab = page.locator(`button:has-text("${languageCode.toUpperCase()}")`);
    if (await languageTab.count() > 0) {
      await languageTab.first().click();
      await page.waitForTimeout(300);
    }
  },
  
  // Navigation E2E interactions
  navigateToSection: async (page: Page, sectionName: string) => {
    await page.locator(`a:has-text("${sectionName}")`).first().click();
    await page.waitForLoadState('networkidle');
  },
  
  // Responsive testing helpers
  testMobileView: async (page: Page) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
  },
  
  testTabletView: async (page: Page) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
  },
  
  testDesktopView: async (page: Page) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
  }
};

// Common wait helpers
export const waitHelpers = {
  // Wait for vocabulary data to load
  waitForVocabularyData: async (expectedTerm: string, timeout: number = 3000) => {
    await waitFor(() => {
      expect(screen.getByText(expectedTerm)).toBeInTheDocument();
    }, { timeout });
  },
  
  // Wait for page elements in E2E tests
  waitForPageElement: async (page: Page, selector: string, timeout: number = 10000) => {
    await page.waitForSelector(selector, { timeout });
  },
  
  // Wait for network requests to complete
  waitForNetwork: async (page: Page) => {
    await page.waitForLoadState('networkidle');
  }
};

// Error state testing helpers
export const errorHelpers = {
  // Mock network error for component tests
  mockNetworkError: () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;
  },
  
  // Check error message appears
  expectErrorMessage: async (errorPattern: RegExp) => {
    await waitFor(() => {
      expect(screen.getByText(errorPattern)).toBeInTheDocument();
    });
  },
  
  // Test E2E error states
  testE2EErrorState: async (page: Page, triggerError: () => Promise<void>) => {
    await triggerError();
    await page.waitForSelector('[role="alert"], .error-message', { timeout: 5000 });
  }
};

// Accessibility testing helpers
export const a11yHelpers = {
  // Check ARIA labels
  checkAriaLabel: (element: HTMLElement, expectedLabel?: string) => {
    expect(element).toHaveAttribute('aria-label');
    if (expectedLabel) {
      expect(element).toHaveAttribute('aria-label', expectedLabel);
    }
  },
  
  // Check heading hierarchy
  checkHeadingHierarchy: (headingText: string, level: number = 1) => {
    const heading = screen.getByRole('heading', { 
      name: new RegExp(headingText, 'i'),
      level 
    });
    expect(heading).toBeInTheDocument();
  },
  
  // Check keyboard navigation
  testKeyboardNavigation: async (page: Page) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
  }
};

// Performance testing helpers
export const performanceHelpers = {
  // Measure component render time
  measureRenderTime: async (renderFunction: () => Promise<void>) => {
    const startTime = performance.now();
    await renderFunction();
    const endTime = performance.now();
    return endTime - startTime;
  },
  
  // Test page load performance
  measurePageLoad: async (page: Page, url: string) => {
    const startTime = Date.now();
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    return endTime - startTime;
  }
};