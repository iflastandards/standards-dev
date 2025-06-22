#!/usr/bin/env node

/**
 * Optimized Site Builds Test Script
 * 
 * Uses Nx affected detection and smart caching for faster regression testing
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Simple color functions
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

function runCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
    return result ? result.trim() : '';
  } catch (error) {
    if (!options.silent) {
      console.error(colors.red(`Error running: ${command}`));
      console.error(colors.red(error.message));
    }
    return null;
  }
}

function getAffectedProjects() {
  console.log(colors.cyan('🎯 Detecting affected projects...'));
  
  const affected = runCommand('npx nx print-affected --select=projects --type=app', { silent: true });
  
  if (affected && affected.trim()) {
    const projects = affected.split(',').map(p => p.trim()).filter(Boolean);
    console.log(colors.green(`📦 Affected projects: ${projects.join(', ')}`));
    return projects;
  }
  
  console.log(colors.yellow('📝 No affected projects detected'));
  return [];
}

function isBuildFresh(projectPath, maxAgeMinutes = 60) {
  const buildPath = path.join(projectPath, 'build');
  
  if (!fs.existsSync(buildPath)) {
    return false;
  }
  
  try {
    const stats = fs.statSync(buildPath);
    const ageMinutes = (Date.now() - stats.mtime.getTime()) / (1000 * 60);
    return ageMinutes < maxAgeMinutes;
  } catch (error) {
    return false;
  }
}

function validateSiteConfiguration(siteName) {
  console.log(colors.blue(`⚙️  Validating ${siteName} configuration...`));
  
  const siteDir = siteName === 'portal' ? 'portal' : `standards/${siteName}`;
  const configPath = path.join(siteDir, 'docusaurus.config.ts');
  
  // Check if config file exists
  if (!fs.existsSync(configPath)) {
    console.log(colors.red(`❌ Configuration file not found: ${configPath}`));
    return false;
  }
  
  // Check if it uses the new environment-based system
  const configContent = fs.readFileSync(configPath, 'utf8');
  const hasEnvSystem = configContent.includes('validateEnvConfig') || 
                      configContent.includes('getEnvironmentName');
  
  if (!hasEnvSystem) {
    console.log(colors.yellow(`⚠️  ${siteName} not using optimized environment system`));
  }
  
  // Check for required environment files
  const envFiles = ['.env.site', '.env.site.local', '.env.site.development', '.env.site.production'];
  const missingEnvFiles = envFiles.filter(file => 
    !fs.existsSync(path.join(siteDir, file))
  );
  
  if (missingEnvFiles.length > 0) {
    console.log(colors.yellow(`⚠️  ${siteName} missing env files: ${missingEnvFiles.join(', ')}`));
  }
  
  console.log(colors.green(`✅ ${siteName} configuration validated`));
  return true;
}

function testSiteBuild(siteName, useCache = true) {
  console.log(colors.blue(`🏗️  Testing ${siteName} build...`));
  
  const siteDir = siteName === 'portal' ? 'portal' : `standards/${siteName}`;
  
  // Check if we can use cached build
  if (useCache && isBuildFresh(siteDir)) {
    console.log(colors.green(`⚡ Using fresh cached build for ${siteName}`));
    return true;
  }
  
  // Run Nx build with caching
  const buildTarget = siteName === 'portal' ? 'portal:build' : `${siteName.toLowerCase()}:build`;
  const result = runCommand(`npx nx run ${buildTarget} --skip-nx-cache=false`, { silent: false });
  
  if (result === null) {
    console.log(colors.red(`❌ Build failed for ${siteName}`));
    return false;
  }
  
  console.log(colors.green(`✅ Build passed for ${siteName}`));
  return true;
}

function fastConfigurationTest() {
  console.log(colors.bold('🚀 Running fast configuration validation...'));
  
  const sites = ['portal', 'ISBDM', 'LRM', 'FRBR', 'isbd', 'muldicat', 'unimarc'];
  let allPassed = true;
  
  for (const site of sites) {
    if (!validateSiteConfiguration(site)) {
      allPassed = false;
    }
  }
  
  return allPassed;
}

function smartBuildTest(targetSites = null, affectedOnly = false) {
  console.log(colors.bold('🏗️  Running smart build tests...'));
  
  let sitesToTest = targetSites || ['portal', 'ISBDM', 'LRM'];
  
  if (affectedOnly) {
    const affected = getAffectedProjects();
    if (affected.length === 0) {
      console.log(colors.green('📝 No affected projects - skipping build tests'));
      return true;
    }
    
    // Map affected projects to site names
    const siteMap = {
      'portal': 'portal',
      'isbdm': 'ISBDM', 
      'lrm': 'LRM',
      'frbr': 'FRBR',
      'isbd': 'isbd',
      'muldicat': 'muldicat',
      'unimarc': 'unimarc'
    };
    
    sitesToTest = affected.map(p => siteMap[p.toLowerCase()]).filter(Boolean);
    
    if (sitesToTest.length === 0) {
      console.log(colors.yellow('📝 No site projects affected - testing portal as representative'));
      sitesToTest = ['portal'];
    }
  }
  
  console.log(colors.cyan(`🎯 Testing sites: ${sitesToTest.join(', ')}`));
  
  let allPassed = true;
  for (const site of sitesToTest) {
    if (!testSiteBuild(site, true)) {
      allPassed = false;
    }
  }
  
  return allPassed;
}

function runParallelTests(testType = 'fast') {
  console.log(colors.bold('⚡ Running parallel Nx tests...'));
  
  let success = true;
  
  if (testType === 'comprehensive') {
    // Run comprehensive tests in parallel
    console.log(colors.blue('🧪 Running comprehensive test suite...'));
    
    const commands = [
      'npx nx affected --target=typecheck --parallel=3 --skip-nx-cache=false',
      'npx nx affected --target=lint --parallel=3 --skip-nx-cache=false --quiet',
      'npx nx affected --target=test --parallel=3 --skip-nx-cache=false'
    ];
    
    for (const cmd of commands) {
      if (runCommand(cmd) === null) {
        success = false;
        break;
      }
    }
  } else {
    // Fast validation
    console.log(colors.blue('⚡ Running fast validation...'));
    
    const typecheckResult = runCommand('npx nx run-many --target=typecheck --all --parallel=3 --skip-nx-cache=false');
    if (typecheckResult === null) {
      success = false;
    }
  }
  
  return success;
}

function main() {
  const args = process.argv.slice(2);
  const mode = args.includes('--mode') ? args[args.indexOf('--mode') + 1] : 'smart';
  const affectedOnly = args.includes('--affected-only');
  const skipBuild = args.includes('--skip-build');
  
  console.log(colors.bold(colors.cyan('\n🔍 Optimized Site Build Testing\n')));
  console.log(colors.cyan(`Mode: ${mode}, Affected Only: ${affectedOnly}, Skip Build: ${skipBuild}\n`));
  
  let success = true;
  
  // Always run fast configuration validation
  if (!fastConfigurationTest()) {
    success = false;
  }
  
  // Run parallel tests based on mode
  if (mode === 'comprehensive') {
    if (!runParallelTests('comprehensive')) {
      success = false;
    }
  } else {
    if (!runParallelTests('fast')) {
      success = false;
    }
  }
  
  // Run build tests if not skipped
  if (!skipBuild) {
    if (!smartBuildTest(null, affectedOnly)) {
      success = false;
    }
  }
  
  console.log('\n' + colors.bold('📊 Test Summary:'));
  if (success) {
    console.log(colors.green('✅ All optimized tests passed!'));
    console.log(colors.cyan('📈 Performance gains from Nx caching and affected detection'));
    
    // Mark tests as run for pre-push tracking
    try {
      require('./mark-tests-run.js').markTestsRun();
    } catch (error) {
      // Ignore errors in test marking
    }
    
    process.exit(0);
  } else {
    console.log(colors.red('❌ Some tests failed'));
    process.exit(1);
  }
}

// CLI usage help
if (process.argv.includes('--help')) {
  console.log(`
${colors.bold('Optimized Site Build Testing')}

Usage: node test-site-builds-optimized.js [options]

Options:
  --mode <type>        Test mode: 'fast', 'smart', 'comprehensive' (default: smart)
  --affected-only      Only test affected projects
  --skip-build         Skip build tests, only validate configurations
  --help              Show this help message

Examples:
  node test-site-builds-optimized.js                          # Smart testing
  node test-site-builds-optimized.js --mode fast              # Fast validation only
  node test-site-builds-optimized.js --affected-only          # Test only affected projects
  node test-site-builds-optimized.js --mode comprehensive     # Full regression suite
  node test-site-builds-optimized.js --skip-build             # Configuration validation only
`);
  process.exit(0);
}

if (require.main === module) {
  main();
}