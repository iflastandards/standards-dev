import puppeteer from 'puppeteer';
import { getSiteUrl } from '../packages/theme/dist/config/siteConfig.js';
import { sites, DocsEnv } from '../packages/theme/dist/config/siteConfigCore.js';
import fs from 'fs';

const portalSiteKey = 'portal';

async function checkLinks(targetUrl, currentEnv) {
  const currentPortalSiteConfig = sites[portalSiteKey]?.[currentEnv];
  if (!currentPortalSiteConfig) {
    console.error(`  ❌ ERROR: Configuration for '${portalSiteKey}' site in env '${currentEnv}' not found!`);
    return false;
  }
  const currentPortalBaseUrl = currentPortalSiteConfig.baseUrl;
  const expectTrailingSlashForCurrentEnv = currentEnv !== DocsEnv.Preview;

  const linksToVerify = [
    { text: 'Navbar Logo', type: 'logo', toSite: portalSiteKey, siteRelativePath: '/' },
    
    { text: 'Navbar Documentation', type: 'navInternal', toSite: portalSiteKey, siteRelativePath: '/docs/' },
    { text: 'Navbar Blog', type: 'navInternal', toSite: portalSiteKey, siteRelativePath: '/blog/' },
    { text: 'Navbar Management', type: 'navInternal', toSite: portalSiteKey, siteRelativePath: '/manage/' },
    
    { text: 'Hero Explore Standards', type: 'heroPrimary', toSite: portalSiteKey, siteRelativePath: '#standards' },
    { text: 'Hero Documentation', type: 'heroSecondary', toSite: portalSiteKey, siteRelativePath: '/docs/' },
    
    { text: 'Navbar ISBDM', type: 'navExternal', toSite: 'ISBDM' },
    { text: 'Navbar LRM', type: 'navExternal', toSite: 'LRM' },
    { text: 'Navbar FRBR', type: 'navExternal', toSite: 'FRBR' },
    { text: 'Navbar ISBD', type: 'navExternal', toSite: 'isbd' },
    { text: 'Navbar Muldicat', type: 'navExternal', toSite: 'muldicat' },
    { text: 'Navbar Unimarc', type: 'navExternal', toSite: 'unimarc' },

    { text: 'Footer ISBDM', type: 'footer', toSite: 'ISBDM' },
    { text: 'Footer LRM', type: 'footer', toSite: 'LRM' },
    { text: 'Footer Portal Blog', type: 'footer', toSite: 'portal', siteRelativePath: '/blog/' }, 
    { text: 'Footer Portal Docs', type: 'footer', toSite: 'portal', siteRelativePath: '/docs/' },
  ];

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Capture console logs and errors from the page
  page.on('console', msg => console.log(`  BROWSER LOG: ${msg.text()}`));
  page.on('pageerror', error => {
    console.error(`  BROWSER ERROR: ${error.message}`);
  });

  console.log(`Navigating to ${targetUrl} for DOCS_ENV=${currentEnv}...`);
  await page.goto(targetUrl, { waitUntil: 'networkidle0' });

  // Wait for the main standards container to be present before proceeding
  try {
    await page.waitForSelector('section#standards', { timeout: 20000 });
  } catch (e) {
    console.error(`  ❌ FATAL: The main content container (#standards) did not appear in time. Page might not be rendering.`);
    const screenshotPath = `failure-${currentEnv}-initial_load.png`;
    await page.screenshot({ path: screenshotPath });
    console.error(`     Screenshot saved to: ${screenshotPath}`);
    const htmlPath = `failure-${currentEnv}-initial_load.html`;
    fs.writeFileSync(htmlPath, await page.content());
    console.error(`     HTML dump saved to: ${htmlPath}`);
    await browser.close();
    return false;
  }

  let allTestsPassed = true;
  let isDropdownOpen = false;
  console.log(`\nVerifying links for environment: ${currentEnv}`);

  for (const link of linksToVerify) {
    const expectedFullHref = getSiteUrl(link.toSite, link.siteRelativePath || '', currentEnv);
    let hrefForSelector; 

    if (link.toSite === portalSiteKey) {
        let pathPart = link.siteRelativePath || '';
        if (pathPart.startsWith('#')) {
            hrefForSelector = pathPart;
        } else {
            hrefForSelector = (currentPortalBaseUrl + pathPart).replace(/\/\//g, '/'); 
            
            if (expectTrailingSlashForCurrentEnv) {
                if (hrefForSelector !== '/' && !hrefForSelector.endsWith('/')) hrefForSelector += '/';
            } else { 
                if (hrefForSelector !== '/' && hrefForSelector.endsWith('/')) hrefForSelector = hrefForSelector.slice(0, -1);
            }
        }
    } else {
        hrefForSelector = expectedFullHref;
    }

    let selector;
    switch (link.type) {
        case 'logo':
            selector = `nav .navbar__brand[href="${hrefForSelector}"]`;
            break;
        case 'heroPrimary': 
            selector = `header.hero--primary a.button.button--primary[href="${hrefForSelector}"]`;
            break;
        case 'heroSecondary': 
            selector = `header.hero--primary a.button.button--secondary[href="${hrefForSelector}"]`;
            break;
        case 'navInternal':
            selector = `nav .navbar__items li:not(.dropdown) a.navbar__link[href="${hrefForSelector}"]`;
            break;
        case 'navExternal':
            if (!isDropdownOpen) {
                try {
                    const dropdownToggleSelector = 'a.navbar__link.dropdown__toggle';
                    await page.waitForSelector(dropdownToggleSelector, { timeout: 5000 });
                    await page.click(dropdownToggleSelector);
                    await page.waitForSelector('ul.dropdown__menu', { visible: true, timeout: 5000 });
                    isDropdownOpen = true;
                } catch (e) {
                    console.error(`  ❌ ERROR: Could not open the Standards dropdown menu. ${e.message}`);
                    allTestsPassed = false;
                    link.type = 'skip'; 
                }
            }
            if (link.type === 'skip') continue;

            selector = `nav .navbar__items li.dropdown ul.dropdown__menu a.dropdown__link[href="${hrefForSelector}"]`;
            break;
        case 'footer':
            selector = `footer.footer a.footer__link-item[href="${hrefForSelector}"]`;
            break;
        default:
            console.error(`  ❌ ERROR: Unknown link type: ${link.type} for "${link.text}"`);
            allTestsPassed = false;
            continue; 
    }

    let actualHrefFromDOM = '';
    try {
      await page.waitForSelector(selector, { timeout: 7000 }); 
      actualHrefFromDOM = await page.$eval(selector, el => el.href); 

      const actualUrl = new URL(actualHrefFromDOM);
      const expectedUrl = new URL(expectedFullHref);
      let urlsMatch = false;

      if (actualUrl.protocol === 'http:' && actualUrl.hostname === 'localhost') {
        let normActualPath = actualUrl.pathname;
        const isActualAnchor = actualUrl.hash !== '';

        if (isActualAnchor) { /* no change for anchor */ }
        else if (expectTrailingSlashForCurrentEnv) {
            if (normActualPath !== '/' && !normActualPath.endsWith('/')) normActualPath += '/';
        } else {
            if (normActualPath !== '/' && normActualPath.endsWith('/')) normActualPath = normActualPath.slice(0, -1);
        }
        
        let normExpectedPath = expectedUrl.pathname;
        if (!expectTrailingSlashForCurrentEnv && !isActualAnchor && expectedUrl.pathname !== '/' && expectedUrl.pathname.endsWith('/')) {
            normExpectedPath = expectedUrl.pathname.slice(0, -1);
        }

        urlsMatch = normActualPath === normExpectedPath &&
                    actualUrl.search === expectedUrl.search &&
                    actualUrl.hash === expectedUrl.hash;
      } else {
        let normActualForCompare = actualHrefFromDOM;
        let normExpectedForCompare = expectedFullHref;
        const actualIsAnchor = actualUrl.hash !== '';
        const expectedIsAnchor = expectedUrl.hash !== '';
        const actualPathEndsSlash = actualUrl.pathname.endsWith('/') && actualUrl.pathname !== '/';
        const expectedPathEndsSlash = expectedUrl.pathname.endsWith('/') && expectedUrl.pathname !== '/';

        if (actualPathEndsSlash && !expectedPathEndsSlash && !actualIsAnchor && !expectedIsAnchor) {
            normExpectedForCompare = expectedFullHref + '/';
        } else if (!actualPathEndsSlash && expectedPathEndsSlash && !actualIsAnchor && !expectedIsAnchor) {
            normActualForCompare = actualHrefFromDOM + '/';
        }
        urlsMatch = normActualForCompare === normExpectedForCompare;
      }

      if (urlsMatch) {
        console.log(`  ✅ PASS: ${link.text} -> ${actualHrefFromDOM} (matches expected structure for ${expectedFullHref})`);
      } else {
        console.error(`  ❌ FAIL: ${link.text}`);
        console.error(`     Selector used: ${selector}`);
        console.error(`     Expected full URL structure: ${expectedFullHref}`);
        console.error(`     Actual href from DOM:      ${actualHrefFromDOM}`);
        if (actualUrl.protocol === 'http:' && actualUrl.hostname === 'localhost') {
             console.error(`     Compared Path (Actual from DOM):    ${new URL(actualHrefFromDOM).pathname} (Normalized for env: ${ (()=>{let p = new URL(actualHrefFromDOM).pathname; if(new URL(actualHrefFromDOM).hash !==''){return p;} if(expectTrailingSlashForCurrentEnv){if(p!=='/'&&!p.endsWith('/'))p+='/';}else{if(p!=='/'&&p.endsWith('/'))p=p.slice(0,-1);} return p;})() })`);
             console.error(`     Compared Path (Expected target):  ${expectedUrl.pathname} (Normalized for env: ${ (()=>{let p = expectedUrl.pathname; if(expectedUrl.hash !==''){return p;} if(!expectTrailingSlashForCurrentEnv && p !=='/' && p.endsWith('/')){p=p.slice(0,-1);} return p;})() })`);
        }
        allTestsPassed = false;
      }
    } catch (e) {
      console.error(`  ❌ ERROR: For "${link.text}", selector "${selector}" not found or other error. ${e.message}`);
      const screenshotPath = `failure-${currentEnv}-${link.text.replace(/\s+/g, '_')}.png`;
      await page.screenshot({ path: screenshotPath });
      console.error(`     Screenshot saved to: ${screenshotPath}`);
      const htmlPath = `failure-${currentEnv}-${link.text.replace(/\s+/g, '_')}.html`;
      fs.writeFileSync(htmlPath, await page.content());
      console.error(`     HTML dump saved to: ${htmlPath}`);
      allTestsPassed = false;
    }
  }

  await browser.close();
  return allTestsPassed;
}

// Main execution
const targetUrlArg = process.argv[2];
const docsEnvArg = process.argv[3];

if (!targetUrlArg || !docsEnvArg || !Object.values(DocsEnv).includes(docsEnvArg)) {
  console.error('Usage: node check-portal-homepage-links.mjs <targetUrl> <docsEnv>');
  console.error('docsEnv must be one of:', Object.values(DocsEnv).join(', '));
  process.exit(1);
}

checkLinks(targetUrlArg, docsEnvArg)
  .then(success => {
    if (success) {
      console.log('\nAll homepage link checks passed!');
      process.exit(0);
    } else {
      console.error('\nSome homepage link checks failed.');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error during link checking:', err);
    process.exit(1);
  });
