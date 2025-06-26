#!/usr/bin/env tsx
/**
 * Capture baseline snapshots of all sites for validation during migration
 * 
 * IMPORTANT: This is part of Phase 0 of the plan documented in:
 * /developer_notes/plan-revert-to-individual-configs.md
 * Re-read that plan after any auto-compact to maintain context!
 * 
 * This script:
 * 1. Builds each site in LOCAL mode (better for contamination testing)
 * 2. Serves the built site locally on dedicated ports
 * 3. Uses Playwright to capture comprehensive snapshots
 * 4. Stores snapshots for later comparison during migration
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';
import { createHash } from 'crypto';
import express from 'express';
import { Server } from 'http';

// Site configuration - using actual local ports from package.json
const SITES = [
  { key: 'portal', port: 3000, priority: true },
  { key: 'ISBDM', port: 3001, priority: true },
  { key: 'LRM', port: 3002, priority: false },
  { key: 'FRBR', port: 3003, priority: false },
  { key: 'isbd', port: 3004, priority: false },
  { key: 'muldicat', port: 3005, priority: false },
  { key: 'unimarc', port: 3006, priority: false },
];

interface SiteSnapshot {
  site: string;
  timestamp: string;
  environment: string;
  metadata: {
    title: string;
    description: string;
    url: string;
    baseUrl: string;
    navbarTitle: string;
    footerText: string;
  };
  screenshots: {
    desktop: string;
    mobile: string;
  };
  dom: {
    html: string;
    checksum: string;
  };
  resources: {
    css: string[];
    js: string[];
    images: string[];
  };
  criticalElements: {
    metaTags: Record<string, string>;
    links: Array<{ href: string; text: string }>;
    headers: string[];
  };
}

class BaselineCapture {
  private browser: Browser | null = null;
  private servers: Map<string, Server> = new Map();
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), 'baseline-snapshots');
  }

  async initialize() {
    // Create baseline directory
    await fs.mkdir(this.baseDir, { recursive: true });
    
    // Kill any existing processes on our ports
    await this.killExistingProcesses();
    
    // Launch browser
    this.browser = await chromium.launch({
      headless: true,
    });
  }

  async killExistingProcesses() {
    console.log('Killing any existing processes on target ports...');
    const ports = SITES.map(s => s.port).join(',');
    
    try {
      // Kill processes using lsof (similar to package.json stop scripts)
      execSync(`lsof -ti:${ports} | xargs kill -9 2>/dev/null || true`, {
        stdio: 'inherit',
      });
      
      // Also kill any docusaurus processes
      execSync(`pkill -f 'docusaurus start' 2>/dev/null || true`, {
        stdio: 'inherit',
      });
      
      // Wait a moment for processes to clean up
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('✓ Cleaned up existing processes');
    } catch (error) {
      console.log('No existing processes to kill (this is normal)');
    }
  }

  async cleanup() {
    // Close browser
    if (this.browser) {
      await this.browser.close();
    }

    // Stop all servers
    for (const [site, server] of this.servers) {
      await new Promise<void>((resolve) => {
        server.close(() => {
          console.log(`Stopped server for ${site}`);
          resolve();
        });
      });
    }
  }

  async buildSite(siteKey: string) {
    console.log(`Building ${siteKey} using standard package scripts...`);
    
    try {
      // Use the standard build command from package.json with cache skipping
      const buildCommand = `build:${siteKey.toLowerCase()} --skip-nx-cache`;
      
      execSync(`pnpm ${buildCommand}`, {
        stdio: 'inherit',
        env: { ...process.env, DOCS_ENV: 'local' },
      });
      
      console.log(`✓ Built ${siteKey} successfully`);
    } catch (error) {
      console.error(`✗ Failed to build ${siteKey}:`, error);
      throw error;
    }
  }

  async serveSite(siteKey: string, site: typeof SITES[0]): Promise<string> {
    const app = express();
    
    // Determine build directory
    const buildDir = siteKey === 'portal'
      ? path.join(process.cwd(), 'portal', 'build')
      : path.join(process.cwd(), 'standards', siteKey, 'build');
    
    // For non-portal sites, we need to serve from the baseUrl path
    if (siteKey === 'portal') {
      // Portal serves from root
      app.use(express.static(buildDir));
      app.get('*', (req, res) => {
        res.sendFile(path.join(buildDir, 'index.html'));
      });
    } else {
      // Standard sites serve from /{siteKey}/ path
      app.use(`/${siteKey}/`, express.static(buildDir));
      app.get(`/${siteKey}/*`, (req, res) => {
        res.sendFile(path.join(buildDir, 'index.html'));
      });
      // Redirect root to the site path
      app.get('/', (req, res) => {
        res.redirect(`/${siteKey}/`);
      });
    }
    
    // Start server on the actual intended port
    return new Promise((resolve) => {
      const server = app.listen(site.port, () => {
        console.log(`Serving ${siteKey} on http://localhost:${site.port}`);
        this.servers.set(siteKey, server);
        
        // Return the actual URL that matches the site's configuration
        const url = siteKey === 'portal'
          ? `http://localhost:${site.port}/`
          : `http://localhost:${site.port}/${siteKey}/`;
        
        resolve(url);
      });
    });
  }

  async captureSiteSnapshot(siteKey: string, url: string): Promise<SiteSnapshot> {
    if (!this.browser) throw new Error('Browser not initialized');
    
    const page = await this.browser.newPage();
    const snapshot: Partial<SiteSnapshot> = {
      site: siteKey,
      timestamp: new Date().toISOString(),
      environment: 'local',
    };

    try {
      // Navigate to site
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000); // Extra wait for dynamic content

      // Capture metadata
      snapshot.metadata = await page.evaluate(() => {
        const getMetaContent = (name: string) => {
          const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
          return meta?.getAttribute('content') || '';
        };

        return {
          title: document.title,
          description: getMetaContent('description'),
          url: window.location.href,
          baseUrl: document.querySelector('base')?.getAttribute('href') || '/',
          navbarTitle: document.querySelector('.navbar__title')?.textContent || '',
          footerText: document.querySelector('footer')?.textContent?.trim() || '',
        };
      });

      // Capture screenshots
      const screenshotDir = path.join(this.baseDir, 'local', siteKey, 'screenshots');
      await fs.mkdir(screenshotDir, { recursive: true });

      // Desktop screenshot
      await page.setViewportSize({ width: 1920, height: 1080 });
      const desktopPath = path.join(screenshotDir, 'desktop.png');
      await page.screenshot({ path: desktopPath, fullPage: true });
      
      // Mobile screenshot
      await page.setViewportSize({ width: 375, height: 667 });
      const mobilePath = path.join(screenshotDir, 'mobile.png');
      await page.screenshot({ path: mobilePath, fullPage: true });

      snapshot.screenshots = {
        desktop: path.relative(this.baseDir, desktopPath),
        mobile: path.relative(this.baseDir, mobilePath),
      };

      // Capture DOM
      const html = await page.content();
      const checksum = createHash('sha256').update(html).digest('hex');
      
      const domPath = path.join(this.baseDir, 'local', siteKey, 'dom.html');
      await fs.mkdir(path.dirname(domPath), { recursive: true });
      await fs.writeFile(domPath, html);

      snapshot.dom = {
        html: path.relative(this.baseDir, domPath),
        checksum,
      };

      // Capture resources
      const resources = await page.evaluate(() => {
        const getResourceUrls = (selector: string, attr: string) => {
          return Array.from(document.querySelectorAll(selector))
            .map(el => el.getAttribute(attr))
            .filter(Boolean) as string[];
        };

        return {
          css: getResourceUrls('link[rel="stylesheet"]', 'href'),
          js: getResourceUrls('script[src]', 'src'),
          images: getResourceUrls('img', 'src'),
        };
      });
      snapshot.resources = resources;

      // Capture critical elements
      const criticalElements = await page.evaluate(() => {
        // Meta tags
        const metaTags: Record<string, string> = {};
        document.querySelectorAll('meta[name], meta[property]').forEach(meta => {
          const name = meta.getAttribute('name') || meta.getAttribute('property');
          const content = meta.getAttribute('content');
          if (name && content) {
            metaTags[name] = content;
          }
        });

        // Links
        const links = Array.from(document.querySelectorAll('a[href]')).map(link => ({
          href: link.getAttribute('href') || '',
          text: link.textContent?.trim() || '',
        }));

        // Headers
        const headers = Array.from(document.querySelectorAll('h1, h2, h3'))
          .map(h => h.textContent?.trim() || '');

        return { metaTags, links, headers };
      });
      snapshot.criticalElements = criticalElements;

      return snapshot as SiteSnapshot;
    } finally {
      await page.close();
    }
  }

  async captureBaselines(sitesToCapture?: string[]) {
    const sites = sitesToCapture 
      ? SITES.filter(s => sitesToCapture.includes(s.key))
      : SITES;

    const results: SiteSnapshot[] = [];

    for (const site of sites) {
      try {
        console.log(`\n${'='.repeat(50)}`);
        console.log(`Processing ${site.key}...`);
        console.log('='.repeat(50));

        // Build site
        await this.buildSite(site.key);

        // Serve site
        const url = await this.serveSite(site.key, site);

        // Capture snapshot
        const snapshot = await this.captureSiteSnapshot(site.key, url);
        results.push(snapshot);

        // Save individual snapshot
        const snapshotPath = path.join(
          this.baseDir,
          'local',
          site.key,
          'snapshot.json'
        );
        await fs.writeFile(
          snapshotPath,
          JSON.stringify(snapshot, null, 2)
        );

        console.log(`✓ Captured baseline for ${site.key}`);
      } catch (error) {
        console.error(`✗ Failed to capture ${site.key}:`, error);
        if (site.priority) {
          throw error; // Fail fast for priority sites
        }
      }
    }

    // Save manifest
    const manifest = {
      timestamp: new Date().toISOString(),
      environment: 'local',
      sites: results.map(r => ({
        site: r.site,
        checksum: r.dom.checksum,
        priority: SITES.find(s => s.key === r.site)?.priority || false,
      })),
    };

    await fs.writeFile(
      path.join(this.baseDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    return results;
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const sitesToCapture = args.length > 0 ? args : undefined;

  const capture = new BaselineCapture();

  try {
    await capture.initialize();

    if (sitesToCapture) {
      console.log(`Capturing baselines for: ${sitesToCapture.join(', ')}`);
    } else {
      console.log('Capturing baselines for all sites...');
    }

    const results = await capture.captureBaselines(sitesToCapture);

    console.log('\n' + '='.repeat(50));
    console.log('BASELINE CAPTURE COMPLETE');
    console.log('='.repeat(50));
    console.log(`Captured ${results.length} site baselines`);
    console.log(`Output directory: baseline-snapshots/`);
    
    // Show priority site status
    const prioritySites = results.filter(r => 
      SITES.find(s => s.key === r.site)?.priority
    );
    
    if (prioritySites.length > 0) {
      console.log('\nPriority sites captured:');
      prioritySites.forEach(site => {
        console.log(`  - ${site.site}: ${site.metadata.title}`);
      });
    }

  } catch (error) {
    console.error('Baseline capture failed:', error);
    process.exit(1);
  } finally {
    await capture.cleanup();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { BaselineCapture };