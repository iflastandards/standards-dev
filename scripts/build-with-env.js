#!/usr/bin/env node

const { execSync } = require('child_process');
const { program } = require('commander');
const inquirer = require('inquirer').default;

const validEnvironments = ['localhost', 'preview', 'production'];
const validSites = ['all', 'portal', 'isbdm', 'lrm', 'frbr', 'isbd', 'muldicat', 'unimarc'];

program
  .option('--env <environment>', 'Environment to build for')
  .option('--site <site>', 'Site to build')
  .option('--clean-packages', 'Clean and rebuild theme and preset packages before building')
  .option('--clean-theme', 'Clean and rebuild the theme package before building')
  .option('--clean-preset', 'Clean and rebuild the preset package before building')
  .parse(process.argv);

async function main() {
  const options = program.opts();
  let { env, site, cleanPackages, cleanTheme, cleanPreset } = options;

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

  // If clean options not specified via CLI, ask user
  if (cleanPackages === undefined && cleanTheme === undefined && cleanPreset === undefined) {
    const cleanAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'cleanOption',
        message: 'Clean packages before building?',
        choices: [
          { name: 'No cleaning', value: 'none' },
          { name: 'Clean both theme and preset packages', value: 'packages' },
          { name: 'Clean theme package only', value: 'theme' },
          { name: 'Clean preset package only', value: 'preset' }
        ],
        default: 'none'
      }
    ]);
    
    switch (cleanAnswer.cleanOption) {
      case 'packages':
        cleanPackages = true;
        break;
      case 'theme':
        cleanTheme = true;
        break;
      case 'preset':
        cleanPreset = true;
        break;
      default:
        // none - leave all as undefined/false
        break;
    }
  }
  
  // Default clean options to false if still undefined
  cleanPackages = cleanPackages || false;
  cleanTheme = cleanTheme || false;
  cleanPreset = cleanPreset || false;

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

  // Clean and rebuild packages if requested
  if (cleanPackages) {
    console.log('\nCleaning and rebuilding theme and preset packages...');
    try {
      execSync('pnpm clear:packages', { stdio: 'inherit' });
      execSync('pnpm build:theme', { stdio: 'inherit' });
      execSync('pnpm build:preset', { stdio: 'inherit' });
      console.log('Theme and preset packages rebuilt successfully.');
       
    } catch (error) {
      console.error('Failed to rebuild packages.');
      process.exit(1);
    }
  } else {
    // Clean and rebuild individual packages if requested
    if (cleanTheme) {
      console.log('\nCleaning and rebuilding theme package...');
      try {
        execSync('pnpm clear:theme', { stdio: 'inherit' });
        execSync('pnpm build:theme', { stdio: 'inherit' });
        console.log('Theme package rebuilt successfully.');
         
      } catch (error) {
        console.error('Failed to rebuild theme package.');
        process.exit(1);
      }
    }
    
    if (cleanPreset) {
      console.log('\nCleaning and rebuilding preset package...');
      try {
        execSync('pnpm clear:preset', { stdio: 'inherit' });
        execSync('pnpm build:preset', { stdio: 'inherit' });
        console.log('Preset package rebuilt successfully.');
         
      } catch (error) {
        console.error('Failed to rebuild preset package.');
        process.exit(1);
      }
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
