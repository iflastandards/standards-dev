#!/usr/bin/env node

/**
 * Build Validation Script for IFLA Standards
 * 
 * This script analyzes build output for broken links and determines whether
 * they represent expected issues (legitimate broken links) or configuration 
 * problems that should fail the build.
 * 
 * Usage:
 *   node scripts/validate-build-warnings.js --site FRBR --build-output "build-output.txt"
 *   node scripts/validate-build-warnings.js --validate-all
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load validation configuration
const configPath = path.join(__dirname, 'validate-builds.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

/**
 * Parse broken links from Docusaurus build output
 * @param {string} buildOutput - Raw build output text
 * @returns {Array} Array of broken link objects
 */
function parseBrokenLinks(buildOutput) {
  const brokenLinks = [];
  const lines = buildOutput.split('\n');
  
  let inBrokenLinksSection = false;
  let currentSourcePage = null;
  
  for (const line of lines) {
    // Detect start of broken links section
    if (line.includes('Docusaurus found broken links!')) {
      inBrokenLinksSection = true;
      continue;
    }
    
    // Detect end of broken links section
    if (inBrokenLinksSection && line.includes('Generated static files')) {
      break;
    }
    
    if (inBrokenLinksSection) {
      // Parse source page
      const sourcePageMatch = line.match(/- Broken link on source page path = (.+):/);
      if (sourcePageMatch) {
        currentSourcePage = sourcePageMatch[1];
        continue;
      }
      
      // Parse broken link target
      const linkMatch = line.match(/   -> linking to (.+)/);
      if (linkMatch && currentSourcePage) {
        brokenLinks.push({
          sourcePage: currentSourcePage,
          brokenLink: linkMatch[1],
          rawLine: line.trim()
        });
      }
    }
  }
  
  return brokenLinks;
}

/**
 * Check if a broken link matches any allowed pattern
 * @param {string} link - The broken link
 * @param {Array} allowedPatterns - Array of allowed patterns (with * wildcards)
 * @returns {boolean}
 */
function isLinkAllowed(link, allowedPatterns) {
  return allowedPatterns.some(pattern => {
    // Convert glob-like pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\//g, '\\/');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(link);
  });
}

/**
 * Check if a broken link represents cross-site navigation
 * @param {string} link - The broken link
 * @param {string} currentSite - Current site being built
 * @param {Array} allowedCrossSites - Array of allowed cross-site targets
 * @returns {boolean}
 */
function isCrossSiteNavigation(link, currentSite, allowedCrossSites) {
  // Extract site from link (e.g., "/FRBR/docs" -> "FRBR")
  const linkSiteMatch = link.match(/^\/([^\/]+)/);
  if (!linkSiteMatch) return false;
  
  const linkSite = linkSiteMatch[1];
  
  // Don't consider self-links as cross-site
  if (linkSite === currentSite) return false;
  
  // Check if this site is in allowed cross-site navigation
  return allowedCrossSites.includes(linkSite);
}

/**
 * Validate broken links for a specific site
 * @param {string} siteName - Name of the site
 * @param {Array} brokenLinks - Array of broken link objects
 * @returns {Object} Validation result
 */
function validateSiteBrokenLinks(siteName, brokenLinks) {
  const siteConfig = config.sites[siteName];
  if (!siteConfig) {
    return {
      success: false,
      error: `No validation configuration found for site: ${siteName}`
    };
  }
  
  const failures = [];
  const allowedLinks = [];
  const warnings = [];
  
  for (const brokenLink of brokenLinks) {
    const { brokenLink: link, sourcePage } = brokenLink;
    
    // Check if link is explicitly allowed
    if (isLinkAllowed(link, siteConfig.allowedBrokenLinks || [])) {
      allowedLinks.push(brokenLink);
      continue;
    }
    
    // Check if link is cross-site navigation
    if (isCrossSiteNavigation(link, siteName, siteConfig.crossSiteNavigation || [])) {
      allowedLinks.push(brokenLink);
      continue;
    }
    
    // Check if link should cause failure
    if (isLinkAllowed(link, siteConfig.failOnBrokenLinks || [])) {
      failures.push({
        ...brokenLink,
        reason: `Link matches failure pattern: ${link}`
      });
      continue;
    }
    
    // Unexpected broken link - add as warning for review
    warnings.push({
      ...brokenLink,
      reason: `Unexpected broken link that may indicate configuration issue: ${link}`
    });
  }
  
  return {
    success: failures.length === 0,
    siteName,
    totalBrokenLinks: brokenLinks.length,
    allowedLinks: allowedLinks.length,
    warnings: warnings.length,
    failures: failures.length,
    failureDetails: failures,
    warningDetails: warnings.slice(0, 5), // Limit warnings in output
  };
}

