#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer').default;
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { createSiteConfigFromEnv } = require('./utils/site-config-utils.js');
const { sites, DocsEnv } = createSiteConfigFromEnv();

const validSites = Object.keys(sites).filter(site => site !== 'github');
const validEnvironments = Object.values(DocsEnv);

program
  .option('--env <env>', 'Environment to validate (local, preview, production)')
  .option('--site <site>', 'Site to validate (specific site or "all")')
  .option('--type <type>', 'Type of validation: "static" (nav/footer), "generated" (all links), "sitemap", "comprehensive", or "both"', 'both')
  .option('--depth <number>', 'Crawl depth: 0=homepage only, 1=homepage+direct links, 2=2 levels deep, etc.', '0')
  .option('--sample-size <number>', 'Number of generated links to test (for non-local)', '10')
  .option('--timeout <ms>', 'Timeout per link in milliseconds', '15000')
  .parse();

// Normalize and validate type option
const validTypes = ['static', 'generated', 'sitemap', 'comprehensive', 'both'];
const rawType = program.opts().type;
let normalizedType = rawType;

// Handle common typos
if (rawType === 'comprehensivet') {
  console.log(`⚠️  Detected typo in type 'comprehensivet', treating as 'comprehensive'`);
  normalizedType = 'comprehensive';
}

if (!validTypes.includes(normalizedType)) {
  console.error(`❌ Invalid validation type: ${rawType}`);
  console.error(`Valid types: ${validTypes.join(', ')}`);
  process.exit(1);
}

// Update program options
program.opts().type = normalizedType;

// Hardcoded localhost patterns to detect
const LOCALHOST_PATTERNS = [
  /http:\/\/localhost:\d+/,
  /http:\/\/127\.0\.0\.1:\d+/,
  /\/\/localhost:\d+/
];

// Check if a URL is valid for the given environment by matching against all site configs
function isValidEnvironmentUrl(url, environment) {
  // Get all site configs for this environment
  const allSiteConfigs = Object.values(sites).map(siteConfig => siteConfig[environment]).filter(Boolean);
  
  // Check if URL matches any of the expected base URLs for this environment
  return allSiteConfigs.some(config => {
    const expectedBaseUrl = `${config.url}${config.baseUrl}`;
    return url.startsWith(expectedBaseUrl) || url.startsWith(config.url);
  });
}

// Extract all valid pages from the build directory
function extractPagesFromBuild(siteKey, baseUrl) {
  const path = require('path');
  const fs = require('fs');
  const glob = require('glob');
  
  const siteDir = siteKey.toLowerCase() === 'portal' ? 'portal' : `standards/${siteKey}`;
  const buildPath = path.join(process.cwd(), siteDir, 'build');
  
  if (!fs.existsSync(buildPath)) {
    console.warn(`⚠️  Build directory not found: ${buildPath}`);
    return [];
  }
  
  // Find all index.html files in the build directory
  const htmlFiles = glob.sync('**/index.html', { cwd: buildPath });
  
  // Convert file paths to URLs
  const validPages = htmlFiles.map(file => {
    // Remove /index.html and convert to URL
    const urlPath = file.replace('/index.html', '/').replace('index.html', '');
    return `${baseUrl}${urlPath}`;
  });
  
  // Add root pages that might not follow the index.html pattern
  const rootFiles = glob.sync('*.html', { cwd: buildPath })
    .filter(file => file !== 'index.html' && file !== '404.html')
    .map(file => `${baseUrl}${file.replace('.html', '/')}`);
  
  const allPages = [...validPages, ...rootFiles];
  
  console.log(`📁 Found ${allPages.length} pages in build directory`);
  return allPages;
}

// Get all URLs from sitemap
function getSitemapUrls(siteKey, baseUrl) {
  const path = require('path');
  const fs = require('fs');
  const xml2js = require('xml2js');
  
  const siteDir = siteKey.toLowerCase() === 'portal' ? 'portal' : `standards/${siteKey}`;
  const buildPath = path.join(process.cwd(), siteDir, 'build');
  const sitemapPath = path.join(buildPath, 'sitemap.xml');
  
  if (!fs.existsSync(sitemapPath)) {
    console.error(`❌ Sitemap not found: ${sitemapPath}`);
    return [];
  }
  
  try {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    const parser = new xml2js.Parser();
    
    return new Promise((resolve, reject) => {
      parser.parseString(sitemapContent, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        
        const urls = result?.urlset?.url || [];
        const sitemapUrls = urls.map(url => url.loc[0]);
        resolve(sitemapUrls);
      });
    });
  } catch (error) {
    console.error(`❌ Error reading sitemap: ${error.message}`);
    return [];
  }
}

// Extract links from main content area of a page
async function extractMainContentLinks(page, baseUrl) {
  return await page.evaluate((baseUrl) => {
    const links = [];
    const debug = {
      totalAnchors: 0,
      mainFound: false,
      selectors: []
    };
    
    // Try multiple selectors for main content
    const contentSelectors = [
      'main',
      '[role="main"]',
      '.main-wrapper',
      '.theme-doc-markdown',
      '.markdown',
      'article',
      '.docMainContainer',
      '.container.mainContainer',
      '.docsContainer'
    ];
    
    let mainElement = null;
    for (const selector of contentSelectors) {
      mainElement = document.querySelector(selector);
      if (mainElement) {
        debug.mainFound = true;
        debug.selectors.push(selector);
        break;
      }
    }
    
    // If no main element found, search the entire document but exclude navigation
    const elementsToSearch = mainElement ? [mainElement] : [document];
    
    elementsToSearch.forEach(container => {
      const anchors = container.querySelectorAll('a[href]');
      debug.totalAnchors = anchors.length;
      
      anchors.forEach(el => {
        // Skip navigation links if searching entire document
        if (!mainElement && el.closest('nav, header, .navbar, .footer, [class*="sidebar"]')) {
          return;
        }
        
        const href = el.getAttribute('href');
        // Skip placeholder links and empty hrefs
        if (href && href !== '#' && href.trim() !== '') {
          try {
            const fullUrl = href.startsWith('http') ? href :
                           href.startsWith('/') ? new URL(href, baseUrl).href :
                           new URL(href, window.location.href).href;
            
            // Parse anchor from URL
            const url = new URL(fullUrl);
            const anchorId = url.hash ? url.hash.substring(1) : null;
            const urlWithoutAnchor = `${url.origin}${url.pathname}${url.search}`;
            
            links.push({
              href,
              fullUrl,
              urlWithoutAnchor,
              anchorId,
              text: el.textContent?.trim() || '',
              hasAnchor: !!anchorId,
              isInternal: fullUrl.startsWith(baseUrl)
            });
          } catch (error) {
            // Skip malformed URLs
          }
        }
      });
    });
    
    // Log debug info if no links found
    if (links.length === 0 && debug.totalAnchors > 0) {
      console.warn('Debug: Found anchors but no valid links', debug);
    }
    
    return links;
  }, baseUrl);
}

// Get all anchors/IDs on a page
async function extractPageAnchors(page) {
  return await page.evaluate(() => {
    const anchors = new Set();
    
    // Get all elements with IDs
    document.querySelectorAll('[id]').forEach(el => {
      anchors.add(el.id);
    });
    
    // Get all elements with name attributes
    document.querySelectorAll('[name]').forEach(el => {
      const name = el.getAttribute('name');
      if (name) anchors.add(name);
    });
    
    return Array.from(anchors);
  });
}

