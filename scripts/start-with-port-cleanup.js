#!/usr/bin/env node

/**
 * Robust server startup script for IFLA Standards project
 * Ensures ports are properly cleared before starting servers
 */

const { execSync } = require('child_process');
const { killAllPorts, killSitePort } = require('./utils/port-manager.js');

// Parse command line arguments
const args = process.argv.slice(2);
const verbose = args.includes('--verbose') || args.includes('-v');

function log(message, type = 'info') {
  const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    bold: '\x1b[1m'
  };

  const prefix = {
    info: `${colors.blue}ℹ${colors.reset}`,
    success: `${colors.green}✓${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    warning: `${colors.yellow}⚠${colors.reset}`
  };

  console.log(`${prefix[type] || ''} ${message}`);
}

async function executeCommand(command, options = {}) {
  try {
    if (verbose) {
      log(`Running: ${command}`, 'info');
    }
    
    const result = execSync(command, {
      stdio: verbose ? 'inherit' : 'pipe',
      encoding: 'utf8',
      ...options
    });
    
    return { success: true, output: result };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: error.stdout?.toString() || ''
    };
  }
}

async function startServers(mode = 'all') {
  log(`Starting servers in ${mode} mode...`, 'info');
  
  // First, ensure all ports are clear
  log('Clearing all ports before starting servers...', 'info');
  await killAllPorts(verbose);
  
  // Wait a moment for ports to be fully cleared
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Determine which command to run
  let command;
  
  if (mode === 'serve') {
    command = 'pnpm serve:all';
  } else if (mode === 'start') {
    command = 'pnpm start:all';
  } else {
    // Default to start:all
    command = 'pnpm start:all';
  }
  
  log(`Executing: ${command}`, 'info');
  
  // Execute the command
  const result = await executeCommand(command);
  
  if (!result.success) {
    log(`Failed to start servers: ${result.error}`, 'error');
    process.exit(1);
  }
  
  log('Servers started successfully!', 'success');
}

async function startSingleSite(siteName, mode = 'start') {
  log(`Starting ${siteName} in ${mode} mode...`, 'info');
  
  // Clear the specific site's port
  log(`Clearing port for ${siteName}...`, 'info');
  await killSitePort(siteName, verbose);
  
  // Wait a moment for port to be fully cleared
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Determine which command to run
  let command;
  
  if (mode === 'serve') {
    command = `pnpm serve:${siteName}`;
  } else {
    command = `pnpm start:${siteName}`;
  }
  
  log(`Executing: ${command}`, 'info');
  
  // Execute the command
  const result = await executeCommand(command);
  
  if (!result.success) {
    log(`Failed to start ${siteName}: ${result.error}`, 'error');
    process.exit(1);
  }
  
  log(`${siteName} started successfully!`, 'success');
}

async function main() {
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Robust Server Startup for IFLA Standards

Usage:
  node scripts/start-with-port-cleanup.js [options] [command]

Commands:
  start                 Start all development servers (default)
  serve                 Serve all built sites
  start <site>         Start specific site development server
  serve <site>         Serve specific built site

Options:
  --verbose, -v        Show detailed output
  --help, -h          Show this help

Examples:
  node scripts/start-with-port-cleanup.js start
  node scripts/start-with-port-cleanup.js serve
  node scripts/start-with-port-cleanup.js start isbd
  node scripts/start-with-port-cleanup.js serve portal --verbose
`);
    return;
  }

  // Parse command
  const command = args.find(arg => !arg.startsWith('--')) || 'start';
  const siteArg = args[args.indexOf(command) + 1];
  
  if (command === 'start') {
    if (siteArg && !siteArg.startsWith('--')) {
      await startSingleSite(siteArg, 'start');
    } else {
      await startServers('start');
    }
  } else if (command === 'serve') {
    if (siteArg && !siteArg.startsWith('--')) {
      await startSingleSite(siteArg, 'serve');
    } else {
      await startServers('serve');
    }
  } else {
    log(`Unknown command: ${command}`, 'error');
    log('Use --help for usage information', 'info');
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
  log('\nReceived SIGINT, cleaning up...', 'warning');
  await killAllPorts(verbose);
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('\nReceived SIGTERM, cleaning up...', 'warning');
  await killAllPorts(verbose);
  process.exit(0);
});

// Run the main function
main().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});
