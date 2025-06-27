#!/usr/bin/env node

/**
 * NX-aware regression testing for IFLA standards sites
 * Tests affected sites only for faster validation
 * 
 * Usage:
 *   node scripts/test-site-builds-affected.js              # Test affected sites only
 *   node scripts/test-site-builds-affected.js --all        # Test all sites
 *   node scripts/test-site-builds-affected.js --site ISBDM # Test specific site
 *   node scripts/test-site-builds-affected.js --env production
 */

const { execSync } = require('child_process');
const path = require('path');

// Import the original test script functions
const originalScript = require('./test-site-builds.js');

// Function to get affected projects using NX
function getAffectedProjects() {
  try {
    const output = execSync('npx nx print-affected --select=projects --type=app', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'] // Suppress stderr
    });
    
    if (!output || output.trim() === '') {
      return [];
    }
    
    // Parse the comma-separated list of projects
    return output.trim().split(',').map(p => p.trim()).filter(Boolean);
  } catch (error) {
    console.log('⚠️  Could not detect affected projects, falling back to all sites');
    return null;
  }
}

// Function to determine which sites to test based on affected projects
function determineAffectedSites(affectedProjects) {
  if (!affectedProjects) return null;
  
  const affectedSites = [];
  
  // Check if theme package is affected (affects all sites)
  if (affectedProjects.includes('@ifla/theme')) {
    console.log('🎯 Theme package affected - all sites need testing');
    return null; // Test all sites
  }
  
  // Map project names to site names
  const projectToSite = {
    'portal': 'portal',
    'isbdm': 'ISBDM',
    'lrm': 'LRM',
    'frbr': 'FRBR',
    'isbd': 'isbd',
    'muldicat': 'muldicat',
    'unimarc': 'unimarc'
  };
  
  // Find affected sites
  affectedProjects.forEach(project => {
    const siteName = projectToSite[project.toLowerCase()];
    if (siteName && !affectedSites.includes(siteName)) {
      affectedSites.push(siteName);
    }
  });
  
  return affectedSites;
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  // Check if user wants to test all sites
  const forceAll = args.includes('--all');
  const siteIndex = args.indexOf('--site');
  const specificSite = siteIndex !== -1 ? args[siteIndex + 1] : null;
  
  if (forceAll || specificSite) {
    // Use original behavior
    console.log('🔍 Running site tests in manual mode...');
    require('./test-site-builds.js');
    return;
  }
  
  // Get affected projects
  console.log('🎯 Detecting affected projects using NX...');
  const affectedProjects = getAffectedProjects();
  
  if (!affectedProjects || affectedProjects.length === 0) {
    console.log('✅ No affected projects detected - no sites need testing');
    process.exit(0);
  }
  
  console.log(`📦 Affected projects: ${affectedProjects.join(', ')}`);
  
  // Determine which sites to test
  const affectedSites = determineAffectedSites(affectedProjects);
  
  if (!affectedSites) {
    // Test all sites
    console.log('🏗️  Testing all sites due to core changes...');
    args.push('--site', 'all');
  } else if (affectedSites.length === 0) {
    console.log('✅ No site projects affected - skipping site tests');
    process.exit(0);
  } else {
    // Test only affected sites
    console.log(`🎯 Testing affected sites: ${affectedSites.join(', ')}`);
    
    // We need to test sites one by one
    const originalArgs = [...args];
    let exitCode = 0;
    
    for (const site of affectedSites) {
      process.argv = ['node', 'test-site-builds.js', ...originalArgs, '--site', site];
      try {
        require('./test-site-builds.js');
      } catch (error) {
        exitCode = 1;
      }
    }
    
    process.exit(exitCode);
  }
  
  // Run the original script with modified arguments
  process.argv = ['node', 'test-site-builds.js', ...args];
  require('./test-site-builds.js');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { getAffectedProjects, determineAffectedSites };