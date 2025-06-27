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
    throw new Error(`Configuration file not found: ${configPath}`);
  }

  try {
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    const config: SiteTemplateConfig = {
      siteKey,
      title:          configData.title          ?? siteKey.toUpperCase(),
      tagline:        configData.tagline        ?? `${siteKey} documentation`,
      organizationName: configData.organizationName ?? 'iflastandards',
      projectName:      configData.projectName      ?? siteKey,
      features:      configData.features      ?? {},
      navbar:        configData.navbar        ?? {},
      buildConfig:   configData.buildConfig   ?? {},
      vocabulary:    configData.vocabulary && {
        prefix:        configData.vocabulary.prefix        ?? siteKey.toLowerCase(),
        numberPrefix:  configData.vocabulary.numberPrefix  ?? 'T',
        profile:       configData.vocabulary.profile       ?? `${siteKey}-values-profile.csv`,
        elementUri:    configData.vocabulary.elementUri    ?? `https://www.iflastandards.info/${siteKey}/elements`,
        elementProfile:configData.vocabulary.elementProfile?? `${siteKey}-elements-profile.csv`,
      },
    };

    return config;
  } catch (err) {
    throw new Error(
      `Error reading configuration file: ${configPath}\n${err instanceof Error ? err.message : String(err)}`
    );
  }
}

const config = loadSiteConfig(siteKey);

console.log('='.repeat(80));
console.log(`Individual docusaurus.config.ts for ${siteKey}:`);
console.log('='.repeat(80));
console.log(SITE_TEMPLATE.individualConfigTemplate(config));
