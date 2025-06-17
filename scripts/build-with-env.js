#!/usr/bin/env node

const { execSync } = require('child_process');
const { program } = require('commander');
const inquirer = require('inquirer').default;

const validEnvironments = ['localhost', 'preview', 'production'];
const validSites = ['all', 'portal', 'isbdm', 'lrm', 'frbr', 'isbd', 'muldicat', 'unimarc'];

program
  .option('--env <environment>', 'Environment to build for')
  .option('--site <site>', 'Site to build')
  .option('--clean-theme', 'Clean and rebuild the theme package before building')
  .parse(process.argv);

async function main() {
  const options = program.opts();
  let { env, site, cleanTheme } = options;

  // If no environment provided, ask user to select
  if (!env) {
    const envAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'environment',
        message: 'Select build environment:',
        choices: validEnvironments,
        default: 'localhost'
      }
    ]);
    env = envAnswer.environment;
  }

  // If no site provided, ask user to select
  if (!site) {
    const siteAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'site',
        message: 'Select site to build:',
        choices: validSites,
        default: 'all'
      }
    ]);
    site = siteAnswer.site;
  }

  // If clean theme option not specified via CLI, ask user
  if (cleanTheme === undefined) {
    const cleanAnswer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'cleanTheme',
        message: 'Clean and rebuild theme package before building?',
        default: false
      }
    ]);
    cleanTheme = cleanAnswer.cleanTheme;
  }
  
  // Default cleanTheme to false if still undefined
  if (cleanTheme === undefined) {
    cleanTheme = false;
  }

  // Validate environment
  if (!validEnvironments.includes(env)) {
    console.error(`Invalid environment: ${env}. Must be one of: ${validEnvironments.join(', ')}`);
    process.exit(1);
  }

  // Validate site
  if (!validSites.includes(site.toLowerCase())) {
    console.error(`Invalid site: ${site}. Must be one of: ${validSites.join(', ')}`);
    process.exit(1);
  }

  // Clean and rebuild theme if requested
  if (cleanTheme) {
    console.log('\nCleaning and rebuilding theme package...');
    try {
      execSync('rm -rf packages/theme/dist', { stdio: 'inherit' });
      execSync('pnpm --filter @ifla/theme build', { stdio: 'inherit' });
      console.log('Theme package rebuilt successfully.');
    } catch (error) {
      console.error('Failed to rebuild theme package.');
      process.exit(1);
    }
  }

  // Build command
  const buildScript = site === 'all' ? 'build:all' : `build:${site.toLowerCase()}`;

  console.log(`\nBuilding ${site} for ${env} environment...`);

  try {
    // Set the environment variable and run the build
    execSync(`pnpm run ${buildScript}`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        DOCS_ENV: env
      }
    });
    console.log(`\nSuccessfully built ${site} for ${env} environment.`);
  } catch (error) {
    console.error(`\nBuild failed for ${site} in ${env} environment.`);
    process.exit(1);
  }
}

main().catch(console.error);