// Load and save page content cache
function loadPageContentCache(siteKey) {
  const path = require('path');
  const fs = require('fs');
  
  const cacheDir = path.join(process.cwd(), 'output', 'link-validation', siteKey.toLowerCase());
  const cacheFile = path.join(cacheDir, 'content-cache.json');
  
  if (fs.existsSync(cacheFile)) {
    try {
      return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    } catch (error) {
      console.log(`⚠️  Content cache corrupted, starting fresh`);
      return {};
    }
  }
  
  return {};
}

function savePageContentCache(siteKey, cache) {
  const path = require('path');
  const fs = require('fs');
  
  const cacheDir = path.join(process.cwd(), 'output', 'link-validation', siteKey.toLowerCase());
  const cacheFile = path.join(cacheDir, 'content-cache.json');
  
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
}

// Cache sitemap data with checksum
async function getCachedSitemapData(siteKey) {
  const path = require('path');
  const fs = require('fs');
  const crypto = require('crypto');
  
  const siteDir = siteKey.toLowerCase() === 'portal' ? 'portal' : `standards/${siteKey}`;
  const sitemapPath = path.join(process.cwd(), siteDir, 'build', 'sitemap.xml');
  const cacheDir = path.join(process.cwd(), 'output', 'link-validation', siteKey.toLowerCase());
  const cacheFile = path.join(cacheDir, 'sitemap-cache.json');
  
  if (!fs.existsSync(sitemapPath)) {
    return null;
  }
  
  // Calculate current sitemap checksum
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  const currentChecksum = crypto.createHash('md5').update(sitemapContent).digest('hex');
  
  // Check if cache exists and is valid
  if (fs.existsSync(cacheFile)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      if (cached.checksum === currentChecksum) {
        console.log(`📦 Using cached sitemap data (${cached.urls.length} URLs)`);
        return cached.urls;
      } else {
        console.log(`🔄 Sitemap changed, invalidating cache`);
      }
    } catch (error) {
      console.log(`⚠️  Cache corrupted, rebuilding`);
    }
  }
  
  // Parse sitemap and cache it
  const xml2js = require('xml2js');
  const parser = new xml2js.Parser();
  
  return new Promise((resolve, reject) => {
    parser.parseString(sitemapContent, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      
      const urls = result?.urlset?.url || [];
      const sitemapUrls = urls.map(url => url.loc[0]);
      
      // Ensure output directory exists
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      
      // Cache the data
      const cacheData = {
        checksum: currentChecksum,
        timestamp: new Date().toISOString(),
        urls: sitemapUrls
      };
      
      fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
      console.log(`💾 Cached sitemap data (${sitemapUrls.length} URLs)`);
      
      resolve(sitemapUrls);
    });
  });
}

