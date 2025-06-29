# Testing Strategy - Quick Reference

This document provides a quick overview of the automated testing strategy for the IFLA Standards project.

## 🚀 Automated Testing (Zero Configuration Required)

### Pre-commit (Runs automatically on `git commit`)
```bash
# These run automatically when you commit:
✅ TypeScript type checking
✅ ESLint code quality  
✅ Unit/integration tests (446 tests)
✅ Site configuration validation

# Duration: ~30-60 seconds
# Purpose: Fast feedback, prevent broken commits
```

### Pre-push (Runs automatically on `git push`)
```bash
# Branch-aware testing:

🔒 Protected branches (main/dev):
✅ Full portal production build
✅ ISBDM production build  
✅ Portal E2E testing
✅ Complete regression suite
Duration: ~5-10 minutes

📝 Feature branches:
✅ Configuration validation
✅ Representative build test
✅ Abbreviated regression testing  
Duration: ~2-3 minutes
```

### GitHub Actions (Runs automatically on push/PR)
```bash
✅ Unit Tests & Type Safety (new!)
✅ Site Configuration Testing
✅ Matrix Build Testing (7 sites in parallel)
✅ URL Validation & Link Checking
✅ Comprehensive Result Reporting
```

## 🛠️ Manual Testing Commands

```bash
# Development workflow
pnpm test                    # Unit tests only
pnpm test:full              # Unit + config validation
pnpm test:regression        # Full regression suite

# Specific testing
pnpm test:builds:config     # Fast config validation
pnpm test:builds:critical   # Portal + ISBDM builds
pnpm test:portal:e2e        # Portal end-to-end testing

# Individual components
pnpm typecheck              # TypeScript validation
pnpm lint --quiet           # Code quality check
```

## 📊 Test Coverage

| Test Type | Count | Duration | Automation |
|-----------|-------|----------|------------|
| **Unit/Integration** | 446 tests | ~5-10s | ✅ Pre-commit |
| **TypeScript** | All files | ~10-15s | ✅ Pre-commit |
| **ESLint** | All files | ~5-10s | ✅ Pre-commit |
| **Site Configs** | 7 sites | ~30s | ✅ Pre-commit |
| **Build Tests** | 7 sites | ~2-5min | ✅ Pre-push |
| **E2E Tests** | Portal | ~2-3min | ✅ Pre-push (main/dev) |

## 🎯 When Tests Run

### Developer Workflow
1. **Make changes** → Normal development
2. **`git add .`** → Stage changes  
3. **`git commit`** → 🔍 **Pre-commit tests run automatically**
4. **`git push`** → 🚀 **Pre-push tests run automatically**
5. **Create PR** → 🤖 **GitHub Actions run automatically**

### What Gets Tested When
- **Every commit:** Type safety, code quality, unit tests, config validation
- **Every push:** + Build regression tests (branch-dependent scope)
- **Every PR:** + Full CI/CD pipeline with matrix testing
- **Manual:** Full regression suite available on-demand

## 🚨 What Happens When Tests Fail

### Pre-commit Failure
```bash
❌ TypeScript errors found. Please fix before committing.
# Commit is blocked until issues are resolved
```

### Pre-push Failure  
```bash
❌ Portal build test failed.
# Push is blocked until issues are resolved
```

### CI/CD Failure
- GitHub Actions provide detailed logs
- Failed build artifacts are automatically preserved
- PR status checks prevent merging until fixed

## 🔧 Bypassing Tests (Use Sparingly)

```bash
# Skip pre-commit (NOT recommended)
git commit --no-verify

# Skip pre-push (NOT recommended)  
git push --no-verify

# Run manual tests instead
pnpm test:pre-commit        # Equivalent to pre-commit hook
pnpm test:pre-push          # Equivalent to pre-push hook
```

## 📚 Documentation

- **Full Guide:** `developer_notes/build-regression-testing.md`
- **Component Testing:** `developer_notes/testing-vocabulary-pages.md`
- **Configuration:** `developer_notes/configuration-architecture.md`

## 🎉 Benefits

✅ **Automatic Quality Assurance** - No manual test execution required  
✅ **Fast Feedback** - Issues caught before they reach remote  
✅ **Branch Protection** - Stricter testing for main/dev branches  
✅ **Comprehensive Coverage** - Unit, integration, build, and E2E testing  
✅ **CI/CD Integration** - Seamless GitHub Actions automation  
✅ **Zero Configuration** - Works immediately for all developers  

**The testing strategy ensures high code quality and prevents regressions without requiring manual intervention!** 🚀