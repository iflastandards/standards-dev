const { execSync } = require('child_process');

/**
 * Port management utility for IFLA Standards project
 * Ensures clean port management before starting development servers
 */

// Port mappings for all sites
const SITE_PORTS = {
  portal: 3000,
  isbdm: 3001,
  lrm: 3002,
  frbr: 3003,
  isbd: 3004,
  muldicat: 3005,
  unimarc: 3006,
  newtest: 3008
};

// All ports used by the project
const ALL_PORTS = Object.values(SITE_PORTS);

/**
 * Kill processes on a specific port
 * @param {number} port - Port number to clear
 * @param {boolean} verbose - Whether to show detailed output
 * @returns {boolean} - True if successful, false otherwise
 */
async function killPort(port, verbose = false) {
  try {
    if (verbose) {
      console.log(`🔍 Checking for processes on port ${port}...`);
    }

    // First, try to find processes using the port
    const findCommand = `lsof -ti:${port}`;
    let pids;

    try {
      pids = execSync(findCommand, { encoding: 'utf8', stdio: 'pipe' }).trim();
    } catch (error) {
      // No processes found on this port
      if (verbose) {
        console.log(`✅ Port ${port} is already free`);
      }
      return true;
    }

    if (pids) {
      if (verbose) {
        console.log(`🔄 Killing processes on port ${port}: ${pids.replace(/\n/g, ', ')}`);
      }

      // Kill the processes
      execSync(`kill -9 ${pids.replace(/\n/g, ' ')}`, { stdio: 'pipe' });

      // Wait a moment for processes to die
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (verbose) {
        console.log(`✅ Successfully cleared port ${port}`);
      }
    }

    return true;
  } catch (error) {
    if (verbose) {
      console.error(`❌ Failed to clear port ${port}: ${error.message}`);
    }
    return false;
  }
}

/**
 * Kill processes on multiple ports
 * @param {number[]} ports - Array of port numbers to clear
 * @param {boolean} verbose - Whether to show detailed output
 * @returns {boolean} - True if all successful, false otherwise
 */
async function killPorts(ports, verbose = false) {
  if (verbose) {
    console.log(`🧹 Clearing ports: ${ports.join(', ')}`);
  }

  const results = await Promise.all(
    ports.map(port => killPort(port, verbose))
  );

  const success = results.every(result => result);

  if (verbose) {
    if (success) {
      console.log(`✅ All ports cleared successfully`);
    } else {
      console.log(`⚠️  Some ports could not be cleared`);
    }
  }

  return success;
}

/**
 * Kill all project-related processes
 * @param {boolean} verbose - Whether to show detailed output
 * @returns {boolean} - True if successful, false otherwise
 */
async function killAllPorts(verbose = false) {
  if (verbose) {
    console.log(`🧹 Clearing all IFLA Standards ports...`);
  }

  // Kill all ports
  const portsResult = await killPorts(ALL_PORTS, verbose);

  // Also kill any docusaurus processes that might be lingering
  try {
    if (verbose) {
      console.log(`🔄 Killing any remaining docusaurus processes...`);
    }
    execSync('pkill -f "docusaurus start" 2>/dev/null || true', { stdio: 'pipe' });
    execSync('pkill -f "docusaurus serve" 2>/dev/null || true', { stdio: 'pipe' });
  } catch (error) {
    // Ignore errors - these commands are best effort
  }

  return portsResult;
}

/**
 * Kill ports for a specific site
 * @param {string} siteName - Name of the site (e.g., 'isbd', 'portal')
 * @param {boolean} verbose - Whether to show detailed output
 * @returns {boolean} - True if successful, false otherwise
 */
async function killSitePort(siteName, verbose = false) {
  const port = SITE_PORTS[siteName.toLowerCase()];

  if (!port) {
    if (verbose) {
      console.error(`❌ Unknown site: ${siteName}`);
      console.log(`Available sites: ${Object.keys(SITE_PORTS).join(', ')}`);
    }
    return false;
  }

  return await killPort(port, verbose);
}

/**
 * Wait for a port to become available
 * @param {number} port - Port to check
 * @param {number} timeout - Timeout in milliseconds
 * @param {boolean} verbose - Whether to show detailed output
 * @returns {Promise<boolean>} - True if port becomes available, false if timeout
 */
async function waitForPortFree(port, timeout = 10000, verbose = false) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      execSync(`lsof -ti:${port}`, { stdio: 'pipe' });
      // If we get here, port is still in use
      if (verbose) {
        console.log(`⏳ Port ${port} still in use, waiting...`);
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      // Port is free
      if (verbose) {
        console.log(`✅ Port ${port} is now free`);
      }
      return true;
    }
  }

  if (verbose) {
    console.error(`❌ Timeout waiting for port ${port} to become free`);
  }
  return false;
}

module.exports = {
  SITE_PORTS,
  ALL_PORTS,
  killPort,
  killPorts,
  killAllPorts,
  killSitePort,
  waitForPortFree
};

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');

  async function main() {
    if (args.includes('--help') || args.includes('-h')) {
      console.log(`
Port Manager for IFLA Standards

Usage:
  node scripts/utils/port-manager.js [options] [command]

Commands:
  all                    Kill all project ports
  site <name>           Kill port for specific site
  port <number>         Kill specific port

Options:
  --verbose, -v         Show detailed output
  --help, -h           Show this help

Examples:
  node scripts/utils/port-manager.js all --verbose
  node scripts/utils/port-manager.js site isbd
  node scripts/utils/port-manager.js port 3004
`);
      return;
    }

    if (args.includes('all')) {
      await killAllPorts(verbose);
    } else if (args.includes('site')) {
      const siteIndex = args.indexOf('site');
      const siteName = args[siteIndex + 1];
      if (!siteName) {
        console.error('❌ Site name required');
        process.exit(1);
      }
      await killSitePort(siteName, verbose);
    } else if (args.includes('port')) {
      const portIndex = args.indexOf('port');
      const port = parseInt(args[portIndex + 1]);
      if (!port) {
        console.error('❌ Port number required');
        process.exit(1);
      }
      await killPort(port, verbose);
    } else {
      // Default: kill all ports
      await killAllPorts(verbose);
    }
  }

  main().catch(error => {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  });
}
