# Nx Workflow Optimization Guide

This guide explains the Nx caching optimizations implemented in this repository and how to use them effectively.

## Overview

We've implemented Nx caching to significantly speed up builds, tests, and linting operations by avoiding redundant work and leveraging distributed computation.

## Key Benefits

- ⚡ **Faster Builds**: Only rebuild changed projects and their dependents
- 🧠 **Smart Caching**: Cache results locally and in the cloud
- 🔄 **Incremental Operations**: Run only affected projects
- 🌐 **Distributed Execution**: Parallelize CI workloads across agents
- 📊 **Build Analytics**: Track performance and optimization opportunities

## New Commands

### Building Projects

```bash
# Build all projects (optimized with caching)
pnpm build:all

# Build all projects using Nx directly
pnpm build:all:nx

# Build only affected projects (great for PRs)
nx affected --target=build

# Build specific project
nx build portal
nx build frbr
nx build @ifla/theme
```

### Testing

```bash
# Run all tests with caching
pnpm test:all

# Run only affected tests
pnpm test:affected
nx affected --target=test

# Run tests for specific project
nx test standards-cli
```

### Linting

```bash
# Lint all projects
pnpm lint:all

# Lint only affected projects
pnpm lint:affected
nx affected --target=lint

# Lint specific project
nx lint portal
```

### Type Checking

```bash
# Type check all projects
pnpm typecheck:all

# Type check only affected projects
nx affected --target=typecheck
```

## Cache Configuration

### What Gets Cached

- **Build outputs**: `dist/`, `build/` directories
- **Test results**: Test pass/fail status and coverage
- **Lint results**: ESLint analysis results
- **Type checking**: TypeScript compilation results

### Cache Invalidation

Caches are automatically invalidated when:
- Source files change
- Configuration files change (`tsconfig.json`, `eslint.config.js`, etc.)
- Dependencies change (`package.json`, `pnpm-lock.yaml`)
- Docusaurus configs change (`docusaurus.config.js`, `sidebars.js`)

### Named Inputs

We've configured these input patterns:
- `default`: All project files excluding build artifacts
- `production`: Production code excluding tests and dev configs
- `docusaurus`: Docusaurus-specific files including theme and preset dependencies

## CI/CD Optimizations

### Nx Cloud Integration

- **Distributed Execution**: CI jobs run across multiple agents for faster completion
- **Remote Caching**: Share cache hits between local development and CI
- **Affected Detection**: Only test/build what actually changed

### Workflow Files

- `nx-optimized-ci.yml`: New Nx-powered CI with distributed execution
- `deploy-all.yml`: Existing deployment workflow (can be gradually migrated)
- `test-site-builds.yml`: Existing test workflow (can be gradually migrated)

## Local Development

### First-Time Setup

```bash
# Install dependencies
pnpm install

# Build theme and preset packages
nx build @ifla/theme
nx build @ifla/preset-ifla

# Or build all at once
pnpm build:all
```

### Daily Workflow

```bash
# Check what's affected by your changes
nx affected:graph

# Run affected tests
nx affected --target=test

# Build affected projects
nx affected --target=build

# Lint your changes
nx affected --target=lint
```

### Cache Management

```bash
# View cache info
nx show projects

# Clear cache if needed
nx reset

# View build insights
nx show project portal --web
```

## Performance Tips

### For Developers

1. **Use affected commands** - Don't rebuild everything if you only changed one project
2. **Leverage caching** - Second runs should be much faster
3. **Check dependency graph** - Use `nx graph` to understand project relationships

### For CI/CD

1. **Nx Cloud** is already configured for optimal caching
2. **Distributed execution** spreads work across multiple agents
3. **Remote caching** means CI and local dev share cache hits

## Migration Path

### Immediate Benefits (Already Implemented)

- ✅ Local caching for builds, tests, and linting
- ✅ Project dependency management
- ✅ Nx Cloud integration
- ✅ New optimized build scripts

### Future Enhancements

- 🔄 Migrate existing CI workflows to use Nx affected detection
- 📊 Add build performance monitoring
- 🎯 Fine-tune cache configurations based on usage patterns

## Troubleshooting

### Cache Issues

```bash
# Clear all caches
nx reset

# Clear specific project cache
nx reset portal
```

### Build Issues

```bash
# Force rebuild without cache
nx build portal --skip-nx-cache

# Run with verbose logging
nx build portal --verbose
```

### CI Issues

- Check Nx Cloud dashboard for distributed execution logs
- Verify `NX_CLOUD_AUTH_TOKEN` is set in repository secrets
- Review cache hit rates in build logs

## Monitoring

### Nx Cloud Dashboard

Access build analytics and performance metrics at: https://cloud.nx.app

### Local Insights

```bash
# Project dependency graph
nx graph

# Build performance analysis
nx show project portal --web

# Cache effectiveness
nx report
```

## Next Steps

1. **Try the new commands** - Start using `pnpm build:all` and affected commands
2. **Monitor performance** - Check cache hit rates and build times
3. **Gradual migration** - Replace manual concurrency with Nx orchestration
4. **Team adoption** - Share this guide with the development team

---

*This optimization maintains backward compatibility while providing significant performance improvements. All existing commands continue to work, with new optimized alternatives now available.*