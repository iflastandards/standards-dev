# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Development Workflows

### Essential Commands
- **Package manager**: Always use `pnpm` (never npm or yarn)
- **Build single site**: `nx build {name}` (e.g., `nx build portal`, `nx build isbdm`)
- **Start dev server**: `nx start {site}` or `nx run {site}:start:robust` (with port cleanup)
- **Serve built site**: `nx serve {site}` or `nx run {site}:serve:robust` (with port cleanup)
- **Test execution**: `pnpm test` (nx affected with parallel execution)
- **Type checking**: `pnpm typecheck` (nx affected with parallel execution)
- **Linting**: `pnpm lint` (nx affected with parallel execution)

### Deployment and Debugging

#### Deployment Debugging
- Always check the nx-mcp deployment logs when debugging deployment problems

[... rest of the existing file content remains unchanged ...]