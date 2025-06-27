#!/usr/bin/env tsx
/**
 * Generate individual docusaurus.config.ts for an existing site
 * Reads configuration from standards/{siteKey}/site-config.json
 */

import { SITE_TEMPLATE, type SiteTemplateConfig } from './site-template';
import * as fs from 'fs';
import * as path from 'path';

const siteKey = process.argv[2];
if (!siteKey) {
  console.log('Usage: tsx scripts/generate-individual-config.ts <siteKey>');
  console.log('Example: tsx scripts/generate-individual-config.ts unimarc');
  console.log('');
  console.log('This will look for standards/{siteKey}/site-config.json');
  process.exit(1);
}

// Load site configuration from JSON file
function loadSiteConfig(siteKey: string): SiteTemplateConfig {
  const configPath = path.join('standards', siteKey, 'site-config.json');
  
  if (!fs.existsSync(configPath)) {
    console.error(`❌ Configuration file not found: ${configPath}`);
    console.error('Please create a site-config.json file for this site.');
    process.exit(1);
  }

  try {
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    // Merge with defaults and site key
    const config: SiteTemplateConfig = {
      siteKey,
      // Use smart defaults
      title: configData.title || siteKey.toUpperCase(),
      tagline: configData.tagline || `${siteKey} documentation`,
      organizationName: configData.organizationName || 'iflastandards',
      projectName: configData.projectName || siteKey,
      // Features
      features: configData.features || {},
      navbar: configData.navbar || {},
      buildConfig: configData.buildConfig || {},
      // Vocabulary with smart defaults
      vocabulary: configData.vocabulary ? {
        prefix: configData.vocabulary.prefix || siteKey.toLowerCase(),
        numberPrefix: configData.vocabulary.numberPrefix || 'T',
        profile: configData.vocabulary.profile || `${siteKey}-values-profile.csv`,
        elementUri: configData.vocabulary.elementUri || `https://www.iflastandards.info/${siteKey}/elements`,
        elementProfile: configData.vocabulary.elementProfile || `${siteKey}-elements-profile.csv`,
      } : undefined,
    };

    return config;
  } catch (error) {
    console.error(`❌ Error reading configuration file: ${configPath}`);
    console.error(error);
    process.exit(1);
  }
}

const config = loadSiteConfig(siteKey);

console.log('='.repeat(80));
console.log(`Individual docusaurus.config.ts for ${siteKey}:`);
console.log('='.repeat(80));
console.log(SITE_TEMPLATE.individualConfigTemplate(config));