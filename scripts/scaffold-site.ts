#!/usr/bin/env tsx
/**
 * Site Scaffolding Script for IFLA Standards
 * 
 * Creates a complete new site using the proven template that eliminates contamination.
 * Supports both shared-config and individual config approaches.
 * 
 * Usage:
 *   pnpm tsx scripts/scaffold-site.ts --siteKey=mysite --title="My Site" --tagline="My tagline"
 *   pnpm tsx scripts/scaffold-site.ts --preset=standard --siteKey=mysite --title="My Site" --tagline="My tagline"
 *   pnpm tsx scripts/scaffold-site.ts --preset=individual --siteKey=mysite --title="My Site" --tagline="My tagline"
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { SITE_TEMPLATE, SITE_PRESETS, type SiteTemplateConfig } from './site-template';

interface ScaffoldOptions {
  siteKey: string;
  title: string;
  tagline: string;
  preset?: 'standard' | 'minimal';
  port?: number;
  force?: boolean; // Overwrite existing site
  dryRun?: boolean; // Show what would be created without creating
}

// Get next available port
function getNextAvailablePort(): number {
  const USED_PORTS = [3000, 3001, 3002, 3003, 3004, 3005, 3006];
  return Math.max(...USED_PORTS) + 1;
}

// Validate site key
function validateSiteKey(siteKey: string): void {
  if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(siteKey)) {
    throw new Error('Site key must start with a letter and contain only letters, numbers, and hyphens');
  }
  
  if (siteKey.length > 20) {
    throw new Error('Site key must be 20 characters or less');
  }
}

// Check if site already exists
async function siteExists(siteKey: string): Promise<boolean> {
  try {
    await fs.access(path.join('standards', siteKey));
    return true;
  } catch {
    return false;
  }
}

// Create directory structure
async function createDirectoryStructure(siteKey: string, dryRun: boolean = false): Promise<void> {
  const basePath = path.join('standards', siteKey);
  
  const directories = [
    basePath,
    path.join(basePath, 'src', 'css'),
    path.join(basePath, 'src', 'components'),
    path.join(basePath, 'src', 'pages'),
    path.join(basePath, 'docs'),
    path.join(basePath, 'docs', 'getting-started'),
    path.join(basePath, 'blog'),
    path.join(basePath, 'static', 'img'),
    path.join(basePath, 'static', 'data'),
  ];

  console.log('📁 Creating directory structure...');
  
  for (const dir of directories) {
    if (dryRun) {
      console.log(`   📁 Would create: ${dir}`);
    } else {
      await fs.mkdir(dir, { recursive: true });
      console.log(`   ✅ Created: ${dir}`);
    }
  }
}

// Create file from template
async function createFileFromTemplate(
  filePath: string, 
  content: string, 
  dryRun: boolean = false
): Promise<void> {
  if (dryRun) {
    console.log(`   📄 Would create: ${filePath}`);
    console.log(`       Content length: ${content.length} characters`);
  } else {
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`   ✅ Created: ${filePath}`);
  }
}

// Update SITE_CONFIG if using shared-config
async function updateSiteConfig(config: SiteTemplateConfig, dryRun: boolean = false): Promise<void> {
  // Always skip SITE_CONFIG update since we're using individual configs
  console.log('   ℹ️  Individual config - skipping SITE_CONFIG update');
  return;

  const siteConfigPath = 'libs/shared-config/src/lib/siteConfig.ts';
  
  if (dryRun) {
    console.log(`   📝 Would update: ${siteConfigPath}`);
    console.log(`       Add site key: ${config.siteKey}`);
    console.log(`       Add port: ${config.port}`);
    return;
  }

  try {
    const content = await fs.readFile(siteConfigPath, 'utf-8');
    
    // Check if site already exists in config
    if (content.includes(`${config.siteKey}:`)) {
      console.log(`   ⚠️  Site ${config.siteKey} already exists in SITE_CONFIG`);
      return;
    }

    // Find the position to insert the new site config
    const typeDefMatch = content.match(/export type SiteKey = ([^;]+);/);
    if (!typeDefMatch) {
      throw new Error('Could not find SiteKey type definition');
    }

    // Add to SiteKey type
    const currentTypes = typeDefMatch?.[1] || '';
    const newTypes = currentTypes.replace(/'/g, '').replace(/ \| $/, '') + ` | '${config.siteKey}'`;
    let updatedContent = content.replace(
      /export type SiteKey = [^;]+;/,
      `export type SiteKey = ${newTypes};`
    );

    // Add to SITE_CONFIG object
    const newSiteConfig = `  ${config.siteKey}: {
    local: { url: 'http://localhost:${config.port}', baseUrl: '/${config.siteKey}/', port: ${config.port} },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/${config.siteKey}/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/${config.siteKey}/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/${config.siteKey}/' },
  },`;

    // Insert before the closing brace of SITE_CONFIG
    updatedContent = updatedContent.replace(
      /};(\s*$)/m,
      `${newSiteConfig}\n};$1`
    );

    await fs.writeFile(siteConfigPath, updatedContent, 'utf-8');
    console.log(`   ✅ Updated: ${siteConfigPath}`);
    
  } catch (error) {
    console.error(`   ❌ Failed to update SITE_CONFIG: ${error}`);
    throw error;
  }
}

// Update package.json scripts
async function updatePackageJsonScripts(config: SiteTemplateConfig, dryRun: boolean = false): Promise<void> {
  const packageJsonPath = 'package.json';
  
  if (dryRun) {
    console.log(`   📝 Would update: ${packageJsonPath}`);
    console.log(`       Add build:${config.siteKey.toLowerCase()}`);
    console.log(`       Add start:${config.siteKey.toLowerCase()}`);
    console.log(`       Add serve:${config.siteKey.toLowerCase()}`);
    return;
  }

  try {
    const content = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(content);

    // Add new scripts following the existing pattern
    packageJson.scripts[`build:${config.siteKey.toLowerCase()}`] = `nx build ${config.siteKey.toLowerCase()}`;
    packageJson.scripts[`start:${config.siteKey.toLowerCase()}`] = `pnpm stop:${config.siteKey.toLowerCase()} && DOCS_ENV=local docusaurus start standards/${config.siteKey} --port ${config.port}`;
    packageJson.scripts[`serve:${config.siteKey.toLowerCase()}`] = `pnpm stop:${config.siteKey.toLowerCase()} && docusaurus serve standards/${config.siteKey} --port ${config.port}`;
    packageJson.scripts[`clear:${config.siteKey.toLowerCase()}`] = `docusaurus clear standards/${config.siteKey}`;
    packageJson.scripts[`stop:${config.siteKey.toLowerCase()}`] = `lsof -ti:${config.port} | xargs kill -9 2>/dev/null || true`;

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
    console.log(`   ✅ Updated: ${packageJsonPath}`);
    
  } catch (error) {
    console.error(`   ❌ Failed to update package.json: ${error}`);
    throw error;
  }
}

// Main scaffolding function
async function scaffoldSite(options: ScaffoldOptions): Promise<void> {
  const { siteKey, title, tagline, preset = 'standard', port, force = false, dryRun = false } = options;

  console.log('🏗️  IFLA Standards Site Scaffolding');
  console.log('=====================================');
  console.log(`Site Key: ${siteKey}`);
  console.log(`Title: ${title}`);
  console.log(`Tagline: ${tagline}`);
  console.log(`Preset: ${preset}`);
  console.log(`Dry Run: ${dryRun ? 'Yes' : 'No'}`);
  console.log('');

  // Validate inputs
  validateSiteKey(siteKey);

  // Check if site exists
  if (await siteExists(siteKey) && !force) {
    throw new Error(`Site '${siteKey}' already exists. Use --force to overwrite.`);
  }

  // Create configuration
  const config: SiteTemplateConfig = {
    ...SITE_PRESETS[preset](siteKey, title, tagline),
    port: port || getNextAvailablePort(),
  };

  console.log(`Configuration: Individual Config`);
  console.log(`Port: ${config.port}`);
  console.log('');

  // Create directory structure
  await createDirectoryStructure(siteKey, dryRun);

  // Create project.json for NX
  console.log('⚙️  Creating project.json...');
  await createFileFromTemplate(
    path.join('standards', siteKey, 'project.json'),
    JSON.stringify(SITE_TEMPLATE.projectJsonTemplate(config), null, 2),
    dryRun
  );

  // Create docusaurus.config.ts (individual config only)
  console.log('⚙️  Creating docusaurus.config.ts...');
  await createFileFromTemplate(
    path.join('standards', siteKey, 'docusaurus.config.ts'),
    SITE_TEMPLATE.individualConfigTemplate(config),
    dryRun
  );

  // Create sidebars.ts
  console.log('📋 Creating sidebars.ts...');
  await createFileFromTemplate(
    path.join('standards', siteKey, 'sidebars.ts'),
    SITE_TEMPLATE.sidebarsTemplate(),
    dryRun
  );

  // Create CSS
  console.log('🎨 Creating custom.css...');
  await createFileFromTemplate(
    path.join('standards', siteKey, 'src', 'css', 'custom.css'),
    SITE_TEMPLATE.customCssTemplate(config),
    dryRun
  );

  // Create documentation
  console.log('📚 Creating documentation...');
  await createFileFromTemplate(
    path.join('standards', siteKey, 'docs', 'intro.md'),
    SITE_TEMPLATE.introDocTemplate(config),
    dryRun
  );

  await createFileFromTemplate(
    path.join('standards', siteKey, 'docs', 'getting-started', 'overview.md'),
    SITE_TEMPLATE.gettingStartedTemplate(config),
    dryRun
  );

  // Create blog files if blog is enabled
  if (config.features?.enableBlog !== false) {
    console.log('📝 Creating blog...');
    await createFileFromTemplate(
      path.join('standards', siteKey, 'blog', 'authors.yml'),
      SITE_TEMPLATE.blogAuthorsTemplate(config),
      dryRun
    );
    
    const blogFileName = `${new Date().toISOString().split('T')[0]}-welcome-to-${siteKey.toLowerCase()}-blog.md`;
    await createFileFromTemplate(
      path.join('standards', siteKey, 'blog', blogFileName),
      SITE_TEMPLATE.blogWelcomeTemplate(config),
      dryRun
    );
  }

  // No shared config updates needed - using individual configs

  // Update package.json scripts
  console.log('📝 Updating package.json scripts...');
  await updatePackageJsonScripts(config, dryRun);

  console.log('');
  console.log('🎉 Site scaffolding complete!');
  console.log('');
  console.log('Next steps:');
  console.log(`1. Run: pnpm install`);
  console.log(`2. Start your site: pnpm start:${siteKey.toLowerCase()}`);
  console.log(`3. Open: http://localhost:${config.port}/${siteKey}/`);
  console.log('');
  console.log('Individual configs eliminate contamination automatically!');
}

// CLI interface
function parseArgs(): ScaffoldOptions {
  const args = process.argv.slice(2);
  const options: Partial<ScaffoldOptions> = {};

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      if (value) {
        switch (key) {
          case 'siteKey':
            options.siteKey = value;
            break;
          case 'title':
            options.title = value;
            break;
          case 'tagline':
            options.tagline = value;
            break;
          case 'preset':
            options.preset = value as 'standard' | 'minimal';
            break;
          case 'port':
            options.port = parseInt(value, 10);
            break;
        }
      } else {
        switch (key) {
          case 'force':
            options.force = true;
            break;
          case 'dry-run':
            options.dryRun = true;
            break;
        }
      }
    }
  }

  if (!options.siteKey || !options.title || !options.tagline) {
    console.log('Usage: pnpm tsx scripts/scaffold-site.ts --siteKey=mysite --title="My Site" --tagline="My tagline"');
    console.log('');
    console.log('Options:');
    console.log('  --siteKey=<key>        Site key (required)');
    console.log('  --title="<title>"      Site title (required)');
    console.log('  --tagline="<tagline>"  Site tagline (required)');
    console.log('  --preset=<preset>      Preset: standard|minimal|individual (default: standard)');
    console.log('  --port=<port>          Port number (auto-assigned if not provided)');
    console.log('  --force                Overwrite existing site');
    console.log('  --dry-run              Show what would be created without creating');
    console.log('');
    console.log('Examples:');
    console.log('  pnpm tsx scripts/scaffold-site.ts --siteKey=newsite --title="New Site" --tagline="A new standard"');
    console.log('  pnpm tsx scripts/scaffold-site.ts --preset=individual --siteKey=newsite --title="New Site" --tagline="A new standard"');
    console.log('  pnpm tsx scripts/scaffold-site.ts --dry-run --siteKey=newsite --title="New Site" --tagline="A new standard"');
    process.exit(1);
  }

  return options as ScaffoldOptions;
}

// Main execution
if (require.main === module) {
  const options = parseArgs();
  
  scaffoldSite(options)
    .then(() => {
      console.log('✅ Scaffolding completed successfully!');
    })
    .catch((error) => {
      console.error('❌ Scaffolding failed:', error.message);
      process.exit(1);
    });
}