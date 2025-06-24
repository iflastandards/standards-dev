# IFLA **standards-dev** monorepo

Source for next-gen documentation, RDF vocabularies and infrastructure.

## Quick Start

### Development
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test
pnpm typecheck
pnpm lint
```

### Testing
```bash
# Unit/Integration tests
pnpm test

# Build regression tests
node scripts/test-site-builds.js --site all --env production

# Portal end-to-end tests  
./scripts/test-portal-builds.sh
```

See `TESTING.md` for automated testing overview and `developer_notes/build-regression-testing.md` for comprehensive testing documentation.

## 🚀 Automated Testing

**Testing runs automatically with zero configuration required:**
- ✅ **Pre-commit:** TypeScript, ESLint, unit tests, config validation
- ✅ **Pre-push:** Build regression tests (branch-aware)
- ✅ **CI/CD:** Full test suite on all pull requests

Manual testing available: `pnpm test:full`, `pnpm test:regression`

## 🏗️ Project Structure

```
standards-dev/
├── portal/                    # Main portal site
├── standards/                 # Individual standard sites
│   ├── ISBDM/                # ISBD Manifestation
│   ├── LRM/                  # Library Reference Model
│   ├── FRBR/                 # Functional Requirements
│   ├── isbd/                 # International Standard Bibliographic Description
│   ├── muldicat/             # Multilingual Dictionary of Cataloguing Terms
│   └── unimarc/              # UNIMARC formats
├── packages/                  # Shared packages
│   └── theme/                # Custom Docusaurus theme
├── libs/                     # Shared libraries
│   └── shared-config/        # Configuration utilities for sites
└── scripts/                  # Build and utility scripts
```

## 🚀 Site Development

### Building Individual Sites
```bash
# Build a specific standard
pnpm build standards/ISBDM
pnpm build standards/LRM

# Build all sites
pnpm build:all

# Build portal
pnpm build:portal
```

### Development Servers
```bash
# Start portal development server
pnpm start:portal

# Start specific standard
pnpm start:isbdm
pnpm start:lrm

# Start all sites simultaneously
pnpm start:all
```

### Serving Built Sites
```bash
# Serve portal
pnpm serve:portal

# Serve specific standard
pnpm serve:isbdm

# Serve all sites
pnpm serve:all
```

## 📝 Content Management

### Creating New Standards
```bash
# Scaffold a new IFLA standard
pnpm scaffold
```

### Vocabulary Management
```bash
# Create vocabulary sheets
pnpm vocabulary:create

# Export to RDF
pnpm vocab:release
```

### Content Validation
```bash
# Validate site links
pnpm validate:site-links

# Check navigation URLs
pnpm validate:navigation

# Validate environment URLs
pnpm validate:env-urls
```

## 🔧 Development Workflow

1. **Clone and Install:**
   ```bash
   git clone <repository-url>
   cd standards-dev
   pnpm install
   ```

2. **Start Development:**
   ```bash
   pnpm start:portal  # or specific site
   ```

3. **Make Changes:**
   - Edit content in `standards/*/docs/` or `portal/docs/`
   - Modify theme in `packages/theme/src/`
   - Update shared configs in `libs/shared-config/`

4. **Test Changes:**
   ```bash
   pnpm test:full      # Full test suite
   pnpm test:regression # Build regression tests
   ```

5. **Commit Changes:**
   - Tests run automatically on commit (pre-commit hook)
   - Build tests run automatically on push (pre-push hook)

## 🌍 Multi-Environment Support

Sites support multiple deployment environments:
- **local** - Development with local asset references (`http://localhost:300X`)
- **preview** - Staging environment for testing (`https://iflastandards.github.io/standards-dev/`)
- **development** - Development branch testing (`https://jonphipps.github.io/standards-dev/`)
- **production** - Live deployment environment (`https://www.iflastandards.info/`)

Set environment with `DOCS_ENV`:
```bash
DOCS_ENV=production pnpm build:portal
```

### Site Configuration

The project uses a centralized configuration system that replaced environment files in December 2024. See **[Site Configuration Architecture](developer_notes/site-configuration-architecture.md)** for complete documentation on:

- Centralized configuration matrix in `libs/shared-config/src/lib/siteConfig.ts`
- Inter-site navigation with the `SiteLink` component  
- Environment handling (local, preview, development, production)
- Migration notes and benefits of the new approach
- Adding new sites and troubleshooting

## 📚 Documentation

- **`TESTING.md`** - Automated testing quick reference
- **`developer_notes/`** - Comprehensive development guides
  - `build-regression-testing.md` - Complete testing strategy
  - `configuration-architecture.md` - System architecture
  - `testing-vocabulary-pages.md` - Component testing
  - `new-site-setup.md` - Adding new standards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pnpm test:full`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Quality

- TypeScript compilation must pass (`pnpm typecheck`)
- ESLint rules must be followed (`pnpm lint`)
- All tests must pass (`pnpm test`)
- Build regression tests must pass

## 📊 Monitoring & Deployment

### GitHub Actions
- **Automated Testing:** Runs on every PR and push
- **Deploy All Sites:** Manual workflow for production deployment
- **Deploy Dev:** Automatic deployment for development environment

### Status Checking
```bash
# Check deployment status
pnpm deploy:status

# Trigger deployment
pnpm deploy
```

## 🔗 Related Projects

- [Docusaurus](https://docusaurus.io/) - Documentation platform
- [IFLA](https://www.ifla.org/) - International Federation of Library Associations

## 📄 License

This project is licensed under the ISC License.

---

**Built with ❤️ for the global library community**
