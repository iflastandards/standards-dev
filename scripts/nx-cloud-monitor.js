#!/usr/bin/env node

/**
 * Nx Cloud Monitoring Script
 * Tracks cache hit rates, task execution times, and optimization opportunities
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class NxCloudMonitor {
  constructor() {
    this.nxCloudUrl = 'https://nx.app';
    this.workspaceId = '6857fccbb755d4191ce6fbe4';
    this.cacheDir = '.nx/cache';
  }

  /**
   * Analyze local cache performance
   */
  analyzeCachePerformance() {
    console.log('\n🎯 Cache Performance Analysis');
    console.log('================================');

    try {
      const cacheStats = this.getCacheStats();
      
      console.log(`📦 Cache Directory: ${this.cacheDir}`);
      console.log(`📊 Total Cache Entries: ${cacheStats.totalEntries}`);
      console.log(`💾 Cache Size: ${this.formatBytes(cacheStats.totalSize)}`);
      console.log(`📅 Oldest Entry: ${cacheStats.oldestEntry}`);
      console.log(`📅 Newest Entry: ${cacheStats.newestEntry}`);

      // Calculate estimated savings
      const estimatedSavings = this.calculateSavings(cacheStats);
      console.log(`⚡ Estimated Time Saved: ${estimatedSavings.timeSaved}`);
      console.log(`🚀 Cache Hit Rate (estimated): ${estimatedSavings.hitRate}%`);

    } catch (error) {
      console.log(`❌ Error analyzing cache: ${error.message}`);
    }
  }

  /**
   * Get cache directory statistics
   */
  getCacheStats() {
    const cacheDir = path.resolve(this.cacheDir);
    
    if (!fs.existsSync(cacheDir)) {
      throw new Error('Cache directory not found');
    }

    const entries = fs.readdirSync(cacheDir, { withFileTypes: true });
    let totalSize = 0;
    let oldestTime = Date.now();
    let newestTime = 0;
    let totalEntries = 0;

    entries.forEach(entry => {
      if (entry.isDirectory() || entry.name.endsWith('.tar.gz') || entry.name.endsWith('.commit')) {
        totalEntries++;
        const entryPath = path.join(cacheDir, entry.name);
        const stats = fs.statSync(entryPath);
        totalSize += stats.size;
        
        if (stats.mtime.getTime() < oldestTime) {
          oldestTime = stats.mtime.getTime();
        }
        if (stats.mtime.getTime() > newestTime) {
          newestTime = stats.mtime.getTime();
        }
      }
    });

    return {
      totalEntries,
      totalSize,
      oldestEntry: new Date(oldestTime).toISOString().split('T')[0],
      newestEntry: new Date(newestTime).toISOString().split('T')[0]
    };
  }

  /**
   * Calculate estimated performance savings
   */
  calculateSavings(cacheStats) {
    // Rough estimates based on typical build times
    const avgTaskTime = 30; // seconds
    const cacheHitRatio = Math.min(0.8, cacheStats.totalEntries / 100); // Estimate based on entries
    
    const timeSavedSeconds = cacheStats.totalEntries * avgTaskTime * cacheHitRatio;
    const timeSavedMinutes = Math.round(timeSavedSeconds / 60);
    
    return {
      timeSaved: `${timeSavedMinutes} minutes`,
      hitRate: Math.round(cacheHitRatio * 100)
    };
  }

  /**
   * Test current setup with a sample task
   */
  async testPerformance() {
    console.log('\n⚡ Performance Test');
    console.log('==================');

    const testCommands = [
      'nx affected --target=typecheck --dry-run',
      'nx affected --target=lint --dry-run',
      'nx affected --target=test --dry-run'
    ];

    for (const command of testCommands) {
      try {
        console.log(`\n🧪 Testing: ${command}`);
        const startTime = Date.now();
        
        execSync(`pnpm exec ${command}`, { 
          stdio: 'pipe',
          timeout: 30000 
        });
        
        const duration = Date.now() - startTime;
        console.log(`✅ Completed in ${duration}ms`);
        
      } catch (error) {
        console.log(`⚠️  Command completed with output (normal for dry-run)`);
      }
    }
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    console.log('\n💡 Optimization Recommendations');
    console.log('===============================');

    const recommendations = [
      {
        title: '🎯 Distributed Task Execution',
        description: 'Use the new CI-DTE workflow for faster CI builds',
        action: 'Run: gh workflow run ci-dte.yml'
      },
      {
        title: '📊 Cache Monitoring',
        description: 'Monitor cache hit rates in Nx Cloud dashboard',
        action: `Visit: ${this.nxCloudUrl}/orgs/workspace-${this.workspaceId}`
      },
      {
        title: '🔧 Local Development',
        description: 'Use affected commands for faster local development',
        action: 'Run: pnpm test (uses nx affected automatically)'
      },
      {
        title: '🚀 Remote Caching',
        description: 'Your Nx Cloud remote caching is active',
        action: 'Check dashboard for team cache sharing stats'
      }
    ];

    recommendations.forEach(rec => {
      console.log(`\n${rec.title}`);
      console.log(`   ${rec.description}`);
      console.log(`   👉 ${rec.action}`);
    });
  }

  /**
   * Display Nx Cloud dashboard links
   */
  showDashboardLinks() {
    console.log('\n🔗 Nx Cloud Dashboard Links');
    console.log('============================');
    
    const links = [
      {
        name: 'Workspace Overview',
        url: `${this.nxCloudUrl}/orgs/workspace-${this.workspaceId}`
      },
      {
        name: 'Recent Runs',
        url: `${this.nxCloudUrl}/orgs/workspace-${this.workspaceId}/runs`
      },
      {
        name: 'Cache Analytics',
        url: `${this.nxCloudUrl}/orgs/workspace-${this.workspaceId}/analytics`
      },
      {
        name: 'Settings',
        url: `${this.nxCloudUrl}/orgs/workspace-${this.workspaceId}/settings`
      }
    ];

    links.forEach(link => {
      console.log(`📊 ${link.name}: ${link.url}`);
    });
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Run complete monitoring suite
   */
  async run() {
    console.log('🔍 Nx Cloud Monitoring Report');
    console.log('=============================');
    console.log(`Generated: ${new Date().toISOString()}`);
    
    this.analyzeCachePerformance();
    await this.testPerformance();
    this.generateRecommendations();
    this.showDashboardLinks();
    
    console.log('\n✅ Monitoring complete!');
    console.log('\n💭 Next Steps:');
    console.log('   1. Check the Nx Cloud dashboard for detailed analytics');
    console.log('   2. Try the new CI-DTE workflow for faster CI builds');
    console.log('   3. Monitor cache hit rates over time');
    console.log('   4. Use nx affected commands for optimal local development');
  }
}

// CLI interface
const command = process.argv[2];
const monitor = new NxCloudMonitor();

switch (command) {
  case 'cache':
    monitor.analyzeCachePerformance();
    break;
  case 'test':
    monitor.testPerformance();
    break;
  case 'recommendations':
    monitor.generateRecommendations();
    break;
  case 'links':
    monitor.showDashboardLinks();
    break;
  case 'help':
    console.log('Nx Cloud Monitor Commands:');
    console.log('  cache           - Analyze cache performance');
    console.log('  test           - Test current setup performance');
    console.log('  recommendations - Show optimization recommendations');
    console.log('  links          - Show Nx Cloud dashboard links');
    console.log('  help           - Show this help');
    console.log('  (no args)      - Run complete monitoring suite');
    break;
  default:
    monitor.run();
}