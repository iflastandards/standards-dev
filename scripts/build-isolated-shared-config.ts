#!/usr/bin/env tsx
/**
 * Test: Build shared-config.old separately for each site to eliminate symlink contamination
 * 
 * IMPORTANT: This is part of Phase 0 investigation documented in:
 * /developer_notes/plan-revert-to-individual-configs.md
 * Re-read that plan after any auto-compact to maintain context!
 * 
 * Theory: The symlink means all sites use the same shared-config.old module instance.
 * If that module has stateful behavior, it contaminates across builds.
 * 
 * Solution: Build and install shared-config.old locally for each site.
 */

import { execSync } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

const SITES = [
  { key: 'portal', dir: 'portal' },
  { key: 'ISBDM', dir: 'standards/ISBDM' }, 
  { key: 'LRM', dir: 'standards/LRM' },
  { key: 'FRBR', dir: 'standards/FRBR' },
  { key: 'isbd', dir: 'standards/isbd' },
  { key: 'muldicat', dir: 'standards/muldicat' },
  { key: 'unimarc', dir: 'standards/unimarc' }
];

async function buildIsolatedSharedConfig() {
  console.log('🔬 Testing isolated shared-config.old builds to eliminate symlink contamination...\n');
  
  for (const site of SITES) {
    try {
      console.log(`${'='.repeat(60)}`);
      console.log(`Building isolated shared-config for ${site.key}...`);
      console.log('='.repeat(60));
      
      // Step 1: Build shared-config.old with fresh state
      console.log('1. Building fresh shared-config.old...');
      execSync('nx build shared-config.old --skip-nx-cache', {
        stdio: 'inherit',
        env: { ...process.env, DOCS_ENV: 'local' },
      });
      
      // Step 2: Remove existing symlink
      const symlinkPath = path.join(site.dir, 'node_modules', '@ifla', 'shared-config.old');
      console.log('2. Removing symlink...');
      try {
        await fs.unlink(symlinkPath);
        console.log(`   Removed: ${symlinkPath}`);
      } catch (error) {
        console.log(`   No symlink to remove (this is fine)`);
      }
      
      // Step 3: Copy built shared-config.old dist to local node_modules
      const sourceDistPath = path.join('libs', 'shared-config.old', 'dist');
      const sourcePackageJsonPath = path.join('libs', 'shared-config.old', 'package.json');
      const targetDir = path.dirname(symlinkPath);
      const targetPath = symlinkPath;
      
      console.log('3. Installing shared-config.old locally...');
      await fs.mkdir(targetDir, { recursive: true });
      await fs.mkdir(targetPath, { recursive: true });
      
      // Copy the built distribution
      execSync(`cp -R ${sourceDistPath} ${targetPath}/`, {
        stdio: 'inherit',
      });
      
      // Copy package.json for module resolution
      execSync(`cp ${sourcePackageJsonPath} ${targetPath}/`, {
        stdio: 'inherit',
      });
      
      console.log(`   Installed: ${targetPath}`);
      
      // Step 4: Build the site with isolated shared-config.old
      console.log('4. Building site with isolated shared-config.old...');
      const buildCommand = `build:${site.key.toLowerCase()} --skip-nx-cache`;
      
      execSync(`pnpm ${buildCommand}`, {
        stdio: 'inherit',
        env: { ...process.env, DOCS_ENV: 'local' },
      });
      
      console.log(`✅ Built ${site.key} with isolated shared-config successfully\n`);
      
    } catch (error) {
      console.error(`❌ Failed to build ${site.key} with isolated shared-config:`, error);
      
      // Restore symlink on failure
      try {
        const symlinkPath = path.join(site.dir, 'node_modules', '@ifla', 'shared-config.old');
        await fs.rm(symlinkPath, { recursive: true, force: true });
        await fs.symlink('../../../libs/shared-config.old', symlinkPath);
        console.log('   Restored symlink after failure');
      } catch (restoreError) {
        console.log('   Could not restore symlink, you may need to run pnpm install');
      }
      
      throw error;
    }
  }
  
  console.log('🎉 All sites built with isolated shared-config.old!');
  console.log('\nNext steps:');
  console.log('1. Run: pnpm serve:all');
  console.log('2. Verify contamination is eliminated');
  console.log('3. If successful, capture clean baselines');
  console.log('\nTo restore symlinks: pnpm install');
}

async function restoreSymlinks() {
  console.log('🔄 Restoring symlinks...');
  
  for (const site of SITES) {
    try {
      const symlinkPath = path.join(site.dir, 'node_modules', '@ifla', 'shared-config.old');
      await fs.rm(symlinkPath, { recursive: true, force: true });
      await fs.symlink('../../../libs/shared-config.old', symlinkPath);
      console.log(`✅ Restored symlink for ${site.key}`);
    } catch (error) {
      console.log(`⚠️  Could not restore symlink for ${site.key}`);
    }
  }
  
  console.log('Run pnpm install to ensure everything is properly linked');
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--restore')) {
    await restoreSymlinks();
  } else {
    await buildIsolatedSharedConfig();
  }
}

if (require.main === module) {
  main();
}
