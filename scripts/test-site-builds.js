#!/usr/bin/env node

/**
 * Regression testing for IFLA standards sites
 * Tests that sites build correctly and have proper URL configuration
 * 
 * Usage:
 *   node scripts/test-site-builds.js --site all        # Test all sites including portal
 *   node scripts/test-site-builds.js --site ISBDM      # Test specific site
 *   node scripts/test-site-builds.js --site portal     # Test portal only
 *   node scripts/test-site-builds.js --env production  # Test specific environment
 */

const { program } = require('commander');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { sites, DocsEnv } = require('../packages/theme/dist/config/siteConfigCore');

// Valid sites excluding github
const validSites = Object.keys(sites).filter(site => site !== 'github');
const validEnvironments = Object.values(DocsEnv);

program
  .option('--site <site>', 'Site to test (specific site, "portal", or "all")')
  .option('--env <env>', 'Environment to test against', 'localhost')
  .option('--skip-build', 'Skip the build step (assumes already built)')
  .option('--verbose', 'Show detailed output')
  .parse();

const options = program.opts();
const { site: siteOption, env, skipBuild, verbose } = options;

// Test results tracking
const results = {
  passed: [],
  failed: [],
  skipped: [],
  errors: []
};

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, type = 'info') {
  const prefix = {
    info: `${colors.blue}ℹ${colors.reset}`,
    success: `${colors.green}✓${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    warning: `${colors.yellow}⚠${colors.reset}`,
    test: `${colors.blue}🧪${colors.reset}`
  };
  
  console.log(`${prefix[type] || ''} ${message}`);
}

function logSection(title) {
  console.log(`\n${colors.bold}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bold}${title}${colors.reset}`);
  console.log(`${colors.bold}${'='.repeat(60)}${colors.reset}\n`);
}

// Execute command with error handling
function execCommand(command, cwd = process.cwd()) {
  try {
    if (verbose) {
      log(`Running: ${command}`, 'info');
    }
    const output = execSync(command, { 
      cwd, 
      stdio: verbose ? 'inherit' : 'pipe',
      encoding: 'utf8'
    });
    return { success: true, output };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || error.toString(),
      output: error.stdout?.toString() || ''
    };
  }
}

// Test individual site configuration
function testSiteConfig(siteKey) {
  log(`Testing configuration for ${siteKey}...`, 'test');
  const errors = [];
  
  try {
    // Check if docusaurus.config.ts exists
    const siteDir = siteKey === 'portal' ? 'portal' : `standards/${siteKey}`;
    const configPath = path.join(process.cwd(), siteDir, 'docusaurus.config.ts');
    
    if (!fs.existsSync(configPath)) {
      errors.push(`Configuration file not found: ${configPath}`);
      return { success: false, errors };
    }
    
    // Read and check for required configuration
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Check for future flags
    if (!configContent.includes('future:')) {
      errors.push('Missing "future" configuration block');
    } else if (!configContent.includes('v4: true')) {
      errors.push('Missing or incorrect "v4: true" in future config');
    }
    
    // Check for environment configuration usage
    if (!configContent.includes('getSiteDocusaurusConfig')) {
      errors.push('Not using getSiteDocusaurusConfig for URL configuration');
    }
    
    // Check for getCurrentEnv usage
    if (!configContent.includes('getCurrentEnv')) {
      errors.push('Not using getCurrentEnv for environment detection');
    }
    
    // Validate site is properly registered
    if (siteKey !== 'portal' && !sites[siteKey]) {
      errors.push(`Site "${siteKey}" not found in siteConfigCore`);
    }
    
    // Check site configuration for current environment
    const siteConfig = sites[siteKey]?.[env];
    if (siteKey !== 'portal' && !siteConfig) {
      errors.push(`No configuration found for environment "${env}"`);
    }
    
    if (siteConfig) {
      // Validate URL configuration
      if (!siteConfig.url) {
        errors.push('Missing URL in site configuration');
      }
      if (!siteConfig.baseUrl) {
        errors.push('Missing baseUrl in site configuration');
      }
      
      // Check for localhost URLs in non-localhost environments
      if (env !== 'localhost' && siteConfig.url?.includes('localhost')) {
        errors.push(`Localhost URL found in ${env} configuration: ${siteConfig.url}`);
      }
    }
    
    return { success: errors.length === 0, errors };
  } catch (error) {
    errors.push(`Configuration test failed: ${error.message}`);
    return { success: false, errors };
  }
}

// Build a site
function buildSite(siteKey) {
  log(`Building ${siteKey} for ${env} environment...`, 'test');
  
  const siteDir = siteKey === 'portal' ? 'portal' : `standards/${siteKey}`;
  const buildPath = path.join(process.cwd(), siteDir);
  
  // Set environment variable
  process.env.DOCS_ENV = env;
  
  // Clean previous build
  const cleanResult = execCommand('rm -rf build', buildPath);
  if (!cleanResult.success) {
    return { 
      success: false, 
      error: `Failed to clean build directory: ${cleanResult.error}` 
    };
  }
  
  // Run the build
  let buildCommand;
  if (siteKey === 'portal') {
    buildCommand = 'pnpm build:portal';
  } else {
    // For standards sites, use the specific build command
    const siteKeyLower = siteKey.toLowerCase();
    buildCommand = `pnpm build:${siteKeyLower}`;
  }
  
  // All builds run from root directory
  const buildResult = execCommand(buildCommand, process.cwd());
  
  if (!buildResult.success) {
    return { 
      success: false, 
      error: `Build failed: ${buildResult.error}` 
    };
  }
  
  // Verify build output exists
  const buildOutputPath = path.join(buildPath, 'build');
  if (!fs.existsSync(buildOutputPath)) {
    return { 
      success: false, 
      error: 'Build directory not created' 
    };
  }
  
  // Check for sitemap
  const sitemapPath = path.join(buildOutputPath, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    return { 
      success: false, 
      error: 'Sitemap not generated' 
    };
  }
  
  // Validate sitemap URLs match expected environment
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  const siteConfig = sites[siteKey]?.[env];
  
  if (siteConfig) {
    const expectedUrlPrefix = `${siteConfig.url}${siteConfig.baseUrl}`;
    if (!sitemapContent.includes(expectedUrlPrefix)) {
      return { 
        success: false, 
        error: `Sitemap doesn't contain expected URL prefix: ${expectedUrlPrefix}` 
      };
    }
    
    // Check for incorrect URLs
    if (env !== 'localhost' && sitemapContent.includes('localhost')) {
      return { 
        success: false, 
        error: 'Sitemap contains localhost URLs in non-localhost build' 
      };
    }
  }
  
  return { success: true };
}

