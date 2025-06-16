#!/usr/bin/env node

/**
 * Build all sites in separate processes to prevent configuration contamination
 */

const { spawn } = require('child_process');
const path = require('path');

const sites = [
  'portal',
  'isbdm', 
  'lrm',
  'fr',
  'isbd',
  'muldicat',
  'unimarc'
];

async function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Command completed successfully: ${command} ${args.join(' ')}`);
        resolve();
      } else {
        console.error(`❌ Command failed with code ${code}: ${command} ${args.join(' ')}`);
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      console.error(`❌ Command error: ${error.message}`);
      reject(error);
    });
  });
}

async function buildSite(site) {
  console.log(`\n📦 Building ${site} site in isolated process...`);
  
  try {
    // Run each build in a completely separate process
    await runCommand('pnpm', [`build:${site}`], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        // Clear any potential environment contamination
        NODE_ENV: 'production'
      }
    });
    
    console.log(`✅ ${site} site built successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to build ${site} site:`, error.message);
    return false;
  }
}

async function buildAllSites() {
  console.log('🏗️  Building all sites in isolated processes...\n');
  
  const results = [];
  
  for (const site of sites) {
    const success = await buildSite(site);
    results.push({ site, success });
    
    if (!success) {
      console.error(`\n❌ Build failed for ${site}. Stopping build process.`);
      process.exit(1);
    }
    
    // Small delay between builds to ensure complete process cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 All sites built successfully!');
  console.log('\n📊 Build Summary:');
  results.forEach(({ site, success }) => {
    console.log(`  ${success ? '✅' : '❌'} ${site}`);
  });
}

// Run the build process
buildAllSites().catch((error) => {
  console.error('❌ Build process failed:', error);
  process.exit(1);
});
