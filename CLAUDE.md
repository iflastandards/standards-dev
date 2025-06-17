- remember that we're using pnpm in this project
- this is the command to build a single standards: pnpm build standards/{name}
- NEVER hard code navigation links. Always use links that can resolve regardless of base url
- offer to add to git, create a commit message, and commit if I say yes/ok
- always test and pass tests before offering to commit. We're not done until tests pass. If there's no formal re-runnable test, offer to make one
- we're using vitest as a test runner
- use puppeteer for interface testing when useful
- when you're searching for missing code, recursively search /Users/jonphipps/Code/IFLA/standards-dev first, then search the git repo history and and branches, then recuresively search /Users/jonphipps/Code/IFLA/
- when writing scripts that need to use the url of a site for navigation, validation, or any purpose that equates a site with a url, use the configuration from this file: /Users/jonphipps/Code/IFLA/standards-dev/packages/theme/src/config/siteConfigCore.ts
- if you need to start a server or build ask me to do it and tell you when it's running so you don't waste time waiting for it to load and timeout

# IFLA Standards Development Project Context

## Project Architecture
- **Monorepo**: pnpm workspaces with portal + 6 standards (ISBDM, LRM, FRBR, isbd, muldicat, unimarc)
- **Portal**: Shared Docusaurus site for onboarding, dashboards & tooling links
- **Per-standard sites**: Each standard is its own Docusaurus project with MDX + RDF front-matter
- **CSV → RDF workflow**: csv/ (source) → tap-to-rdf build → rdf/{ttl,jsonld,xml}/ (output)
- **Vocabulary server**: Dockerised NGINX with content-negotiation (HTML → docs, RDF → files)

## Completed Phases (Phases 0-2)
✅ Phase 0: Baseline verified - deps installed, package names standardized (@ifla/site-*)
✅ Phase 1A: Portal landing page with hero, standards table, manage navigation
✅ Phase 1B: Shared QuickStart/DownloadPanel components, index pages for all standards  
✅ Phase 2: GitHub Pages deployment workflows (deploy-all.yml with smart change detection)

## Epic Breakdown (Phases 3-9)

### EPIC 3: CSV ⇆ Google Sheet Integration
- 3.1: Setup Google Service Account and secrets management
- 3.2: Create sheet-sync CLI tool for pull/push operations
- 3.3: Add sheet configuration files for each standard
- 3.4: Create GitHub Actions for automated sheet sync
- 3.5: Wire portal buttons to trigger sheet sync actions

### EPIC 4: Document Pages & Front-matter RDF
- 4.1: Create tap-to-rdf CLI tool for MDX generation
- 4.2: Generate MDX pages for non-ISBDM standards from CSV
- 4.3: Implement front-matter validation in build pipeline
- 4.4: Create draft release workflow with PDF generation

### EPIC 5: RDF Harvesting & Vocabulary Server
- 5.1: Extend tap-to-rdf to harvest and combine RDF from pages
- 5.2: Create Docker nginx vocabulary server image
- 5.3: Setup content negotiation for HTML/RDF responses
- 5.4: Create deploy-vocab GitHub Action workflow

### EPIC 6: Management UI Integration
- 6.1: Create scaffold-page GitHub Action for new MDX pages
- 6.2: Wire portal 'New Page' button to scaffold action
- 6.3: Create draft-release GitHub Action with semver bumping
- 6.4: Wire portal 'Draft Release' button to release action
- 6.5: Add PDF build integration to release workflow

### EPIC 7: Staging Vocabulary Server
- 7.1: Setup DigitalOcean droplet for staging
- 7.2: Deploy Docker compose stack to staging server
- 7.3: Configure subdomain and SSL for staging vocab server
- 7.4: Create test harness for vocabulary server endpoints

### EPIC 8: Monitoring & Alerting
- 8.1: Setup GoAccess log analysis in Docker compose
- 8.2: Configure Prometheus metrics collection
- 8.3: Setup Grafana dashboard with vocab server metrics
- 8.4: Configure alerting rules for 5xx errors and 404 spikes

### EPIC 9: Production Cut-over
- 9.1: Remove custom domain from old Jekyll repository
- 9.2: Configure custom domain in GitHub Pages for standards-dev
- 9.3: Update BASE_URL environment to '/' in deploy workflows
- 9.4: Replace PHP gateway with Docker nginx on production
- 9.5: Run production test harness and announce new site

## Key Implementation Notes
- Use TodoWrite/TodoRead for session task tracking
- ISBDM is the reference implementation with full content
- Other standards are scaffolded and ready for content
- Portal includes manage buttons that will trigger GitHub Actions
- All sites use shared @ifla/theme package for components

## Project Configuration Approach
- All sites need to use the same configuration, same Docusaurus, same components, same theme, same colors
- No advantage to separate package.json, tsconfig, etc.
- Content is the only distinguishing factor between sites
- Editors portal is the only distinct site, hosting tools for workflow management and access

## Development Gotchas
- we can't fix javascript or typescript errors by adding "type":"module" to package.json. It breaks docusaurus browser execution

## Component Development Guidelines
- always use sass for styles. Components should be created in folders named for the component and the component code should be in index.tsx and styles in styles.module.scss

## Developer Notes Management
- Maintain a comprehensive set of instructions in the developer_notes folder. Each file should have:
    - Simple usage instructions at the top
    - More detailed developer section with:
        - Related code information
        - Where features are configured
        - Hints for modification
- Remember to ask about updating notes when we finish working on something
