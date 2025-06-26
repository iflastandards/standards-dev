#!/usr/bin/env tsx
/**
 * Build all sites for baseline capture using standard package scripts
 * 
 * IMPORTANT: This is part of Phase 0 of the plan documented in:
 * /developer_notes/plan-revert-to-individual-configs.md
 * Re-read that plan after any auto-compact to maintain context!
 */

import { execSync } from 'child_process';

const SITES = [
  'portal',
  'ISBDM', 
  'LRM',
  'FRBR',
  'isbd',
  'muldicat',
  'unimarc'
];

async function buildAllSites() {
  console.log('Building all sites with cache clearing for baseline capture...\n');
  
  for (const site of SITES) {
    try {
      console.log(`${'='.repeat(50)}`);
      console.log(`Building ${site}...`);
      console.log('='.repeat(50));
      
      // Use the standard build command from package.json with cache skipping
      const buildCommand = `pnpm build:${site.toLowerCase()} --skip-nx-cache`;
      
      execSync(buildCommand, {
        stdio: 'inherit',
        env: { ...process.env, DOCS_ENV: 'local' },
      });
      
      console.log(`✓ Built ${site} successfully\n`);
      
    } catch (error) {
      console.error(`✗ Failed to build ${site}:`, error);
      process.exit(1);
    }
  }
  
  console.log('🎉 All sites built successfully!');
  console.log('\nNext steps:');
  console.log('1. Run: pnpm serve:all');
  console.log('2. Verify all sites are working correctly');
  console.log('3. Run: tsx scripts/capture-snapshots-from-running.ts');
}

buildAllSites();