#!/usr/bin/env tsx
/**
 * Generate individual docusaurus.config.ts for an existing site
 */

import { SITE_TEMPLATE, type SiteTemplateConfig } from './site-template';

const siteKey = process.argv[2];
if (!siteKey) {
  console.log('Usage: tsx scripts/generate-individual-config.ts <siteKey>');
  console.log('Example: tsx scripts/generate-individual-config.ts unimarc');
  process.exit(1);
}

// Default config for unimarc
const config: SiteTemplateConfig = {
  siteKey: siteKey,
  title: siteKey === 'unimarc' ? 'UNIMARC' : siteKey.toUpperCase(),
  tagline: siteKey === 'unimarc' ? 'Universal MARC Format' : `${siteKey} documentation`,
  port: siteKey === 'unimarc' ? 3006 : 3007,
  organizationName: 'iflastandards',
  projectName: siteKey,
};

console.log('='.repeat(80));
console.log(`Individual docusaurus.config.ts for ${siteKey}:`);
console.log('='.repeat(80));
console.log(SITE_TEMPLATE.individualConfigTemplate(config));