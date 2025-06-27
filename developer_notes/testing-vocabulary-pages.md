# Testing Vocabulary Pages - Developer Guide

This guide covers comprehensive testing strategies for IFLA vocabulary pages using the VocabularyTable component.

## Quick Start

### Running Unit Tests
```bash
# NX-based testing (recommended)
nx test isbdm                                    # All ISBDM tests
nx test @ifla/theme                              # Theme package tests
nx affected --target=test                       # Only affected tests

# Legacy commands (still work)
pnpm test                                        # All unit tests
pnpm test packages/theme/src/tests/components/VocabularyTable/
```

### Running E2E Tests
```bash
# NX E2E commands
nx run isbdm:e2e                                # ISBDM E2E tests
nx run standards-dev:e2e                        # Full E2E suite
nx run standards-dev:e2e:ui                     # Interactive mode

# Direct Playwright commands
npx playwright test e2e/vocabulary-functionality.spec.ts
npx playwright test --project=chromium --headed
```

## Test Architecture

### Unit Tests (`__tests__/sensory-vocabulary-integration.test.tsx`)
- **Purpose**: Test VocabularyTable component functionality in isolation
- **Framework**: Vitest + React Testing Library
- **Coverage**: Component rendering, props handling, CSV data loading, user interactions
- **Location**: `standards/ISBDM/docs/examples/__tests__/`

### E2E Tests (`e2e/sensory-test-vocabulary.e2e.test.ts`)
- **Purpose**: Test complete user workflows and page interactions
- **Framework**: Playwright
- **Coverage**: Page loading, real user interactions, browser behavior, responsive design
- **Location**: `standards/ISBDM/e2e/`

## Testing Patterns

### VocabularyTable Props Testing
```typescript
// Basic configuration
<VocabularyTable 
  csvFile="/data/CSV/sensory-test.csv"
  title="Basic Vocabulary Table"
  showTitle={true}
/>

// Custom language settings
<VocabularyTable 
  csvFile="/data/CSV/sensory-test.csv"
  title="French Table"
  showTitle={true}
  defaultLanguage="fr"
  availableLanguages={['en', 'fr', 'es']}
/>

// Glossary configuration
<VocabularyTable 
  csvFile="/data/CSV/sensory-test.csv"
  title="Glossary View"
  showTitle={true}
  showURIs={false}
  showLanguageSelector={false}
/>
```

### CSV Data Mocking
```typescript
// Mock fetch for consistent test data
const mockCSVContent = `uri,skos:prefLabel@en,skos:prefLabel@fr,skos:definition@en[0]
sensoryspec:T1001,aural,auditif,"Content intended for hearing"`;

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve(mockCSVContent)
  })
) as any;
```

### Search and Filter Testing
```typescript
// Test search functionality
const searchInput = screen.getByPlaceholderText(/Filter values/i);
fireEvent.change(searchInput, { target: { value: 'aural' } });

await waitFor(() => {
  expect(screen.getByText('aural')).toBeInTheDocument();
  expect(screen.queryByText('gustatory')).not.toBeInTheDocument();
});
```

### Language Switching Testing
```typescript
// Test multilingual support
await waitFor(() => {
  expect(screen.getByText('aural')).toBeInTheDocument(); // English default
});

const frenchTab = screen.getByRole('tab', { name: /Français/i });
fireEvent.click(frenchTab);

await waitFor(() => {
  expect(screen.getByText('auditif')).toBeInTheDocument(); // French
});
```

## E2E Testing Patterns

### Page Loading
```typescript
test('should load the page successfully', async () => {
  await page.goto('http://localhost:3001/ISBDM/docs/examples/sensory-test-vocabulary/');
  await page.waitForLoadState('networkidle');
  
  await expect(page).toHaveTitle(/Sensory Specification Test Vocabulary/);
  await expect(page.locator('h1')).toContainText('Sensory Specification Test Vocabulary');
});
```

### Interactive Elements
```typescript
test('should filter vocabulary terms', async () => {
  await page.waitForSelector('text=aural', { timeout: 10000 });
  
  const searchInput = page.locator('input[placeholder*="Filter"]').first();
  await searchInput.fill('aural');
  
  await expect(page.locator('text=aural')).toBeVisible();
  await expect(page.locator('text=gustatory')).not.toBeVisible();
});
```

