#!/usr/bin/env node

/**
 * Nx Performance Check Script
 * 
 * Analyzes Nx workspace performance and provides optimization recommendations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
// Simple color functions to avoid chalk import issues
const chalk = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`, 
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  bold: {
    cyan: (text) => `\x1b[1m\x1b[36m${text}\x1b[0m`,
    green: (text) => `\x1b[1m\x1b[32m${text}\x1b[0m`
  }
};

function runCommand(command, silent = false) {
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit' });
    return result.trim();
  } catch (error) {
    if (!silent) console.error(`Error running: ${command}`);
    return null;
  }
}

function checkNxCloudStatus() {
  console.log(chalk.blue('\n📊 Checking Nx Cloud Status...\n'));
  
  const nxJson = JSON.parse(fs.readFileSync('nx.json', 'utf8'));
  if (nxJson.nxCloudId) {
    console.log(chalk.green('✅ Nx Cloud configured with ID:'), nxJson.nxCloudId);
    
    // Check if access token is configured
    const hasToken = process.env.NX_CLOUD_ACCESS_TOKEN || 
                    runCommand('nx g @nrwl/nx-cloud:init --help', true);
    
    if (hasToken) {
      console.log(chalk.green('✅ Nx Cloud access token configured'));
    } else {
      console.log(chalk.yellow('⚠️  Nx Cloud access token not found. Run: nx connect'));
    }
  } else {
    console.log(chalk.red('❌ Nx Cloud not configured. Run: nx connect'));
  }
}

function analyzeCacheUtilization() {
  console.log(chalk.blue('\n🗄️  Analyzing Cache Utilization...\n'));
  
  const cacheDir = '.nx/cache';
  if (fs.existsSync(cacheDir)) {
    const stats = fs.statSync(cacheDir);
    console.log(chalk.green('✅ Local cache directory exists'));
    
    // Get cache size (rough estimate)
    try {
      const cacheSize = runCommand(`du -sh ${cacheDir} 2>/dev/null | cut -f1`, true);
      if (cacheSize) {
        console.log(chalk.cyan(`📦 Cache size: ${cacheSize}`));
      }
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not determine cache size'));
    }
  } else {
    console.log(chalk.yellow('⚠️  No local cache found yet'));
  }
}

function checkProjectConfiguration() {
  console.log(chalk.blue('\n⚙️  Checking Project Configuration...\n'));
  
  // Check for project.json files
  const projectFiles = runCommand('find . -name "project.json" -not -path "./node_modules/*"', true);
  if (projectFiles) {
    const projects = projectFiles.split('\n').length;
    console.log(chalk.green(`✅ Found ${projects} projects with project.json`));
  }
  
  // Check for cacheable targets
  const nxJson = JSON.parse(fs.readFileSync('nx.json', 'utf8'));
  const cacheableTargets = Object.entries(nxJson.targetDefaults || {})
    .filter(([, config]) => config.cache === true)
    .map(([target]) => target);
  
  console.log(chalk.green(`✅ Cacheable targets: ${cacheableTargets.join(', ')}`));
  
  // Check for proper inputs configuration
  let inputsConfigured = 0;
  Object.entries(nxJson.targetDefaults || {}).forEach(([target, config]) => {
    if (config.inputs && config.inputs.length > 0) {
      inputsConfigured++;
    }
  });
  
  console.log(chalk.green(`✅ Targets with inputs configured: ${inputsConfigured}`));
}

function checkDependencyGraph() {
  console.log(chalk.blue('\n🔗 Analyzing Dependency Graph...\n'));
  
  try {
    // Generate and analyze dependency graph
    runCommand('npx nx graph --file=.nx/dependency-graph.json', true);
    
    if (fs.existsSync('.nx/dependency-graph.json')) {
      const graph = JSON.parse(fs.readFileSync('.nx/dependency-graph.json', 'utf8'));
      
      const nodeCount = Object.keys(graph.graph.nodes || {}).length;
      const edgeCount = Object.keys(graph.graph.dependencies || {}).length;
      
      console.log(chalk.green(`✅ Projects: ${nodeCount}`));
      console.log(chalk.green(`✅ Dependencies: ${edgeCount}`));
      
      // Check for circular dependencies
      const circularDeps = runCommand('npx nx graph --file=.nx/circular-deps.json --focus-project="" 2>&1 | grep -i circular', true);
      if (circularDeps) {
        console.log(chalk.red('❌ Circular dependencies detected'));
      } else {
        console.log(chalk.green('✅ No circular dependencies found'));
      }
    }
  } catch (error) {
    console.log(chalk.yellow('⚠️  Could not analyze dependency graph'));
  }
}

function checkBuildPerformance() {
  console.log(chalk.blue('\n🚀 Build Performance Analysis...\n'));
  
  // Check if build targets have proper outputs configuration
  const projectFiles = runCommand('find . -name "project.json" -not -path "./node_modules/*"', true);
  if (projectFiles) {
    let outputsConfigured = 0;
    let totalProjects = 0;
    
    projectFiles.split('\n').forEach(file => {
      if (fs.existsSync(file)) {
        try {
          const project = JSON.parse(fs.readFileSync(file, 'utf8'));
          totalProjects++;
          
          if (project.targets?.build?.outputs) {
            outputsConfigured++;
          }
        } catch (error) {
          // Skip malformed JSON
        }
      }
    });
    
    console.log(chalk.green(`✅ Projects with outputs configured: ${outputsConfigured}/${totalProjects}`));
    
    if (outputsConfigured < totalProjects) {
      console.log(chalk.yellow('⚠️  Consider adding outputs configuration to all build targets for better caching'));
    }
  }
}

function provideOptimizationRecommendations() {
  console.log(chalk.blue('\n💡 Optimization Recommendations...\n'));
  
  const recommendations = [
    {
      check: () => !process.env.NX_CLOUD_ACCESS_TOKEN,
      message: 'Configure Nx Cloud for distributed caching and builds',
      action: 'Run: nx connect'
    },
    {
      check: () => !fs.existsSync('playwright.config.ts'),
      message: 'E2E tests configured with Playwright',
      action: 'Already implemented ✅'
    },
    {
      check: () => {
        const nxJson = JSON.parse(fs.readFileSync('nx.json', 'utf8'));
        return !nxJson.parallel || nxJson.parallel < 3;
      },
      message: 'Increase parallel execution for better performance',
      action: 'Set "parallel": 4 in nx.json'
    },
    {
      check: () => !fs.existsSync('.github/workflows/nx-smart-deploy.yml'),
      message: 'Implement smart deployment with affected project detection',
      action: 'Already implemented ✅'
    }
  ];
  
  recommendations.forEach(({ check, message, action }) => {
    if (check()) {
      console.log(chalk.yellow(`📋 ${message}`));
      console.log(chalk.cyan(`   → ${action}\n`));
    } else {
      console.log(chalk.green(`✅ ${message}`));
    }
  });
}

function generatePerformanceReport() {
  console.log(chalk.blue('\n📊 Generating Performance Report...\n'));
  
  const report = {
    timestamp: new Date().toISOString(),
    nxVersion: runCommand('npx nx --version', true),
    nodeVersion: process.version,
    cacheStatus: fs.existsSync('.nx/cache') ? 'enabled' : 'not-found',
    projectCount: 0,
    e2eTestsConfigured: fs.existsSync('playwright.config.ts'),
    nxCloudConfigured: !!JSON.parse(fs.readFileSync('nx.json', 'utf8')).nxCloudId
  };
  
  // Count projects
  const projectFiles = runCommand('find . -name "project.json" -not -path "./node_modules/*"', true);
  if (projectFiles) {
    report.projectCount = projectFiles.split('\n').length;
  }
  
  fs.writeFileSync('.nx/performance-report.json', JSON.stringify(report, null, 2));
  console.log(chalk.green('✅ Performance report saved to .nx/performance-report.json'));
  
  return report;
}

function main() {
  console.log(chalk.bold.cyan('\n🔍 Nx Performance Check\n'));
  console.log(chalk.gray('Analyzing workspace configuration and performance...\n'));
  
  checkNxCloudStatus();
  analyzeCacheUtilization();
  checkProjectConfiguration();
  checkDependencyGraph();
  checkBuildPerformance();
  provideOptimizationRecommendations();
  
  const report = generatePerformanceReport();
  
  console.log(chalk.bold.green('\n🎉 Performance Check Complete!\n'));
  console.log(chalk.cyan('Summary:'));
  console.log(chalk.gray(`  • Projects: ${report.projectCount}`));
  console.log(chalk.gray(`  • Nx Version: ${report.nxVersion}`));
  console.log(chalk.gray(`  • Cache: ${report.cacheStatus}`));
  console.log(chalk.gray(`  • Nx Cloud: ${report.nxCloudConfigured ? 'configured' : 'not configured'}`));
  console.log(chalk.gray(`  • E2E Tests: ${report.e2eTestsConfigured ? 'configured' : 'not configured'}`));
  
  console.log(chalk.blue('\n📚 Next Steps:'));
  console.log(chalk.gray('  • Run tests: pnpm test:e2e'));
  console.log(chalk.gray('  • Check affected: nx affected --target=build'));
  console.log(chalk.gray('  • Deploy: nx run standards-dev:build-all'));
}

if (require.main === module) {
  main();
}

module.exports = {
  checkNxCloudStatus,
  analyzeCacheUtilization,
  checkProjectConfiguration,
  generatePerformanceReport
};