/**
 * Build a single site and capture output
 * @param {string} siteName - Name of the site to build
 * @returns {Object} Build result with output
 */
function buildSite(siteName) {
  console.log(`Building site: ${siteName}...`);
  const buildCommand = `pnpm build:${siteName.toLowerCase()} 2>&1`; // Redirect stderr to stdout
  
  try {
    const output = execSync(buildCommand, { 
      encoding: 'utf8',
      cwd: path.join(__dirname, '..'),
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer for large outputs
    });
    
    return {
      success: true,
      output: output,
      siteName
    };
  } catch (error) {
    // Even if exit code is non-zero, the output might contain our warnings
    const output = error.stdout || error.message;
    
    // Check if this was actually a successful build with warnings
    if (output.includes('Generated static files')) {
      return {
        success: true,
        output: output,
        siteName
      };
    } else {
      return {
        success: false,
        output: output,
        error: error.message,
        siteName
      };
    }
  }
}

/**
 * Validate all sites
 */
function validateAllSites() {
  const sites = Object.keys(config.sites);
  const results = [];
  
  console.log(`🔍 Validating builds for ${sites.length} sites...\n`);
  
  for (const siteName of sites) {
    console.log(`\n📦 Building and validating ${siteName}...`);
    
    // Build the site
    const buildResult = buildSite(siteName);
    
    // Parse broken links from output
    const brokenLinks = parseBrokenLinks(buildResult.output);
    
    // Validate the broken links
    const validation = validateSiteBrokenLinks(siteName, brokenLinks);
    
    results.push({
      ...validation,
      buildSuccess: buildResult.success,
      buildError: buildResult.error
    });
    
    // Print immediate feedback
    if (validation.success) {
      console.log(`✅ ${siteName}: ${validation.totalBrokenLinks} broken links (${validation.allowedLinks} allowed, ${validation.warnings} warnings)`);
    } else {
      console.log(`❌ ${siteName}: ${validation.failures} critical failures found`);
    }
  }
  
  // Print summary
  console.log(`\n📊 Validation Summary:`);
  console.log(`=====================================`);
  
  let overallSuccess = true;
  let totalFailures = 0;
  
  for (const result of results) {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.siteName}: ${result.totalBrokenLinks} links (${result.failures} failures)`);
    
    if (!result.success) {
      overallSuccess = false;
      totalFailures += result.failures;
      
      // Show failure details
      console.log(`   Failure details:`);
      for (const failure of result.failureDetails.slice(0, 3)) {
        console.log(`   - ${failure.brokenLink} (${failure.reason})`);
      }
      if (result.failureDetails.length > 3) {
        console.log(`   - ... and ${result.failureDetails.length - 3} more`);
      }
    }
  }
  
  console.log(`\n🎯 Overall Result: ${overallSuccess ? 'PASS' : 'FAIL'}`);
  if (!overallSuccess) {
    console.log(`💥 Found ${totalFailures} critical configuration issues that should be fixed.`);
    process.exit(1);
  } else {
    console.log(`🎉 All sites passed validation!`);
  }
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--validate-all')) {
    validateAllSites();
    return;
  }
  
  // Parse individual site validation
  const siteIndex = args.indexOf('--site');
  const outputIndex = args.indexOf('--build-output');
  
  if (siteIndex === -1 || outputIndex === -1) {
    console.error(`Usage: 
  ${process.argv[1]} --validate-all
  ${process.argv[1]} --site SITENAME --build-output "output.txt"`);
    process.exit(1);
  }
  
  const siteName = args[siteIndex + 1];
  const buildOutput = args[outputIndex + 1];
  
  if (!siteName || !buildOutput) {
    console.error('Error: --site and --build-output are required');
    process.exit(1);
  }
  
  // Parse broken links and validate
  const brokenLinks = parseBrokenLinks(buildOutput);
  const result = validateSiteBrokenLinks(siteName, brokenLinks);
  
  console.log(JSON.stringify(result, null, 2));
  
  if (!result.success) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  parseBrokenLinks,
  validateSiteBrokenLinks,
  isLinkAllowed,
  isCrossSiteNavigation
};