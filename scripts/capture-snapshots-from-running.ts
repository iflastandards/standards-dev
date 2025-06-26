#!/usr/bin/env tsx
/**
 * Capture snapshots from already running sites (assumes serve:all is running)
 * 
 * IMPORTANT: This is part of Phase 0 of the plan documented in:
 * /developer_notes/plan-revert-to-individual-configs.md
 * Re-read that plan after any auto-compact to maintain context!
 * 
 * Prerequisites:
 * 1. All sites built with: tsx scripts/build-all-for-baseline.ts
 * 2. All sites running with: pnpm serve:all
 */

import { chromium, Browser } from 'playwright';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createHash } from 'crypto';

// Site configuration matching serve:all ports
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
  url: string;
  metadata: {
    title: string;
    description: string;
    navbarTitle: string;
    footerText: string;
    baseUrl: string;
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
  contamination: {
    // Check for contamination indicators
    hasWrongTitle: boolean;
    hasWrongBranding: boolean;
    wrongTitleFound?: string;
    wrongBrandingFound?: string;
  };
}

class SnapshotCapture {
  private browser: Browser | null = null;
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), 'baseline-snapshots');
  }

  async initialize() {
    await fs.mkdir(this.baseDir, { recursive: true });
    
    this.browser = await chromium.launch({
      headless: false, // Keep visible so you can see what's happening
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async checkSiteAvailable(site: typeof SITES[0]): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:${site.port}`, {
        method: 'HEAD',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async captureSiteSnapshot(site: typeof SITES[0]): Promise<SiteSnapshot> {
    if (!this.browser) throw new Error('Browser not initialized');
    
    const url = site.key === 'portal'
      ? `http://localhost:${site.port}/`
      : `http://localhost:${site.port}/${site.key}/`;

    console.log(`Capturing ${site.key} from ${url}...`);
    
    const page = await this.browser.newPage();
    
    try {
      // Navigate to site
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000); // Extra wait for dynamic content

      // Capture metadata and check for contamination
      const metadata = await page.evaluate(() => {
        const getMetaContent = (name: string) => {
          const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
          return meta ? meta.getAttribute('content') || '' : '';
        };

        return {
          title: document.title,
          description: getMetaContent('description'),
          navbarTitle: document.querySelector('.navbar__title')?.textContent?.trim() || '',
          footerText: document.querySelector('footer')?.textContent?.trim() || '',
          baseUrl: document.querySelector('base')?.getAttribute('href') || '/',
        };
      });

      // Check for contamination
      const contamination = this.checkContamination(site.key, metadata);

      // Capture screenshots
      const screenshotDir = path.join(this.baseDir, 'local', site.key, 'screenshots');
      await fs.mkdir(screenshotDir, { recursive: true });

      // Desktop screenshot
      await page.setViewportSize({ width: 1920, height: 1080 });
      const desktopPath = path.join(screenshotDir, 'desktop.png');
      await page.screenshot({ path: desktopPath, fullPage: true });
      
      // Mobile screenshot
      await page.setViewportSize({ width: 375, height: 667 });
      const mobilePath = path.join(screenshotDir, 'mobile.png');
      await page.screenshot({ path: mobilePath, fullPage: true });

      // Capture DOM
      const html = await page.content();
      const checksum = createHash('sha256').update(html).digest('hex');
      
      const domPath = path.join(this.baseDir, 'local', site.key, 'dom.html');
      await fs.mkdir(path.dirname(domPath), { recursive: true });
      await fs.writeFile(domPath, html);

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

      const snapshot: SiteSnapshot = {
        site: site.key,
        timestamp: new Date().toISOString(),
        environment: 'local',
        url,
        metadata,
        screenshots: {
          desktop: path.relative(this.baseDir, desktopPath),
          mobile: path.relative(this.baseDir, mobilePath),
        },
        dom: {
          html: path.relative(this.baseDir, domPath),
          checksum,
        },
        resources,
        contamination,
      };

      return snapshot;
    } finally {
      await page.close();
    }
  }

  checkContamination(siteKey: string, metadata: any): SiteSnapshot['contamination'] {
    // Expected titles/branding for each site
    const expectedBranding: Record<string, { title: string; navbar: string }> = {
      portal: { title: 'IFLA Standards Portal', navbar: 'IFLA Standards' },
      ISBDM: { title: 'ISBD for Manifestation', navbar: 'ISBDM' },
      LRM: { title: 'Library Reference Model', navbar: 'LRM' },
      FRBR: { title: 'Functional Requirements', navbar: 'FRBR' },
      isbd: { title: 'International Standard Bibliographic Description', navbar: 'ISBD' },
      muldicat: { title: 'MulDiCat', navbar: 'MulDiCat' },
      unimarc: { title: 'UNIMARC', navbar: 'UNIMARC' },
    };

    const expected = expectedBranding[siteKey];
    if (!expected) {
      return { hasWrongTitle: false, hasWrongBranding: false };
    }

    const hasWrongTitle = !metadata.title.includes(expected.title);
    const hasWrongBranding = metadata.navbarTitle !== expected.navbar;

    return {
      hasWrongTitle,
      hasWrongBranding,
      wrongTitleFound: hasWrongTitle ? metadata.title : undefined,
      wrongBrandingFound: hasWrongBranding ? metadata.navbarTitle : undefined,
    };
  }

  async captureAll(sitesToCapture?: string[]) {
    const sites = sitesToCapture 
      ? SITES.filter(s => sitesToCapture.includes(s.key))
      : SITES;

    // Check all sites are available first
    console.log('Checking site availability...');
    for (const site of sites) {
      const available = await this.checkSiteAvailable(site);
      if (!available) {
        throw new Error(`Site ${site.key} is not available on port ${site.port}. Make sure 'pnpm serve:all' is running.`);
      }
      console.log(`✓ ${site.key} is available on port ${site.port}`);
    }

    const results: SiteSnapshot[] = [];
    let contaminationFound = false;

    for (const site of sites) {
      try {
        const snapshot = await this.captureSiteSnapshot(site);
        results.push(snapshot);

        // Check for contamination
        if (snapshot.contamination.hasWrongTitle || snapshot.contamination.hasWrongBranding) {
          contaminationFound = true;
          console.log(`❌ CONTAMINATION DETECTED in ${site.key}:`);
          if (snapshot.contamination.hasWrongTitle) {
            console.log(`   Wrong title: "${snapshot.contamination.wrongTitleFound}"`);
          }
          if (snapshot.contamination.hasWrongBranding) {
            console.log(`   Wrong navbar: "${snapshot.contamination.wrongBrandingFound}"`);
          }
        } else {
          console.log(`✓ ${site.key} appears clean`);
        }

        // Save individual snapshot
        const snapshotPath = path.join(this.baseDir, 'local', site.key, 'snapshot.json');
        await fs.writeFile(snapshotPath, JSON.stringify(snapshot, null, 2));

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
      contaminationDetected: contaminationFound,
      sites: results.map(r => ({
        site: r.site,
        checksum: r.dom.checksum,
        priority: SITES.find(s => s.key === r.site)?.priority || false,
        contaminated: r.contamination.hasWrongTitle || r.contamination.hasWrongBranding,
      })),
    };

    await fs.writeFile(
      path.join(this.baseDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    return { results, contaminationFound };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const sitesToCapture = args.length > 0 ? args : undefined;

  const capture = new SnapshotCapture();

  try {
    await capture.initialize();

    console.log('🔍 Starting baseline capture from running sites...\n');
    
    const { results, contaminationFound } = await capture.captureAll(sitesToCapture);

    console.log('\n' + '='.repeat(50));
    console.log('BASELINE CAPTURE COMPLETE');
    console.log('='.repeat(50));
    console.log(`Captured ${results.length} site baselines`);
    console.log(`Output directory: baseline-snapshots/`);
    
    if (contaminationFound) {
      console.log('\n⚠️  CONTAMINATION DETECTED - This confirms the bug exists!');
      console.log('   The baseline shows current contamination state.');
      console.log('   After migration, we should see clean results.');
    } else {
      console.log('\n✓ No contamination detected in current build');
    }

    // Show priority site status
    const prioritySites = results.filter(r => 
      SITES.find(s => s.key === r.site)?.priority
    );
    
    if (prioritySites.length > 0) {
      console.log('\n📋 Priority sites captured:');
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

if (require.main === module) {
  main();
}

export { SnapshotCapture };