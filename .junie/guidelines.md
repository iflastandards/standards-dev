# IFLA Standards Project Guidelines

This document provides essential information for developers working on the IFLA Standards project.

## Build/Configuration Instructions

### Project Structure
The IFLA Standards project is a monorepo containing multiple packages and standards sites:

- **packages/theme**: Contains the shared theme components and utilities
- **packages/preset-ifla**: Contains the Docusaurus preset for IFLA standards
- **standards/**: Contains individual standard sites (FRBR, ISBD, ISBDM, LRM, MulDiCat, UniMARC)
- **portal/**: The main portal site

### Build Commands

```bash
# Build a specific site
pnpm build:portal     # Build the portal site
pnpm build:isbdm      # Build the ISBDM standard
pnpm build:lrm        # Build the LRM standard
pnpm build:frbr       # Build the FRBR standard
pnpm build:isbd       # Build the ISBD standard
pnpm build:muldicat   # Build the MulDiCat standard
pnpm build:unimarc    # Build the UniMARC standard

# Build all sites
pnpm build:all        # Build all sites in parallel
pnpm build:all:safe   # Clear all builds first, then build all sites
pnpm build:all:sequential  # Build all sites sequentially

# Build only affected sites (based on changes)
pnpm build:affected
```

### Development Commands

```bash
# Start development server for a specific site
pnpm start:portal     # Start the portal site (port 3000)
pnpm start:isbdm      # Start the ISBDM standard (port 3001)
pnpm start:lrm        # Start the LRM standard (port 3002)
pnpm start:frbr       # Start the FRBR standard (port 3003)
pnpm start:isbd       # Start the ISBD standard (port 3004)
pnpm start:muldicat   # Start the MulDiCat standard (port 3005)
pnpm start:unimarc    # Start the UniMARC standard (port 3006)

# Start all development servers
pnpm start:all        # Start all sites in parallel

# Serve built sites
pnpm serve:portal     # Serve the built portal site
pnpm serve:all        # Serve all built sites
```

### Configuration Architecture

The project uses a hierarchical configuration system:

1. **Base configuration**: Defined in `packages/theme/src/config/siteConfigCore.ts`
2. **Site-specific configuration**: Each standard site has its own `docusaurus.config.ts`
3. **Environment-specific settings**: Different settings for development, preview, and production environments

## Testing Information

### Testing Framework

The project uses Vitest as the testing framework, with React Testing Library for component testing and jest-axe for accessibility testing.

### Running Tests

```bash
# Run all tests
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm test:ui          # Run tests with UI

# Run specific tests
npx vitest run [test-file-path]  # Run a specific test file
npx vitest run packages/theme/src/tests/utils/stringUtils.test.ts  # Example

# Run tests for affected files only
pnpm test:affected
```

### Test Structure

Tests are organized in the following structure:

- **Unit/Component Tests**: Located in `packages/theme/src/tests/`
  - `components/`: Tests for React components
  - `scripts/`: Tests for utility scripts
  - `config/`: Tests for configuration
  - `utils/`: Tests for utility functions

- **End-to-End Tests**: Located in `e2e/` directory and in standard-specific directories like `standards/ISBDM/e2e/`

### Adding New Tests

1. Create a new test file with the `.test.ts` or `.test.tsx` extension
2. Import the necessary testing utilities:
   ```typescript
   import { describe, it, expect } from 'vitest';
   import { render, screen } from '@testing-library/react'; // For component tests
   ```
3. Write your tests using the describe/it structure
4. Run the tests to verify they work

### Example Test

Here's an example of a simple utility function test:

```typescript
// File: packages/theme/src/utils/stringUtils.ts
export function capitalizeFirstLetter(str: string): string {
  if (!str || str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// File: packages/theme/src/tests/utils/stringUtils.test.ts
import { describe, it, expect } from 'vitest';
import { capitalizeFirstLetter } from '@ifla/theme/utils/stringUtils';

describe('String Utilities', () => {
  describe('capitalizeFirstLetter', () => {
    it('should capitalize the first letter of a string', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
      expect(capitalizeFirstLetter('world')).toBe('World');
    });

    it('should handle empty strings', () => {
      expect(capitalizeFirstLetter('')).toBe('');
    });
  });
});
```

## Development Workflow

### Repository Setup

- **Main Repository**: `iflastandards/standards-dev` (upstream)
- **Development Fork**: Your personal fork (e.g., `username/standards-dev`)

### Development Process

1. **Development & Testing**:
   ```bash
   # Work on dev branch
   git checkout dev
   git pull fork dev

   # Make changes, commit as usual
   git add .
   git commit -m "your changes"

   # Push to your fork - triggers deploy-dev.yml
   git push fork dev

   # Test changes at: https://username.github.io/standards-dev/
   ```

2. **Move to Preview (Create Pull Request)**:
   ```bash
   # Create PR from your fork's dev branch to upstream main
   gh pr create --repo iflastandards/standards-dev --base main --head username:dev --title "Your PR Title" --body "Description of changes"
   ```

3. **Preview & Production Deployment**:
   - **PR merge to main** → Triggers `ci-preview.yml` → Deploys to preview site
   - **Main branch updates** → Triggers `deploy-all.yml` → Deploys to production

### Automated Testing

The project uses a multi-layered testing approach:

1. **Pre-commit hooks**: TypeScript type checking, ESLint code quality, unit/integration tests, site configuration validation
2. **Pre-push hooks**: Branch-aware testing (more extensive for protected branches)
3. **GitHub Actions**: CI/CD with matrix build testing

## Additional Development Information

### Code Style

- The project uses ESLint for code quality and Prettier for code formatting
- TypeScript is used throughout the project for type safety
- React components follow a functional approach with hooks

### Docusaurus Configuration

- The project uses Docusaurus v3 for documentation sites
- Custom components are available in the `@ifla/theme` package
- Site configuration is managed through a hierarchical system

### Performance Considerations

- Use the NX build system for efficient builds and testing
- The `build:affected` command only builds sites affected by changes
- Consider using the `serve:all` command to test all sites locally without rebuilding

### Troubleshooting

- If you encounter build issues, try clearing the cache with `pnpm clear:all`
- For test failures, check the test output for specific error messages
- For dependency issues, ensure you're using the correct pnpm version
