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
- when planning a complex project, break down the plan into epics and tasks to create a clear roadmap and track progress systematically
- warn me when you start up if your environment isn't set to the project root
- ALWAYS Use context7 and look for code examples at the beginning of a coding session
- ALWAYS consult the docusaurus v3.8 documentation at https://docusaurus.io/docs during planning to identify best parctices and correct architecture
- remember to always run tests with --skip-nx-cache

## Key Insights for Docusaurus Navigation and Configuration:

  1. customFields is the ONLY safe place for arbitrary site-specific data
  2. Docusaurus validates config schema - unknown root fields cause build errors
  3. customFields data is globally accessible via Docusaurus context throughout the site

- The environment can only be set and used in docusaurus.config.ts to retrieve url and baeurl for the current environment and set the siteconfigmap in customfields

## Broken Links Issue Pattern:

**ACCEPTABLE broken links** (normal/expected):
- Links within the correct baseURL that point to non-existent pages
- Example from unimarc site: /unimarc/intro, /unimarc/elements, /unimarc/examples, /unimarc/rdf/ttl/unimarc.ttl etc.
- These are placeholders for future content - baseURL is correct, just missing pages

**PROBLEMATIC broken links** (misconfiguration):
- Links pointing to WRONG baseURL/site 
- Example from muldicat site: links pointing to /unimarc/ instead of /muldicat/
- These indicate site configuration errors where one site is using another site's navigation/footer links
- Pattern: muldicat site linking to /unimarc/ URLs instead of /muldicat/ URLs

**Root cause**: CRITICAL - Static state contamination in shared modules, NOT concurrency-related.
**Issue discovered**: Even with --parallel=1 (sequential builds), sites still get contaminated with each other's configurations.
**Evidence**: 
- Isolated builds work correctly (muldicat builds with correct config)
- 2-site concurrent builds work correctly (unimarc/LRM both build correctly)  
- Full 9-site builds (even sequential) cause contamination (unimarc links to /LRM/, portal links to /muldicat/)
**CRITICAL UPDATE**: The contamination occurs regardless of concurrency level, indicating module-level static state contamination in shared-config or theme packages.
**Fix needed**: Identify and eliminate static/global state in shared-config functions, likely in getSiteConfigMap() or theme factory functions.