// Test a single site
function testSite(siteKey) {
  logSection(`Testing ${siteKey}`);
  
  const testResults = {
    config: null,
    build: null
  };
  
  // Test configuration
  testResults.config = testSiteConfig(siteKey);
  if (testResults.config.success) {
    log('Configuration tests passed', 'success');
  } else {
    log('Configuration tests failed:', 'error');
    testResults.config.errors.forEach(err => log(`  - ${err}`, 'error'));
  }
  
  // Test build (unless skipped)
  if (!skipBuild) {
    testResults.build = buildSite(siteKey);
    if (testResults.build.success) {
      log('Build tests passed', 'success');
    } else {
      log(`Build tests failed: ${testResults.build.error}`, 'error');
    }
  } else {
    log('Skipping build test', 'warning');
    testResults.build = { success: true, skipped: true };
  }
  
  // Overall result
  const passed = testResults.config.success && testResults.build.success;
  
  if (passed) {
    results.passed.push(siteKey);
    log(`${siteKey} passed all tests`, 'success');
  } else {
    results.failed.push(siteKey);
    results.errors.push({
      site: siteKey,
      config: testResults.config,
      build: testResults.build
    });
  }
  
  return passed;
}

// Main execution
async function main() {
  logSection('IFLA Standards Site Regression Testing');
  
  // Validate environment
  if (!validEnvironments.includes(env)) {
    log(`Invalid environment: ${env}`, 'error');
    log(`Valid environments: ${validEnvironments.join(', ')}`, 'info');
    process.exit(1);
  }
  
  log(`Testing against environment: ${env}`, 'info');
  if (skipBuild) {
    log('Build step will be skipped', 'warning');
  }
  
  // Determine which sites to test
  let sitesToTest = [];
  
  if (!siteOption || siteOption === 'all') {
    sitesToTest = validSites;
  } else if (validSites.includes(siteOption)) {
    sitesToTest = [siteOption];
  } else {
    log(`Invalid site: ${siteOption}`, 'error');
    log(`Valid sites: ${validSites.join(', ')}, all`, 'info');
    process.exit(1);
  }
  
  log(`Sites to test: ${sitesToTest.join(', ')}`, 'info');
  
  // Test each site
  for (const site of sitesToTest) {
    testSite(site);
  }
  
  // Summary
  logSection('Test Summary');
  
  log(`Total sites tested: ${sitesToTest.length}`, 'info');
  log(`Passed: ${results.passed.length}`, 'success');
  log(`Failed: ${results.failed.length}`, results.failed.length > 0 ? 'error' : 'success');
  
  if (results.passed.length > 0) {
    log('\nPassed sites:', 'success');
    results.passed.forEach(site => log(`  ✓ ${site}`, 'success'));
  }
  
  if (results.failed.length > 0) {
    log('\nFailed sites:', 'error');
    results.failed.forEach(site => log(`  ✗ ${site}`, 'error'));
    
    log('\nError details:', 'error');
    results.errors.forEach(({ site, config, build }) => {
      log(`\n${site}:`, 'error');
      if (!config.success) {
        log('  Configuration errors:', 'error');
        config.errors.forEach(err => log(`    - ${err}`, 'error'));
      }
      if (!build.success && !build.skipped) {
        log(`  Build error: ${build.error}`, 'error');
      }
    });
  }
  
  // Exit with appropriate code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run tests
main().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});