#!/usr/bin/env tsx
/**
 * Test: Build each site with completely isolated dependencies
 * 
 * IMPORTANT: This is part of Phase 0 investigation documented in:
 * /developer_notes/plan-revert-to-individual-configs.md
 * Re-read that plan after any auto-compact to maintain context!
 * 
 * Theory: Docusaurus build caching is causing contamination between sites.
 * Even with isolated shared-config.old, the theme or other build artifacts
 * are being shared and causing state contamination.
 * 
 * Solution: Build shared-config.old, theme, and site completely independently
 * with cache clearing between each step. Store local copies in each site's
 * node_modules to ensure complete isolation.
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

async function clearAllCaches() {
  console.log('🧹 Clearing all caches...');
  
  try {
    // Clear NX cache
    execSync('nx reset', { stdio: 'inherit' });
    
    // Clear shared build outputs
    execSync('rimraf ./libs/shared-config.old/dist ./packages/theme/dist', { stdio: 'inherit' });
    
    // Clear webpack cache
    execSync('rimraf node_modules/.cache', { stdio: 'inherit' });
    
    console.log('✅ All caches cleared\n');
  } catch (error) {
    console.log('⚠️  Some cache clearing failed, continuing...\n');
  }
}

async function buildSharedConfigFresh(): Promise<void> {
  console.log('📦 Building fresh shared-config.old...');
  
  await clearAllCaches();
  
  execSync('nx build shared-config.old --skip-nx-cache', {
    stdio: 'inherit',
    env: { ...process.env, DOCS_ENV: 'local' },
  });
  
  console.log('✅ Fresh shared-config.old built\n');
}

async function buildThemeFresh(): Promise<void> {
  console.log('🎨 Building fresh theme...');
  
  // Clear theme cache specifically
  execSync('rimraf ./packages/theme/dist ./packages/theme/.docusaurus', { stdio: 'inherit' });
  
  execSync('nx build @ifla/theme --skip-nx-cache', {
    stdio: 'inherit',
    env: { ...process.env, DOCS_ENV: 'local' },
  });
  
  console.log('✅ Fresh theme built\n');
}

async function installLocalDependency(
  siteDir: string, 
  packageName: string, 
  sourcePath: string
): Promise<void> {
  const targetDir = path.join(siteDir, 'node_modules', ...packageName.split('/'));
  
  console.log(`📥 Installing ${packageName} locally for ${siteDir}...`);
  
  // Remove existing (symlink or directory)
  try {
    await fs.rm(targetDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore if doesn't exist
  }
  
  // Ensure parent directory exists
  await fs.mkdir(path.dirname(targetDir), { recursive: true });
  
  // Copy entire package
  execSync(`cp -R ${sourcePath} ${targetDir}`, { stdio: 'inherit' });
  
  console.log(`   ✅ ${packageName} installed locally\n`);
}

async function buildSiteWithLocalDeps(site: { key: string; dir: string }): Promise<void> {
  console.log(`🏗️  Building ${site.key} with local dependencies...`);
  
  // Clear site-specific caches
  const siteDocusaurusPath = path.join(site.dir, '.docusaurus');
  const siteBuildPath = path.join(site.dir, 'build');
  
  try {
    await fs.rm(siteDocusaurusPath, { recursive: true, force: true });
    await fs.rm(siteBuildPath, { recursive: true, force: true });
    console.log(`   Cleared ${site.key} caches`);
  } catch (error) {
    // Ignore if doesn't exist
  }
  
  // Build the site
  const buildCommand = `build:${site.key.toLowerCase()} --skip-nx-cache`;
  
  execSync(`pnpm ${buildCommand}`, {
    stdio: 'inherit',
    env: { ...process.env, DOCS_ENV: 'local' },
  });
  
  console.log(`✅ Built ${site.key} with local dependencies\n`);
}

async function buildCompletelyIsolated() {
  console.log('🔬 Testing completely isolated builds...\n');
  console.log('Each site will get fresh builds of shared-config.old and theme\n');
  console.log('='.repeat(70));
  
  for (const site of SITES) {
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Building completely isolated ${site.key}...`);
      console.log('='.repeat(60));
      
      // Step 1: Build fresh shared-config.old
      await buildSharedConfigFresh();
      
      // Step 2: Build fresh theme
      await buildThemeFresh();
      
      // Step 3: Install shared-config.old locally
      await installLocalDependency(
        site.dir,
        '@ifla/shared-config',
        'libs/shared-config.old'
      );
      
      // Step 4: Install theme locally
      await installLocalDependency(
        site.dir,
        '@ifla/theme',
        'packages/theme'
      );
      
      // Step 5: Build site with local dependencies
      await buildSiteWithLocalDeps(site);
      
      console.log(`🎉 Successfully built ${site.key} in complete isolation\n`);
      
    } catch (error) {
      console.error(`❌ Failed to build ${site.key} in isolation:`, error);
      
      // Continue with next site instead of stopping
      console.log(`⏭️  Continuing with next site...\n`);
    }
  }
  
  console.log('🎉 All sites built with complete isolation!');
  console.log('\nNext steps:');
  console.log('1. Run: pnpm serve:all');
  console.log('2. Verify contamination is eliminated');
  console.log('3. If successful, capture clean baselines');
  console.log('\nTo restore normal symlinks: pnpm install');
}

async function restoreNormalSetup() {
  console.log('🔄 Restoring normal pnpm workspace setup...');
  
  for (const site of SITES) {
    try {
      // Remove local copies
      const sharedConfigPath = path.join(site.dir, 'node_modules', '@ifla', 'shared-config.old');
      const themePath = path.join(site.dir, 'node_modules', '@ifla', 'theme');
      
      await fs.rm(sharedConfigPath, { recursive: true, force: true });
      await fs.rm(themePath, { recursive: true, force: true });
      
      console.log(`✅ Cleaned local dependencies for ${site.key}`);
    } catch (error) {
      console.log(`⚠️  Could not clean ${site.key} (this is fine)`);
    }
  }
  
  // Reinstall to restore symlinks
  execSync('pnpm install', { stdio: 'inherit' });
  
  console.log('✅ Normal workspace setup restored');
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--restore')) {
    await restoreNormalSetup();
  } else {
    await buildCompletelyIsolated();
  }
}

if (require.main === module) {
  main();
}
