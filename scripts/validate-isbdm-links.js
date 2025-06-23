#!/usr/bin/env node

const puppeteer = require('puppeteer');
const { getCurrentEnv } = require('../packages/theme/dist/config/siteConfig.server');
const { createSiteConfigFromEnv } = require('./utils/site-config-utils.js');
const { sites } = createSiteConfigFromEnv();

/**
 * ISBDM-specific link validation that ignores generated element links
 * but catches critical navigation and theme-level broken links.
 */

const ISBDM_IGNORE_PATTERNS = [
  // Generated element links that can't be validated until after build
  /\/docs\/elements\/\d+/,
  /\/docs\/attributes\/\d+/,
  /\/docs\/statements\/\d+/,
  /\/docs\/notes\/\d+/,
  /\/docs\/relationships\/\d+/,
  /\/vocabulary\/\d+/,
  /\.mdx#\w+/,
  // Generated vocabulary links
  /\/csv\/\w+/,
  /\/rdf\/\w+/
];

const CRITICAL_SELECTORS = [
  'nav[class*="navbar"] a[href]',
  'footer a[href]', 
  '[class*="dropdown"] a[href]',
  '[class*="standards"] a[href]'
];

async function validateISBDMLinks() {
  console.log('\n🔍 Validating ISBDM navigation links (ignoring generated content)...');
  
  // Verify ISBDM exists in central configuration
  if (!sites.ISBDM) {
    console.error('❌ ISBDM not found in central site configuration');
    process.exit(1);
  }
  
  const env = getCurrentEnv();
  const config = getSiteDocusaurusConfig('ISBDM', env);
  const baseUrl = `${config.url}${config.baseUrl}`;
  
  console.log(`📍 Environment: ${env}`);
  console.log(`🌐 Base URL: ${baseUrl}`);
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('📄 Loading ISBDM homepage...');
    await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Extract navigation links
    const links = await page.evaluate((selectors) => {
      const found = [];
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          const href = el.getAttribute('href');
          if (href) {
            found.push({
              href,
              text: el.textContent?.trim() || '',
              selector
            });
          }
        });
      });
      return found;
    }, CRITICAL_SELECTORS);
    
    // Filter out generated links
    const criticalLinks = links.filter(link => 
      !ISBDM_IGNORE_PATTERNS.some(pattern => pattern.test(link.href))
    );
    
    console.log(`🔗 Found ${links.length} total links, ${criticalLinks.length} critical navigation links`);
    
    // Test internal navigation links
    const brokenLinks = [];
    for (const link of criticalLinks) {
      if (link.href.startsWith('/') || link.href.includes(config.url)) {
        try {
          const testUrl = link.href.startsWith('http') ? link.href : `${config.url}${config.baseUrl}${link.href.replace(/^\//, '')}`;
          console.log(`  Testing: "${link.text}" -> ${testUrl}`);
          
          const response = await page.goto(testUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
          
          if (!response || response.status() >= 400) {
            brokenLinks.push({ ...link, status: response?.status(), testUrl });
          }
          
        } catch (error) {
          brokenLinks.push({ ...link, error: error.message });
        }
      }
    }
    
    if (brokenLinks.length > 0) {
      console.error(`\n❌ Found ${brokenLinks.length} broken navigation links in ISBDM:`);
      brokenLinks.forEach(link => {
        console.error(`  ❌ "${link.text}" -> ${link.href}`);
        if (link.error) console.error(`     Error: ${link.error}`);
        if (link.status) console.error(`     Status: ${link.status}`);
      });
      process.exit(1);
    } else {
      console.log('\n✅ All ISBDM navigation links are working!');
    }
    
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  validateISBDMLinks().catch(error => {
    console.error('❌ ISBDM link validation failed:', error);
    process.exit(1);
  });
}

module.exports = { validateISBDMLinks };