// Generate HTML report
function generateHtmlReport(siteKey, baseUrl, results, pageDetails, environment = 'unknown') {
  const path = require('path');
  const fs = require('fs');
  
  // Create timestamped filename
  const now = new Date();
  const timestamp = now.toISOString();
  const filename = `report-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}.html`;
  
  // Create site-specific directory
  const siteDir = path.join(process.cwd(), 'output', 'link-validation', siteKey.toLowerCase());
  if (!fs.existsSync(siteDir)) {
    fs.mkdirSync(siteDir, { recursive: true });
  }
  
  const reportFile = path.join(siteDir, filename);
  
  // Group broken links by page
  const brokenLinksByPage = new Map();
  
  pageDetails.forEach(page => {
    if (page.brokenLinks && page.brokenLinks.length > 0) {
      brokenLinksByPage.set(page.url, {
        title: page.title,
        url: page.url,
        brokenLinks: page.brokenLinks
      });
    }
  });
  
  // Determine status for color coding
  const hasErrors = results.failed > 0;
  const hasWarnings = results.skippedPages > 0; // If pages were skipped, it's a warning
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Link Validation Report - ${siteKey}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px; 
            line-height: 1.6; 
        }
        .header { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 30px; 
        }
        .stats { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 15px; 
            margin: 20px 0; 
        }
        .stat-card { 
            background: white; 
            border: 1px solid #e1e5e9; 
            border-radius: 6px; 
            padding: 15px; 
            text-align: center; 
        }
        .stat-value { 
            font-size: 2em; 
            font-weight: bold; 
            margin-bottom: 5px; 
        }
        .stat-label { 
            color: #6c757d; 
            font-size: 0.9em; 
        }
        .success { color: #28a745; }
        .warning { color: #ffc107; }
        .danger { color: #dc3545; }
        .page-section { 
            margin: 30px 0; 
            border: 1px solid #e1e5e9; 
            border-radius: 8px; 
        }
        .page-header { 
            background: #f8f9fa; 
            padding: 15px; 
            border-bottom: 1px solid #e1e5e9; 
        }
        .page-title { 
            margin: 0 0 5px 0; 
            font-size: 1.2em; 
        }
        .page-url { 
            color: #6c757d; 
            font-size: 0.9em; 
            word-break: break-all; 
        }
        .page-url a { 
            color: #007bff; 
            text-decoration: none; 
        }
        .page-url a:hover { 
            text-decoration: underline; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 0; 
        }
        th, td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #e1e5e9; 
        }
        th { 
            background: #f8f9fa; 
            font-weight: 600; 
        }
        .broken-link { 
            color: #dc3545; 
            font-family: 'Monaco', 'Menlo', monospace; 
            font-size: 0.9em; 
            word-break: break-all; 
        }
        .link-text { 
            color: #495057; 
            font-style: italic; 
        }
        .no-issues { 
            text-align: center; 
            padding: 40px; 
            color: #28a745; 
            font-size: 1.1em; 
        }
        .timestamp { 
            color: #6c757d; 
            font-size: 0.9em; 
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Link Validation Report</h1>
        <p><strong>Site:</strong> ${siteKey} (<code>${baseUrl}</code>)</p>
        <p><strong>Environment:</strong> ${environment}</p>
        <p class="timestamp"><strong>Generated:</strong> ${timestamp}</p>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-value success">${results.passed}</div>
            <div class="stat-label">Valid Links</div>
        </div>
        <div class="stat-card">
            <div class="stat-value danger">${results.failed}</div>
            <div class="stat-label">Broken Links</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${results.tested}</div>
            <div class="stat-label">Total Links</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${pageDetails.length}</div>
            <div class="stat-label">Pages Checked</div>
        </div>
        ${results.skippedPages !== undefined ? `
        <div class="stat-card">
            <div class="stat-value warning">${results.skippedPages}</div>
            <div class="stat-label">Cached Pages</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${results.changedPages || 0}</div>
            <div class="stat-label">Changed Pages</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${results.newPages || 0}</div>
            <div class="stat-label">New Pages</div>
        </div>
        ` : ''}
    </div>

    ${brokenLinksByPage.size === 0 ? `
    <div class="no-issues">
        <h2>🎉 No Broken Links Found!</h2>
        <p>All internal links are working correctly.</p>
    </div>
    ` : `
    <h2>Pages with Broken Links (${brokenLinksByPage.size})</h2>
    
    ${Array.from(brokenLinksByPage.values()).map(page => `
    <div class="page-section">
        <div class="page-header">
            <h3 class="page-title">${page.title}</h3>
            <div class="page-url"><a href="${page.url}" target="_blank">${page.url}</a></div>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Broken Link</th>
                    <th>Link Text</th>
                    <th>Issue Type</th>
                </tr>
            </thead>
            <tbody>
                ${page.brokenLinks.map(link => `
                <tr>
                    <td class="broken-link">${link.url}</td>
                    <td class="link-text">${link.text || '<em>No text</em>'}</td>
                    <td><span class="danger">${link.type}</span></td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    `).join('')}
    `}

    <div class="footer" style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e1e5e9;">
        <p class="timestamp">Report generated by IFLA Standards Link Validator on ${timestamp}</p>
    </div>
</body>
</html>`;

  fs.writeFileSync(reportFile, html);
  console.log(`📄 HTML report saved: ${reportFile}`);
  
  // Update the index
  updateValidationIndex(siteKey, filename, results, environment, timestamp);
  
  return reportFile;
}

// Update the validation index file
function updateValidationIndex(siteKey, reportFilename, results, environment, timestamp) {
  const path = require('path');
  const fs = require('fs');
  
  const validationDir = path.join(process.cwd(), 'output', 'link-validation');
  const indexFile = path.join(validationDir, 'index.html');
  
  // Ensure the validation directory exists
  if (!fs.existsSync(validationDir)) {
    fs.mkdirSync(validationDir, { recursive: true });
  }
  
  // Load existing index data or create new
  let indexData = {};
  const indexDataFile = path.join(validationDir, 'index-data.json');
  
  if (fs.existsSync(indexDataFile)) {
    try {
      indexData = JSON.parse(fs.readFileSync(indexDataFile, 'utf8'));
    } catch (error) {
      console.log('⚠️  Index data corrupted, recreating');
      indexData = {};
    }
  }
  
  // Add this run to the index data
  if (!indexData[siteKey]) {
    indexData[siteKey] = [];
  }
  
  // Determine status for color coding
  let status = 'success';
  if (results.failed > 0) {
    status = 'danger';
  } else if (results.skippedPages > 0) {
    status = 'warning';
  }
  
  const runData = {
    filename: reportFilename,
    timestamp,
    environment,
    tested: results.tested,
    passed: results.passed,
    failed: results.failed,
    status,
    skippedPages: results.skippedPages || 0,
    changedPages: results.changedPages || 0,
    newPages: results.newPages || 0
  };
  
  // Add to front of array (newest first)
  indexData[siteKey].unshift(runData);
  
  // Keep only last 20 runs per site
  indexData[siteKey] = indexData[siteKey].slice(0, 20);
  
  // Save updated index data
  fs.writeFileSync(indexDataFile, JSON.stringify(indexData, null, 2));
  
  // Also generate JavaScript version for direct HTML inclusion
  const indexJsFile = path.join(validationDir, 'index-data.js');
  const jsContent = `// Auto-generated validation report data
window.validationReports = ${JSON.stringify(indexData, null, 2)};`;
  fs.writeFileSync(indexJsFile, jsContent);
  
  console.log(`📋 Updated validation index data: ${indexDataFile}`);
}

// Generate the HTML index file
function generateValidationIndexHtml(indexData, validationDir) {
  const path = require('path');
  const fs = require('fs');
  
  const allSites = ['portal', 'isbdm', 'lrm', 'FRBR', 'isbd', 'muldicat', 'unimarc'];
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Link Validation Reports - IFLA Standards</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            max-width: 1400px; 
            margin: 0 auto; 
            padding: 20px; 
            line-height: 1.6; 
            background: #f8f9fa;
        }
        .header { 
            background: white; 
            padding: 30px; 
            border-radius: 12px; 
            margin-bottom: 30px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .site-section { 
            background: white; 
            margin: 20px 0; 
            border-radius: 12px; 
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .site-header { 
            background: #e9ecef; 
            padding: 20px; 
            border-bottom: 1px solid #dee2e6; 
        }
        .site-title { 
            margin: 0; 
            font-size: 1.5em; 
            text-transform: uppercase;
            color: #495057;
        }
        .reports-table { 
            width: 100%; 
            border-collapse: collapse; 
        }
        .reports-table th, .reports-table td { 
            padding: 12px 20px; 
            text-align: left; 
            border-bottom: 1px solid #e9ecef; 
        }
        .reports-table th { 
            background: #f8f9fa; 
            font-weight: 600; 
            color: #495057;
        }
        .reports-table tr:hover { 
            background: #f8f9fa; 
        }
        .status-badge { 
            display: inline-block; 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 0.8em; 
            font-weight: 600; 
            text-transform: uppercase;
        }
        .status-success { 
            background: #d4edda; 
            color: #155724; 
        }
        .status-warning { 
            background: #fff3cd; 
            color: #856404; 
        }
        .status-danger { 
            background: #f8d7da; 
            color: #721c24; 
        }
        .report-link { 
            color: #007bff; 
            text-decoration: none; 
            font-weight: 500;
        }
        .report-link:hover { 
            text-decoration: underline; 
        }
        .no-reports { 
            padding: 40px; 
            text-align: center; 
            color: #6c757d; 
            font-style: italic;
        }
        .timestamp { 
            color: #6c757d; 
            font-size: 0.9em; 
            font-family: 'Monaco', 'Menlo', monospace;
        }
        .stats { 
            font-size: 0.9em; 
            color: #6c757d; 
        }
        .environment { 
            display: inline-block; 
            padding: 2px 6px; 
            border-radius: 3px; 
            font-size: 0.8em; 
            background: #e9ecef; 
            color: #495057;
        }
        .updated { 
            color: #6c757d; 
            font-size: 0.9em; 
            text-align: center; 
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔗 Link Validation Reports</h1>
        <p>Comprehensive link validation reports for all IFLA Standards sites. Latest runs are shown first.</p>
    </div>

    ${allSites.map(site => {
      const siteData = indexData[site] || [];
      const displayName = site === 'portal' ? 'Portal' : site.toUpperCase();
      
      return `
    <div class="site-section">
        <div class="site-header">
            <h2 class="site-title">${displayName}</h2>
        </div>
        ${siteData.length === 0 ? `
        <div class="no-reports">
            No validation reports available yet. Run a validation to see reports here.
        </div>
        ` : `
        <table class="reports-table">
            <thead>
                <tr>
                    <th>Report</th>
                    <th>Environment</th>
                    <th>Status</th>
                    <th>Links</th>
                    <th>Performance</th>
                    <th>Timestamp</th>
                </tr>
            </thead>
            <tbody>
                ${siteData.map(run => `
                <tr>
                    <td>
                        <a href="${site}/${run.filename}" class="report-link" target="_blank">
                            ${run.filename.replace('report-', '').replace('.html', '')}
                        </a>
                    </td>
                    <td>
                        <span class="environment">${run.environment}</span>
                    </td>
                    <td>
                        <span class="status-badge status-${run.status}">
                            ${run.failed > 0 ? 'ERRORS' : run.skippedPages > 0 ? 'CACHED' : 'CLEAN'}
                        </span>
                    </td>
                    <td class="stats">
                        ✅ ${run.passed} / ❌ ${run.failed} / 📊 ${run.tested}
                    </td>
                    <td class="stats">
                        ${run.skippedPages > 0 ? `⏭️ ${run.skippedPages}` : ''}
                        ${run.changedPages > 0 ? ` 🔄 ${run.changedPages}` : ''}
                        ${run.newPages > 0 ? ` 🆕 ${run.newPages}` : ''}
                    </td>
                    <td class="timestamp">
                        ${new Date(run.timestamp).toLocaleString()}
                    </td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        `}
    </div>`;
    }).join('')}

    <div class="updated">
        Last updated: ${new Date().toLocaleString()}
    </div>
</body>
</html>`;

  const indexFile = path.join(validationDir, 'index.html');
  fs.writeFileSync(indexFile, html);
  console.log(`📋 Updated validation index: ${indexFile}`);
}

// Get main content checksum
async function getMainContentChecksum(page) {
  const crypto = require('crypto');
  
  const mainContent = await page.evaluate(() => {
    const mainElement = document.querySelector('main, [role="main"], .main-wrapper, .theme-doc-markdown');
    return mainElement ? mainElement.innerHTML : '';
  });
  
  return crypto.createHash('md5').update(mainContent).digest('hex');
}

// Comprehensive sitemap-based link validation with caching and reporting
async function validateLinksFromSitemap(siteKey, baseUrl, environment = 'unknown') {
  const startTime = Date.now();
  console.log(`\n🗺️  Starting sitemap-based link validation for ${siteKey}...`);
  
  // Step 1: Get all URLs from sitemap (with caching)
  const sitemapUrls = await getCachedSitemapData(siteKey);
  if (!sitemapUrls || sitemapUrls.length === 0) {
    return { tested: 0, passed: 0, failed: 1, issues: [{ type: 'NO_SITEMAP', message: 'Could not load sitemap' }] };
  }
  
  console.log(`📋 Found ${sitemapUrls.length} URLs in sitemap`);
  
  // Load content cache
  const contentCache = loadPageContentCache(siteKey);
  let skippedPages = 0;
  let changedPages = 0;
  let newPages = 0;
  
  // Performance-optimized Puppeteer launch
  const browser = await puppeteer.launch({ 
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding'
    ]
  });
  
  const page = await browser.newPage();
  
  // Block unnecessary resources for faster loading (but keep CSS for proper rendering)
  await page.setRequestInterception(true);
  page.on('request', request => {
    const resourceType = request.resourceType();
    if (resourceType === 'image' || 
        resourceType === 'font' ||
        resourceType === 'media') {
      request.abort();
    } else {
      request.continue();
    }
  });
  
  // Listen for page errors
  page.on('error', error => {
    console.error(`   ❌ Page crashed: ${error.message}`);
  });
  
  page.on('pageerror', error => {
    console.error(`   ❌ Page error: ${error.message}`);
  });
  
  const allLinks = new Set();
  const allAnchors = new Map(); // URL -> Set of anchors
  const pageDetails = []; // Detailed page information for reporting
  const linksByPage = new Map(); // Page URL -> links found on that page
  
  let pageTimes = [];
  
  try {
    // Step 2: Visit each page and extract links
    for (let i = 0; i < sitemapUrls.length; i++) {
      const pageUrl = sitemapUrls[i];
      const pageStartTime = Date.now();
      
      try {
        // Optimized page loading - wait for DOM instead of network idle
        await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // Wait specifically for main content, but with shorter timeout
        await page.waitForSelector('main, [role="main"], .main-wrapper', { timeout: 5000 }).catch(() => {});
        
        // Check for page errors
        const pageErrors = await page.evaluate(() => {
          const errors = [];
          // Check for React error boundaries
          const errorBoundary = document.querySelector('.error-boundary, [data-error], .error-message');
          if (errorBoundary) {
            errors.push(`React Error: ${errorBoundary.textContent}`);
          }
          // Check for 404 pages
          const title = document.title.toLowerCase();
          if (title.includes('404') || title.includes('not found') || title.includes('page not found')) {
            errors.push(`404 Page: ${document.title}`);
          }
          // Check for Docusaurus error pages
          const docusaurusError = document.querySelector('.theme-doc-version-banner--error, .theme-doc-version-badge--error');
          if (docusaurusError) {
            errors.push(`Docusaurus Error: ${docusaurusError.textContent}`);
          }
          // Check if main content is empty
          const mainContent = document.querySelector('main, [role="main"], .main-wrapper, .theme-doc-markdown');
          if (!mainContent || mainContent.textContent.trim().length < 50) {
            errors.push('Page appears to have no main content');
          }
          return errors;
        });
        
        if (pageErrors.length > 0) {
          console.warn(`   ⚠️  Page load errors on ${pageUrl}:`);
          pageErrors.forEach(err => console.warn(`      - ${err}`));
        }
        
        // Get content checksum immediately
        const currentChecksum = await getMainContentChecksum(page);
        const cachedPageData = contentCache[pageUrl];
        
        const pageTime = Date.now() - pageStartTime;
        
        // Check if page content has changed
        if (cachedPageData && cachedPageData.checksum === currentChecksum) {
          // Page hasn't changed - use cached data
          console.log(`📄 Processing ${i + 1}/${sitemapUrls.length}: ${pageUrl} [⏭️  SKIPPED - no changes] (${pageTime}ms)`);
          skippedPages++;
          pageTimes.push(pageTime);
          
          // Restore cached data
          if (cachedPageData.links) {
            cachedPageData.links.forEach(link => {
              allLinks.add(link.hasAnchor ? link.fullUrl : link.urlWithoutAnchor);
            });
          }
          if (cachedPageData.anchors) {
            allAnchors.set(pageUrl, new Set(cachedPageData.anchors));
          }
          
          pageDetails.push({
            url: pageUrl,
            title: cachedPageData.title,
            linkCount: cachedPageData.linkCount,
            anchorCount: cachedPageData.anchorCount,
            links: cachedPageData.links,
            skipped: true
          });
          
        } else {
          // Page is new or changed - process it
          const status = cachedPageData ? '🔄 CHANGED' : '🆕 NEW';
          
          pageTimes.push(pageTime);
          
          // Show timing for changed/new pages
          console.log(`📄 Processing ${i + 1}/${sitemapUrls.length}: ${pageUrl} [${status}] (${pageTime}ms)`);
          
          if (cachedPageData) changedPages++;
          else newPages++;
          
          // Get page title
          const pageTitle = await page.title();
          
          // Extract links from main content
          const pageLinks = await extractMainContentLinks(page, baseUrl);
          const internalLinks = pageLinks.filter(l => l.isInternal);
          
          // Store links by page for detailed reporting
          linksByPage.set(pageUrl, internalLinks);
          
          // Add to global set
          internalLinks.forEach(link => {
            allLinks.add(link.hasAnchor ? link.fullUrl : link.urlWithoutAnchor);
          });
          
          // Extract all anchors on this page
          const pageAnchors = await extractPageAnchors(page);
          allAnchors.set(pageUrl, new Set(pageAnchors));
          
          // Update cache
          contentCache[pageUrl] = {
            checksum: currentChecksum,
            title: pageTitle,
            linkCount: internalLinks.length,
            anchorCount: pageAnchors.length,
            links: internalLinks,
            anchors: Array.from(pageAnchors),
            lastChecked: new Date().toISOString()
          };
          
          // Store page details
          pageDetails.push({
            url: pageUrl,
            title: pageTitle,
            linkCount: internalLinks.length,
            anchorCount: pageAnchors.length,
            links: internalLinks
          });
          
          console.log(`   📎 Found ${internalLinks.length} internal links, ${pageAnchors.length} anchors`);
          
          // If no links found, log warning
          if (internalLinks.length === 0) {
            console.warn(`   ⚠️  WARNING: No internal links found on ${pageUrl}`);
            console.warn(`      - Total links on page: ${pageLinks.length}`);
            console.warn(`      - Page errors: ${pageErrors.length > 0 ? pageErrors.join(', ') : 'None detected'}`);
          }
        }
        
      } catch (error) {
        console.error(`   ❌ Failed to process ${pageUrl}: ${error.message}`);
        const pageTime = Date.now() - pageStartTime;
        pageTimes.push(pageTime);
        
        // Try to get more details about the error
        let errorDetails = error.message;
        if (error.name === 'TimeoutError') {
          errorDetails = `Page load timeout after ${pageTime}ms`;
        }
        
        pageDetails.push({
          url: pageUrl,
          title: 'Failed to Load',
          linkCount: 0,
          anchorCount: 0,
          links: [],
          error: errorDetails,
          loadTime: pageTime
        });
      }
    }
    
    // Step 3: Check which links are missing and assign to pages
    console.log(`\n🔍 Checking ${allLinks.size} unique internal links against sitemap...`);
    
    const missingPages = new Set();
    const missingAnchors = new Set();
    
    // Add broken link details to page information
    pageDetails.forEach(pageDetail => {
      if (pageDetail.links) {
        pageDetail.brokenLinks = [];
        
        pageDetail.links.forEach(link => {
          const url = new URL(link.fullUrl);
          const urlWithoutAnchor = `${url.origin}${url.pathname}${url.search}`;
          const anchorId = url.hash ? url.hash.substring(1) : null;
          
          let brokenLink = null;
          
          // Check if page exists in sitemap
          if (!sitemapUrls.includes(urlWithoutAnchor)) {
            missingPages.add(urlWithoutAnchor);
            brokenLink = {
              url: link.fullUrl,
              text: link.text,
              type: 'Missing Page'
            };
          } else if (anchorId) {
            // Check if anchor exists on the page
            const pageAnchors = allAnchors.get(urlWithoutAnchor);
            if (pageAnchors && !pageAnchors.has(anchorId)) {
              missingAnchors.add(link.fullUrl);
              brokenLink = {
                url: link.fullUrl,
                text: link.text,
                type: 'Missing Anchor'
              };
            }
          }
          
          if (brokenLink) {
            pageDetail.brokenLinks.push(brokenLink);
          }
        });
      }
    });
    
    // Step 4: Generate report and show results
    const results = {
      tested: allLinks.size,
      passed: allLinks.size - missingPages.size - missingAnchors.size,
      failed: missingPages.size + missingAnchors.size,
      missingPages: Array.from(missingPages),
      missingAnchors: Array.from(missingAnchors),
      skippedPages,
      changedPages,
      newPages
    };
    
    // Save content cache
    savePageContentCache(siteKey, contentCache);
    console.log(`💾 Saved content cache for future runs`);
    
    // Calculate timing statistics
    const totalTime = Date.now() - startTime;
    const avgPageTime = pageTimes.length > 0 ? Math.round(pageTimes.reduce((a, b) => a + b, 0) / pageTimes.length) : 0;
    const minPageTime = pageTimes.length > 0 ? Math.min(...pageTimes) : 0;
    const maxPageTime = pageTimes.length > 0 ? Math.max(...pageTimes) : 0;
    
    console.log(`\n📊 Validation Results:`);
    console.log(`   📋 Sitemap pages: ${sitemapUrls.length}`);
    console.log(`   ⏭️  Skipped pages (unchanged): ${skippedPages}`);
    console.log(`   🔄 Changed pages: ${changedPages}`);
    console.log(`   🆕 New pages: ${newPages}`);
    console.log(`   🔗 Internal links found: ${allLinks.size}`);
    console.log(`   ❌ Missing pages: ${missingPages.size}`);
    console.log(`   ⚓ Missing anchors: ${missingAnchors.size}`);
    
    console.log(`\n⏱️  Performance Metrics:`);
    console.log(`   🕒 Total time: ${Math.round(totalTime / 1000)}s (${totalTime}ms)`);
    console.log(`   📄 Average page time: ${avgPageTime}ms`);
    console.log(`   ⚡ Fastest page: ${minPageTime}ms`);
    console.log(`   🐌 Slowest page: ${maxPageTime}ms`);
    console.log(`   📈 Pages per second: ${Math.round((sitemapUrls.length / totalTime) * 1000 * 10) / 10}`);
    
    // Generate HTML report
    const reportFile = generateHtmlReport(siteKey, baseUrl, results, pageDetails, environment);
    console.log(`\n📄 Detailed report available at: ${reportFile}`);
    
    if (missingPages.size === 0 && missingAnchors.size === 0) {
      console.log(`\n✅ All internal links are valid!`);
    }
    
    return results;
    
  } finally {
    await browser.close();
  }
}

// Validate sitemap generation (simplified)
function validateSitemap(siteKey, baseUrl) {
  const path = require('path');
  const fs = require('fs');
  
  const siteDir = siteKey.toLowerCase() === 'portal' ? 'portal' : `standards/${siteKey}`;
  const buildPath = path.join(process.cwd(), siteDir, 'build');
  const sitemapPath = path.join(buildPath, 'sitemap.xml');
  
  const results = {
    tested: 1,
    passed: 0,
    failed: 0,
    issues: []
  };
  
  if (!fs.existsSync(sitemapPath)) {
    results.failed++;
    results.issues.push({
      type: 'SITEMAP_MISSING',
      priority: 'HIGH',
      message: `Sitemap not found: ${sitemapPath}`,
      category: 'sitemap'
    });
  } else {
    results.passed++;
    console.log(`✅ Sitemap found: ${sitemapPath}`);
  }
  
  return results;
}

// Check if an anchor exists on a page
async function checkAnchorExists(page, pageUrl, anchorId) {
  try {
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
    
    const anchorExists = await page.evaluate((id) => {
      // Check for element with matching id
      if (document.getElementById(id)) return true;
      
      // Check for element with matching name attribute
      if (document.querySelector(`[name="${id}"]`)) return true;
      
      // Check for headings with matching id (auto-generated anchors)
      if (document.querySelector(`h1[id="${id}"], h2[id="${id}"], h3[id="${id}"], h4[id="${id}"], h5[id="${id}"], h6[id="${id}"]`)) return true;
      
      return false;
    }, anchorId);
    
    return anchorExists;
  } catch (error) {
    return false;
  }
}

// Extract all links from a page
async function extractLinksFromPage(page, baseUrl) {
  const linkCount = await page.evaluate(() => {
    return document.querySelectorAll('a[href]').length;
  });
  console.log(`📄 Found ${linkCount} total anchor elements`);
  
  return await page.evaluate((baseUrl) => {
    const links = [];
    
    document.querySelectorAll('a[href]').forEach(el => {
      const href = el.getAttribute('href');
      // Skip placeholder links and empty hrefs
      if (href && href !== '#' && href.trim() !== '') {
        try {
          const fullUrl = href.startsWith('http') ? href :
                         href.startsWith('/') ? new URL(href, baseUrl).href :
                         new URL(href, window.location.href).href;
          
          // Parse anchor from URL
          const url = new URL(fullUrl);
          const anchorId = url.hash ? url.hash.substring(1) : null;
          const urlWithoutAnchor = `${url.origin}${url.pathname}${url.search}`;
          
          links.push({
            href,
            fullUrl,
            urlWithoutAnchor,
            anchorId,
            text: el.textContent?.trim() || '',
            isNavigation: el.closest('nav, footer, [class*="dropdown"]') !== null,
            isExternal: href.startsWith('http') && !href.includes(window.location.hostname),
            isSameSite: fullUrl.startsWith(baseUrl),
            hasAnchor: !!anchorId
          });
        } catch (error) {
          // Skip malformed URLs
        }
      }
    });
    
    return links;
  }, baseUrl);
}


async function validateEnvironmentUrls(siteKey, environment, options = {}) {
  const { type = 'both', depth = 0, sampleSize = 10, timeout = 15000 } = options;
  
  console.log(`\n🔍 Validating URLs for ${siteKey.toUpperCase()} in ${environment.toUpperCase()} environment`);
  
  const siteConfig = sites[siteKey]?.[environment];
  if (!siteConfig) {
    console.error(`❌ No configuration found for ${siteKey} in ${environment} environment`);
    return false;
  }
  
  const baseUrl = `${siteConfig.url}${siteConfig.baseUrl}`;
  console.log(`🌐 Expected base URL: ${baseUrl}`);
  console.log(`📋 Testing: ${type}`);
  console.log(`🕳️  Crawl depth: ${depth} (${depth === 0 ? 'homepage only' : `${depth} level${depth > 1 ? 's' : ''} deep`})`);
  
  // Handle sitemap-only validation
  if (type === 'sitemap') {
    const sitemapResults = validateSitemap(siteKey, baseUrl);
    
    // Report sitemap results
    console.log(`\n📊 Sitemap Validation Results for ${siteKey.toUpperCase()} (${environment}):`);
    console.log(`   ✅ Passed: ${sitemapResults.passed}`);
    console.log(`   ❌ Failed: ${sitemapResults.failed}`);
    console.log(`   📈 Total: ${sitemapResults.tested}`);
    
    if (sitemapResults.issues.length > 0) {
      const critical = sitemapResults.issues.filter(i => i.priority === 'CRITICAL');
      const high = sitemapResults.issues.filter(i => i.priority === 'HIGH');
      const medium = sitemapResults.issues.filter(i => i.priority === 'MEDIUM');
      const low = sitemapResults.issues.filter(i => i.priority === 'LOW');
      
      if (high.length > 0) {
        console.error(`\n❌ HIGH PRIORITY SITEMAP ISSUES (${high.length}):`);
        high.forEach((issue, i) => {
          console.error(`  ${i + 1}. ${issue.type}: ${issue.message}`);
          if (issue.suggestion) console.error(`     💡 ${issue.suggestion}`);
          if (issue.details) console.error(`     📝 Examples: ${issue.details.slice(0, 3).join(', ')}`);
        });
      }
      
      if (medium.length > 0) {
        console.warn(`\n⚠️  MEDIUM PRIORITY SITEMAP ISSUES (${medium.length}):`);
        medium.forEach((issue, i) => {
          console.warn(`  ${i + 1}. ${issue.type}: ${issue.message}`);
          if (issue.details) console.warn(`     📝 Examples: ${issue.details.slice(0, 3).join(', ')}`);
        });
      }
      
      if (low.length > 0) {
        console.log(`\n💡 LOW PRIORITY SITEMAP ISSUES (${low.length}):`);
        low.forEach((issue, i) => {
          console.log(`  ${i + 1}. ${issue.type}: ${issue.message}`);
          if (issue.details) console.log(`     📝 Examples: ${issue.details.slice(0, 3).join(', ')}`);
        });
      }
      
      return critical.length === 0 && high.length === 0; // Return false if critical or high issues found
    } else {
      console.log('\n✅ All sitemap validations passed!');
      return true;
    }
  }
  
  // Handle comprehensive sitemap-based validation
  if (type === 'comprehensive') {
    const linkResults = await validateLinksFromSitemap(siteKey, baseUrl, environment);
    
    console.log(`\n📊 Comprehensive Link Validation Results for ${siteKey.toUpperCase()} (${environment}):`);
    console.log(`   ✅ Valid links: ${linkResults.passed}`);
    console.log(`   ❌ Invalid links: ${linkResults.failed}`);
    console.log(`   📈 Total tested: ${linkResults.tested}`);
    
    return linkResults.failed === 0;
  }
  
  // For non-local environments, we need to check if the site is accessible
  const isLocalhost = environment === 'local';
  let testUrl = baseUrl;
  
  if (!isLocalhost) {
    console.log(`📡 Testing remote environment: ${baseUrl}`);
  } else {
    // For local, check if build directory exists
    const siteDir = siteKey.toLowerCase() === 'portal' ? 'portal' : `standards/${siteKey}`;
    const buildPath = path.join(process.cwd(), siteDir, 'build');
    
    if (!fs.existsSync(buildPath)) {
      console.error(`❌ Build directory not found: ${buildPath}`);
      console.error(`💡 Run: pnpm build-env --env local --site ${siteKey.toLowerCase()}`);
      return false;
    }
    
    // For local testing, use the full baseUrl
    testUrl = baseUrl;
    console.log(`🏠 Testing local build served at: ${testUrl}`);
  }
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Track requests to detect hardcoded localhost URLs
    const hardcodedLocalhostUrls = new Set();
    
    await page.setRequestInterception(true);
    page.on('request', request => {
      const url = request.url();
      
      // Check for hardcoded localhost URLs in non-local environments
      if (!isLocalhost && LOCALHOST_PATTERNS.some(pattern => pattern.test(url))) {
        hardcodedLocalhostUrls.add(url);
      }
      
      request.continue();
    });
    
    console.log('📄 Extracting all valid pages from build directory...');
    
    let allValidPages, allLinks;
    try {
      // Extract all valid pages from build directory (our reference)
      allValidPages = extractPagesFromBuild(siteKey, baseUrl);
      allLinks = [];
      
      // Determine which pages to check based on depth
      let pagesToCheck = [];
      if (parseInt(depth) === 0) {
        // Depth 0: Just check homepage
        pagesToCheck = [testUrl];
      } else {
        // Depth > 0: Check multiple pages from the valid pages list
        const maxPages = Math.min(parseInt(depth) * 10, allValidPages.length, 50); // Reasonable limit
        pagesToCheck = [testUrl, ...allValidPages.slice(0, maxPages)];
      }
      
      console.log(`📄 Checking links on ${pagesToCheck.length} page(s)...`);
      
      // Load each page and extract its links for validation
      for (const pageUrl of pagesToCheck) {
        try {
          console.log(`📄 Loading: ${pageUrl}`);
          await page.goto(pageUrl, { waitUntil: 'networkidle0', timeout: 30000 });
          
          // Wait for Docusaurus to finish rendering (SPA content)
          await page.waitForFunction(() => {
            // Wait for either navigation or main content to be present
            return document.querySelector('nav a, .navbar a, [class*="navbar"] a, main a, .main a, [role="main"] a, .markdown a') !== null;
          }, { timeout: 15000 }).catch(() => {
            console.log('📄 No navigation or content links found yet, checking anyway...');
          });
          
          // Additional wait for React/Docusaurus to fully hydrate
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Debug: Check if page loaded correctly
          const title = await page.title();
          console.log(`📄 Page title: "${title}"`);
          
          // Debug: Check what selectors are available
          const selectorCounts = await page.evaluate(() => {
            return {
              totalAnchors: document.querySelectorAll('a').length,
              anchorsWithHref: document.querySelectorAll('a[href]').length,
              navLinks: document.querySelectorAll('nav a, .navbar a').length,
              mainLinks: document.querySelectorAll('main a, .main a, [role="main"] a').length,
              markdownLinks: document.querySelectorAll('.markdown a, .theme-doc-markdown a').length
            };
          });
          console.log(`📄 Link counts:`, selectorCounts);
          
          const pageLinks = await extractLinksFromPage(page, baseUrl);
          console.log(`📄 Found ${pageLinks.length} links on this page`);
          allLinks.push(...pageLinks);
        } catch (error) {
          console.warn(`⚠️  Skipped ${pageUrl}: ${error.message}`);
        }
      }
      
    } catch (error) {
      if (isLocalhost) {
        console.error(`❌ Failed to load ${testUrl}`);
        console.error(`💡 Make sure the built site is being served on port ${siteConfig.port}`);
        console.error(`   cd ${siteKey.toLowerCase() === 'portal' ? 'portal' : `standards/${siteKey}`} && pnpm run serve --port ${siteConfig.port}`);
      } else {
        console.error(`❌ Failed to load remote site: ${testUrl}`);
        console.error(`💡 Site may not be deployed or accessible`);
      }
      return false;
    }
    
    // Deduplicate links by fullUrl to avoid testing the same URL multiple times
    const uniqueLinks = Array.from(
      new Map(allLinks.map(link => [link.fullUrl, link])).values()
    );
    
    console.log(`🔄 Deduplicated to ${uniqueLinks.length} unique links`);
    
    const results = {
      tested: 0,
      passed: 0,
      failed: 0,
      issues: []
    };
    
    // Categorize links
    const navigationLinks = uniqueLinks.filter(link => link.isNavigation && !link.isExternal);
    const contentLinks = uniqueLinks.filter(link => !link.isNavigation && !link.isExternal);
    
    console.log(`   📋 Navigation/Static links: ${navigationLinks.length}`);
    console.log(`   📄 Content/Generated links: ${contentLinks.length}`);
    
    // Test static navigation links (always test these)
    if (type === 'static' || type === 'both') {
      console.log('\n🧭 Testing static navigation links...');
      
      for (const link of navigationLinks) {
        results.tested++;
        
        // For links with anchors, check the page without anchor first
        const pageUrl = link.hasAnchor ? link.urlWithoutAnchor : link.fullUrl;
        const isInBuild = allValidPages.includes(pageUrl);
        const isCrossSiteValid = isValidEnvironmentUrl(pageUrl, environment);
        const isPageValid = isInBuild || isCrossSiteValid;
        
        if (!isPageValid) {
          results.failed++;
          results.issues.push({
            type: link.isSameSite ? 'PAGE_NOT_FOUND' : 'URL_MISMATCH',
            priority: 'HIGH',
            link: link.href,
            text: link.text,
            expected: link.isSameSite ? 'Should be a valid page in site build' : `Should be a valid URL for ${environment} environment`,
            actual: pageUrl,
            category: 'navigation'
          });
          continue;
        }
        
        // If link has an anchor and is same-site, verify the anchor exists
        if (link.hasAnchor && link.isSameSite && isLocalhost) {
          try {
            const anchorExists = await checkAnchorExists(page, pageUrl, link.anchorId);
            if (!anchorExists) {
              results.failed++;
              results.issues.push({
                type: 'BROKEN_ANCHOR',
                priority: 'MEDIUM',
                link: link.href,
                text: link.text,
                anchor: link.anchorId,
                page: pageUrl,
                category: 'navigation'
              });
            } else {
              results.passed++;
            }
          } catch (error) {
            results.failed++;
            results.issues.push({
              type: 'ANCHOR_CHECK_ERROR',
              priority: 'LOW',
              link: link.href,
              text: link.text,
              error: error.message,
              category: 'navigation'
            });
          }
        } else {
          results.passed++;
        }
      }
    }
    
    // Test generated content links (sample for non-local, all for local)
    if (type === 'generated' || type === 'both') {
      console.log('\n📄 Testing generated content links...');
      
      let linksToTest = contentLinks;
      
      // For non-local, just sample a few links to spot-check URL patterns
      if (!isLocalhost && contentLinks.length > sampleSize) {
        linksToTest = contentLinks.slice(0, sampleSize);
        console.log(`   📊 Sampling ${sampleSize} links for spot check`);
      }
      
      for (const link of linksToTest) {
        results.tested++;
        
        // Check for hardcoded localhost URLs (but exclude hash anchors)
        if (!link.href.startsWith('#') && LOCALHOST_PATTERNS.some(pattern => pattern.test(link.fullUrl))) {
          results.failed++;
          results.issues.push({
            type: 'HARDCODED_LOCALHOST',
            priority: environment === 'local' ? 'LOW' : 'CRITICAL',
            link: link.href,
            text: link.text,
            actual: link.fullUrl,
            category: 'generated'
          });
          continue;
        }
        
        // For links with anchors, check the page without anchor first
        const pageUrl = link.hasAnchor ? link.urlWithoutAnchor : link.fullUrl;
        const isInBuild = allValidPages.includes(pageUrl);
        const isCrossSiteValid = isValidEnvironmentUrl(pageUrl, environment);
        const isPageValid = isInBuild || isCrossSiteValid;
        
        if (!isPageValid) {
          results.failed++;
          results.issues.push({
            type: link.isSameSite ? 'PAGE_NOT_FOUND' : 'URL_MISMATCH',
            priority: 'MEDIUM',
            link: link.href,
            text: link.text,
            expected: link.isSameSite ? 'Should be a valid page in site build' : `Should be a valid URL for ${environment} environment`,
            actual: pageUrl,
            category: 'generated'
          });
          continue;
        }
        
        // If link has an anchor and is same-site, verify the anchor exists
        if (link.hasAnchor && link.isSameSite && isLocalhost) {
          try {
            const anchorExists = await checkAnchorExists(page, pageUrl, link.anchorId);
            if (!anchorExists) {
              results.failed++;
              results.issues.push({
                type: 'BROKEN_ANCHOR',
                priority: 'MEDIUM',
                link: link.href,
                text: link.text,
                anchor: link.anchorId,
                page: pageUrl,
                category: 'generated'
              });
            } else {
              results.passed++;
            }
          } catch (error) {
            results.failed++;
            results.issues.push({
              type: 'ANCHOR_CHECK_ERROR',
              priority: 'LOW',
              link: link.href,
              text: link.text,
              error: error.message,
              category: 'generated'
            });
          }
        } else {
          results.passed++;
        }
      }
    }
    
    // Check for hardcoded localhost URLs in requests
    if (hardcodedLocalhostUrls.size > 0) {
      console.warn(`\n⚠️  Detected ${hardcodedLocalhostUrls.size} hardcoded localhost URLs in requests:`);
      Array.from(hardcodedLocalhostUrls).forEach(url => {
        console.warn(`   ${url}`);
        results.issues.push({
          type: 'HARDCODED_LOCALHOST_REQUEST',
          priority: 'CRITICAL',
          actual: url,
          category: 'requests'
        });
      });
    }
    
    // Report results
    console.log(`\n📊 URL Validation Results for ${siteKey.toUpperCase()} (${environment}):`);
    console.log(`   ✅ Passed: ${results.passed}`);
    console.log(`   ❌ Failed: ${results.failed}`);
    console.log(`   📈 Total: ${results.tested}`);
    
    if (results.issues.length > 0) {
      const critical = results.issues.filter(i => i.priority === 'CRITICAL');
      const high = results.issues.filter(i => i.priority === 'HIGH');
      const medium = results.issues.filter(i => i.priority === 'MEDIUM');
      const low = results.issues.filter(i => i.priority === 'LOW');
      
      if (critical.length > 0) {
        console.error(`\n🚨 CRITICAL ISSUES (${critical.length}):`);
        critical.forEach((issue, i) => {
          console.error(`  ${i + 1}. ${issue.type}: ${issue.link || issue.actual}`);
          if (issue.expected) console.error(`     Expected: ${issue.expected}`);
          if (issue.error) console.error(`     Error: ${issue.error}`);
        });
      }
      
      if (high.length > 0) {
        console.error(`\n❌ HIGH PRIORITY (${high.length}):`);
        high.forEach((issue, i) => {
          console.error(`  ${i + 1}. ${issue.type}: "${issue.text}" -> ${issue.link}`);
          if (issue.status) console.error(`     Status: ${issue.status}`);
          if (issue.error) console.error(`     Error: ${issue.error}`);
        });
      }
      
      if (medium.length > 0) {
        console.warn(`\n⚠️  MEDIUM PRIORITY (${medium.length}):`);
        medium.forEach((issue, i) => {
          console.warn(`  ${i + 1}. ${issue.type}: "${issue.text}" -> ${issue.link}`);
          if (issue.status) console.warn(`     Status: ${issue.status}`);
          if (issue.error) console.warn(`     Error: ${issue.error}`);
          if (issue.anchor) console.warn(`     Missing anchor: #${issue.anchor} on ${issue.page}`);
        });
      }
      
      if (low.length > 0) {
        console.log(`\n💡 LOW PRIORITY (${low.length}):`);
        low.forEach((issue, i) => {
          console.log(`  ${i + 1}. ${issue.type}: "${issue.text}" -> ${issue.link}`);
          if (issue.status) console.log(`     Status: ${issue.status}`);
          if (issue.error) console.log(`     Error: ${issue.error}`);
        });
      }
      
      return critical.length === 0; // Return false only if critical issues found
    } else {
      console.log('\n✅ All URL validations passed!');
      return true;
    }
    
  } finally {
    await browser.close();
  }
}

async function main() {
  const options = program.opts();
  let { env, site, depth, sampleSize, timeout } = options;
  let { type } = options; // type has already been normalized above

  // Interactive prompts for missing options
  if (!env) {
    const envAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'environment',
        message: 'Select environment to test:',
        choices: [
          { name: 'local - Test local builds (comprehensive)', value: 'local' },
          { name: 'preview - GitHub Pages staging', value: 'preview' },
          { name: 'production - Live site', value: 'production' }
        ],
        default: 'local'
      }
    ]);
    env = envAnswer.environment;
  }

  if (!site) {
    const siteChoices = [
      { name: 'All sites', value: 'all' },
      ...validSites.map(s => ({ name: s, value: s }))
    ];
    
    const siteAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'site',
        message: 'Select site(s) to test:',
        choices: siteChoices,
        default: 'all'
      }
    ]);
    site = siteAnswer.site;
  }

  if (!type) {
    const typeChoices = [
      { name: 'comprehensive - Full sitemap-based validation (RECOMMENDED)', value: 'comprehensive' },
      { name: 'both - Test navigation + generated content', value: 'both' },
      { name: 'static - Test navigation/footer links only', value: 'static' },
      { name: 'generated - Test generated content links only', value: 'generated' },
      { name: 'sitemap - Validate sitemap generation only', value: 'sitemap' }
    ];
    
    const typeAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Select test type:',
        choices: typeChoices,
        default: env === 'local' ? 'comprehensive' : 'static'
      }
    ]);
    type = typeAnswer.type;
  }

  // For non-local environments with generated testing, ask about sample size
  if (!sampleSize && env !== 'local' && (type === 'generated' || type === 'both')) {
    const sampleAnswer = await inquirer.prompt([
      {
        type: 'number',
        name: 'sampleSize',
        message: 'How many generated links to sample test? (non-local environments)',
        default: 10,
        validate: (input) => input > 0 || 'Must be greater than 0'
      }
    ]);
    sampleSize = sampleAnswer.sampleSize;
  }

  // Update options with prompted values
  const finalOptions = { 
    ...options, 
    depth: depth || options.depth || 0,
    sampleSize: sampleSize || options.sampleSize,
    timeout: timeout || options.timeout 
  };

  // Validate inputs
  if (!validEnvironments.includes(env)) {
    console.error(`❌ Invalid environment: ${env}`);
    console.error(`Valid environments: ${validEnvironments.join(', ')}`);
    process.exit(1);
  }

  let sitesToTest = [];
  if (site.toLowerCase() === 'all') {
    sitesToTest = validSites;
  } else if (site.includes(',')) {
    sitesToTest = site.split(',').map(s => s.trim());
  } else {
    sitesToTest = [site];
  }

  // Validate sites
  const invalidSites = sitesToTest.filter(s => !validSites.map(v => v.toLowerCase()).includes(s.toLowerCase()));
  if (invalidSites.length > 0) {
    console.error(`❌ Invalid sites: ${invalidSites.join(', ')}`);
    console.error(`Available sites: ${validSites.join(', ')}`);
    process.exit(1);
  }

  console.log(`\n🎯 Validating ${sitesToTest.length} site(s) for ${env} environment`);
  if (env === 'local') {
    console.log('💡 For local testing, make sure sites are built and served first:');
    console.log(`   pnpm build-env --env local --site ${site === 'all' ? 'all' : site}`);
    sitesToTest.forEach((s, i) => {
      const siteConfig = sites[s]?.[env];
      if (siteConfig?.port) {
        const siteDir = s.toLowerCase() === 'portal' ? 'portal' : `standards/${s}`;
        console.log(`   cd ${siteDir} && pnpm run serve --port ${siteConfig.port}`);
      }
    });
    console.log('');
  }

  const results = { passed: 0, failed: 0, errors: [] };

  for (const siteKey of sitesToTest) {
    try {
      const success = await validateEnvironmentUrls(siteKey, env, finalOptions);
      if (success) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      results.failed++;
      results.errors.push({ site: siteKey, error: error.message });
      console.error(`❌ Error validating ${siteKey}: ${error.message}`);
    }
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 OVERALL RESULTS (${env} environment)`);
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Sites passed: ${results.passed}`);
  console.log(`❌ Sites failed: ${results.failed}`);

  if (results.errors.length > 0) {
    console.error('\n❌ Sites with errors:');
    results.errors.forEach(({ site, error }) => {
      console.error(`  - ${site}: ${error}`);
    });
  }

  if (results.failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Environment URL validation failed:', error);
    process.exit(1);
  });
}

module.exports = { validateEnvironmentUrls };