### Language Interface Testing
```typescript
test('should switch between languages', async () => {
  const frenchTab = page.locator('button:has-text("FR")');
  if (await frenchTab.count() > 0) {
    await frenchTab.first().click();
    await expect(page.locator('text=auditif')).toBeVisible();
  }
});
```

### Responsive Testing
```typescript
test('should work on mobile', async () => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForSelector('text=aural', { timeout: 10000 });
  
  await expect(page.locator('text=aural').first()).toBeVisible();
});
```

## Test Data Structure

### Expected CSV Format
```csv
uri,rdf:type,skos:prefLabel@en,skos:prefLabel@fr,skos:prefLabel@es,skos:definition@en[0],skos:definition@fr[0],skos:definition@es[0],skos:example@en[0]
sensoryspec:T1001,http://www.w3.org/2004/02/skos/core#Concept,aural,auditif,auditiva,"Content for hearing","Contenu pour l'ouïe","Contenido para audición","Audiobooks, music"
```

### Key Test Cases
1. **Basic Rendering**: Component mounts, title displays, data loads
2. **Search/Filter**: Input works, results filter correctly, no results message
3. **Multilingual**: Language tabs work, content switches properly
4. **Error Handling**: Network errors, malformed data, empty states
5. **Accessibility**: ARIA labels, keyboard navigation, screen reader support
6. **Performance**: Load times, responsive design, multiple filters

## Common Test Utilities

### Wait Helpers
```typescript
// Wait for CSV data to load
await waitFor(() => {
  expect(screen.getByText('aural')).toBeInTheDocument();
}, { timeout: 3000 });

// Wait for page elements (E2E)
await page.waitForSelector('text=aural', { timeout: 10000 });
```

### Error State Testing
```typescript
// Mock network error
global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;

// Check error message appears
await waitFor(() => {
  expect(screen.getByText(/Error loading vocabulary/i)).toBeInTheDocument();
});
```

### Accessibility Testing
```typescript
// Check ARIA labels
const searchInput = screen.getByPlaceholderText(/Filter values/i);
expect(searchInput).toHaveAttribute('aria-label');

// Check heading hierarchy
const heading = screen.getByRole('heading', { name: 'Test Table' });
expect(heading).toBeInTheDocument();
```

## Debugging Tips

### Unit Test Debugging
- Use `screen.debug()` to see rendered HTML
- Check console for CSV parsing warnings
- Verify fetch mocks are properly set up
- Use longer timeouts for async operations

### E2E Test Debugging
- Run with `--headed` flag to see browser
- Use `await page.pause()` to inspect state
- Check network tab for CSV loading issues
- Verify correct localhost port (3001 for ISBDM)

### Common Issues
1. **Tests timing out**: Increase `waitFor` timeout, check if dev server is running
2. **CSV not loading**: Verify mock data format matches component expectations
3. **Language switching fails**: Check if `availableLanguages` prop is set correctly
4. **Search not working**: Ensure proper wait for data loading before interacting

## Best Practices

1. **Always wait for data loading** before testing interactions
2. **Use specific selectors** rather than generic text matches
3. **Test error states** as well as happy paths
4. **Mock external dependencies** (CSV files) for consistent tests
5. **Test accessibility features** with proper ARIA checks
6. **Include performance tests** for loading times
7. **Test responsive design** with different viewport sizes

## Related Code Locations

- **VocabularyTable Component**: `/packages/theme/src/components/VocabularyTable/`
- **CSV Data**: `/standards/ISBDM/static/data/CSV/sensory-test.csv`
- **Page Under Test**: `/standards/ISBDM/docs/examples/sensory-test-vocabulary.mdx`
- **Test Files**: 
  - `/standards/ISBDM/docs/examples/__tests__/sensory-vocabulary-integration.test.tsx`
  - `/standards/ISBDM/e2e/sensory-test-vocabulary.e2e.test.ts`

## Configuration Files

- **Vitest Config**: `vitest.config.ts` (workspace root)
- **Playwright Config**: `playwright.config.ts` (in ISBDM directory)
- **Test Setup**: Uses `@testing-library/jest-dom` for custom matchers

This testing approach ensures comprehensive coverage of vocabulary page functionality across different configurations and use cases.