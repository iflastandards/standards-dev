# Development Workflow

This document outlines the proper development workflow for the IFLA Standards project.

## Repository Setup

- **Main Repository**: `iflastandards/standards-dev` (upstream)
- **Development Fork**: `jonphipps/standards-dev` (fork)
- **Local Remotes**:
  - `origin`: `git@github.com:iflastandards/standards-dev.git`
  - `fork`: `git@github.com:jonphipps/standards-dev.git`

## Environment Deployment

| Environment | Branch | Repository | Deployment URL | Triggers |
|-------------|--------|------------|----------------|----------|
| **Development** | `dev` | `jonphipps/standards-dev` | `https://jonphipps.github.io/standards-dev/` | Push to `dev` branch |
| **Preview** | `main` | `iflastandards/standards-dev` | `https://iflastandards.github.io/standards-dev/` | Push/PR to `main` branch |
| **Production** | `main` | `iflastandards/standards-dev` | `https://iflastandards.info/` | Automatic from main |

## Development Workflow

### 1. Development & Testing
```bash
# Work on dev branch (your personal testing environment)
git checkout dev
git pull fork dev

# Make changes, commit as usual
git add .
git commit -m "your changes"

# Push to your fork - triggers deploy-dev.yml
git push fork dev

# Test changes at: https://jonphipps.github.io/standards-dev/
```

### 2. Move to Preview (Create Pull Request)
Once changes are tested and ready:

```bash
# Create PR from your fork's dev branch to upstream main
gh pr create --repo iflastandards/standards-dev --base main --head jonphipps:dev --title "Your PR Title" --body "Description of changes"
```

**OR** use GitHub web interface:
- Go to `https://github.com/iflastandards/standards-dev`
- Click "New pull request" 
- Select: `iflastandards/standards-dev:main` ← `jonphipps/standards-dev:dev`

### 3. Preview & Production Deployment
- **PR merge to main** → Triggers `ci-preview.yml` → Deploys to preview site
- **Main branch updates** → Triggers `deploy-all.yml` → Deploys to production

## Workflow Summary

1. **Development**: `jonphipps/standards-dev:dev` → Test on personal GitHub Pages
2. **Preview**: PR to `iflastandards/standards-dev:main` → Preview on official staging
3. **Production**: Automatic deployment from main branch → Live site

## GitHub Actions

- **`deploy-dev.yml`**: Builds and deploys dev branch to personal GitHub Pages
- **`ci-preview.yml`**: Builds and deploys main branch to preview site (triggers on main branch only)
- **`deploy-all.yml`**: Handles production deployment

## Environment Configuration

Environment settings are defined in `packages/theme/src/config/siteConfigCore.ts`:

- `DocsEnv.Dev`: Personal development environment (`https://jonphipps.github.io`)
- `DocsEnv.Preview`: Official preview environment (`https://iflastandards.github.io`)
- `DocsEnv.Production`: Production environment (`https://iflastandards.info`)

## Notes

- Always test changes in the dev environment before creating PRs
- The `ci-preview.yml` workflow only triggers on pushes/PRs to the main branch
- SSH authentication is recommended for pushing workflow files
- Ensure GitHub Pages is enabled on your fork with `gh-pages` branch as source