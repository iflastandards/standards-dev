#!/usr/bin/env node

/**
 * Optimized build script using Nx caching capabilities
 * This replaces the manual concurrency management in package.json
 */

const { execSync } = require('child_process');

// Simple color functions to replace chalk
const colors = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

function runCommand(command, description) {
  console.log(colors.blue(`🚀 ${description}...`));
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(colors.green(`✅ ${description} completed`));
  } catch (error) {
    console.error(colors.red(`❌ ${description} failed`));
    process.exit(1);
  }
}

function main() {
  console.log(colors.bold(colors.cyan('IFLA Standards - Nx Optimized Build\n')));

  // List of projects to build in order
  // Build theme first, then each site individually to avoid Node.js module caching contamination
  const projects = [
    '@ifla/theme',
    'standards-cli',
    'portal',
    'frbr',
    'isbd', 
    'lrm',
    'isbdm',
    'unimarc',
    'muldicat'
  ];

  // Build each project individually with --skip-nx-cache to prevent contamination
  for (const project of projects) {
    runCommand(
      `nx build ${project} --skip-nx-cache`,
      `Building ${project}`
    );
  }

  console.log(colors.bold(colors.green('\n🎉 All builds completed successfully with proper isolation!')));
}

if (require.main === module) {
  main();
}

module.exports = { runCommand };
