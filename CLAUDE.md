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

## Key Insights for Docusaurus Navigation and Configuration:

  1. customFields is the ONLY safe place for arbitrary site-specific data
  2. Docusaurus validates config schema - unknown root fields cause build errors
  3. customFields data is globally accessible via Docusaurus context throughout the site

[Rest of the existing file content remains unchanged]