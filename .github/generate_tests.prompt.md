---
tools: ['playwright']
mode: 'agent'
---
- Generate Playwright tests in TypeScript using @playwright/test
- Use role-based locators and auto-retrying assertions
- Save tests in `apps/<your-app>/e2e/src/`
- Execute tests and iterate until passing
- Include descriptive titles and comments
- Use `expect` assertions for assertions
- Use `page.waitForSelector` for waiting
- Use `page.waitForNavigation` for navigation
- Use `page.waitForLoadState` for waiting for page to load
- Use `page.waitForEvent` for waiting for events
- Use `page.waitForSelector` for waiting for elements
