#!/usr/bin/env node

const { execSync } = require('child_process');
const { program } = require('commander');
const inquirer = require('inquirer').default;
const puppeteer = require('puppeteer');
const { getCurrentEnv } = require('../packages/theme/dist/config/siteConfig.server');
const { createSiteConfigFromEnv } = require('./utils/site-config-utils.js');
const { sites } = createSiteConfigFromEnv();

// Get valid sites from central configuration (excluding github)
const validSites = Object.keys(sites).filter(site => site !== 'github').map(site => site.toLowerCase());

// Site-specific ignore patterns - automatically includes all sites from central config
const SITE_SPECIFIC_IGNORE_PATTERNS = {
  isbdm: [
    /\/docs\/elements\/\d+/,
    /\/docs\/attributes\/\d+/,
    /\/docs\/statements\/\d+/,
    /\/docs\/notes\/\d+/,
    /\/docs\/relationships\/\d+/,
    /\/vocabulary\/\d+/,
    /\.mdx#\w+/
  ],
  lrm: [
    /\/docs\/elements\/\d+/,
    /\/vocabulary\/\d+/
  ]
  // Other sites default to checking all links (empty array)
};

// Generate ignore patterns for all sites, defaulting to empty arrays for new sites
const IGNORE_PATTERNS = {};
Object.keys(sites).forEach(siteKey => {
  if (siteKey !== 'github') {
    IGNORE_PATTERNS[siteKey.toLowerCase()] = SITE_SPECIFIC_IGNORE_PATTERNS[siteKey.toLowerCase()] || [];
  }
});

program
  .option('--site <site>', 'Site to validate links for')
  .option('--timeout <ms>', 'Timeout per link in milliseconds', '10000')
  .option('--max-links <number>', 'Maximum number of links to test', '50')
  .parse(process.argv);

async function validateSiteLinks(siteKey, options = {}) {
  const timeout = parseInt(options.timeout) || 10000;
  const maxLinks = parseInt(options.maxLinks) || 50;
  
  console.log(`\n🔍 Validating links for ${siteKey.toUpperCase()}...`);
  
  const env = getCurrentEnv();
  const config = getSiteDocusaurusConfig(siteKey.toUpperCase(), env);
  const baseUrl = `${config.url}${config.baseUrl}`;
  
  console.log(`📍 Environment: ${env}`);
  console.log(`🌐 Base URL: ${baseUrl}`);
  console.log(`⏱️  Timeout: ${timeout}ms per link`);
  console.log(`🔢 Max links: ${maxLinks}`);
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('📄 Loading site homepage...');
    await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Extract all internal links
    const allLinks = await page.evaluate(() => {
      const links = [];
      document.querySelectorAll('a[href]').forEach(el => {
        const href = el.getAttribute('href');
        if (href && (href.startsWith('/') || href.includes(window.location.hostname))) {
          links.push({
            href,
            text: el.textContent?.trim() || '',
            tagName: el.tagName,
            className: el.className,
            isNavigation: el.closest('nav, footer, [class*="dropdown"]') !== null
          });
        }
      });
      return links;
    });
    
    // Apply site-specific ignore patterns
    const ignorePatterns = IGNORE_PATTERNS[siteKey.toLowerCase()] || [];
    const linksToTest = allLinks.filter(link => 
      !ignorePatterns.some(pattern => pattern.test(link.href))
    );
    
    // Prioritize navigation links and limit total
    const navigationLinks = linksToTest.filter(link => link.isNavigation);
    const otherLinks = linksToTest.filter(link => !link.isNavigation);
    const finalLinks = [...navigationLinks, ...otherLinks].slice(0, maxLinks);
    
    console.log(`🔗 Found ${allLinks.length} total links, testing ${finalLinks.length} (${navigationLinks.length} navigation + ${finalLinks.length - navigationLinks.length} content)`);
    
    // Test links
    const results = {
      tested: 0,
      passed: 0,
      failed: 0,
      broken: []
    };
    
    for (const link of finalLinks) {
      try {
        const testUrl = link.href.startsWith('http') ? link.href : 
                       `${config.url}${config.baseUrl}${link.href.replace(/^\//, '')}`;
        
        console.log(`  [${results.tested + 1}/${finalLinks.length}] Testing: "${link.text.substring(0, 30)}..." -> ${link.href}`);
        
        const response = await page.goto(testUrl, { 
          waitUntil: 'domcontentloaded', 
          timeout 
        });
        
        results.tested++;
        
        if (!response || response.status() >= 400) {
          results.failed++;
          results.broken.push({ 
            ...link, 
            status: response?.status(), 
            testUrl,
            priority: link.isNavigation ? 'HIGH' : 'LOW'
          });
        } else {
          results.passed++;
        }
        
      } catch (error) {
        results.tested++;
        results.failed++;
        results.broken.push({ 
          ...link, 
          error: error.message,
          priority: link.isNavigation ? 'HIGH' : 'LOW'
        });
      }
    }
    
    // Report results
    console.log(`\n📊 Link Validation Results for ${siteKey.toUpperCase()}:`);
    console.log(`   ✅ Passed: ${results.passed}`);
    console.log(`   ❌ Failed: ${results.failed}`);
    console.log(`   📈 Total: ${results.tested}`);
    
    if (results.broken.length > 0) {
      console.error(`\n❌ Broken Links Found:`);
      
      // Show high priority (navigation) issues first
      const highPriority = results.broken.filter(link => link.priority === 'HIGH');
      const lowPriority = results.broken.filter(link => link.priority === 'LOW');
      
      if (highPriority.length > 0) {
        console.error(`\n🚨 HIGH PRIORITY (Navigation Issues):`);
        highPriority.forEach((link, i) => {
          console.error(`  ${i + 1}. "${link.text}" -> ${link.href}`);
          if (link.error) console.error(`     Error: ${link.error}`);
          if (link.status) console.error(`     Status: ${link.status}`);
        });
      }
      
      if (lowPriority.length > 0) {
        console.error(`\n⚠️  LOW PRIORITY (Content Links):`);
        lowPriority.forEach((link, i) => {
          console.error(`  ${i + 1}. "${link.text}" -> ${link.href}`);
          if (link.error) console.error(`     Error: ${link.error}`);
          if (link.status) console.error(`     Status: ${link.status}`);
        });
      }
      
      // Exit with error if high priority issues found
      if (highPriority.length > 0) {
        console.error(`\n💥 Build should fail due to ${highPriority.length} navigation issues`);
        process.exit(1);
      } else {
        console.warn(`\n⚠️  Warning: ${lowPriority.length} content link issues found`);
      }
    } else {
      console.log('\n✅ All tested links are working!');
    }
    
  } finally {
    await browser.close();
  }
}

async function main() {
  const options = program.opts();
  let { site } = options;

  // If no site provided, ask user to select
  if (!site) {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'site',
        message: 'Select site to validate links for:',
        choices: validSites,
        default: 'portal'
      }
    ]);
    site = answer.site;
  }

  // Validate site
  if (!validSites.includes(site.toLowerCase())) {
    console.error(`Invalid site: ${site}. Must be one of: ${validSites.join(', ')}`);
    process.exit(1);
  }

  await validateSiteLinks(site.toLowerCase(), options);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Link validation failed:', error);
    process.exit(1);
  });
}

module.exports = { validateSiteLinks };