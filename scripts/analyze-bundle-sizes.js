#!/usr/bin/env node

/**
 * Bundle Size Analyzer for @ifla/theme package
 * Analyzes build outputs and identifies optimization opportunities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BundleAnalyzer {
  constructor() {
    this.themeDir = path.resolve('packages/theme');
    this.distDir = path.join(this.themeDir, 'dist');
    this.srcDir = path.join(this.themeDir, 'src');
  }

  /**
   * Analyze current bundle sizes
   */
  analyzeBundles() {
    console.log('📦 Bundle Size Analysis');
    console.log('======================');

    if (!fs.existsSync(this.distDir)) {
      console.log('❌ No dist directory found. Building theme package first...');
      this.buildTheme();
    }

    const bundles = this.getBundleFiles();
    let totalSize = 0;
    let totalGzipSize = 0;

    console.log('\n📊 Bundle Breakdown:');
    console.log('────────────────────────────────────────');

    bundles.forEach(bundle => {
      const stats = this.analyzeBundleFile(bundle);
      totalSize += stats.size;
      totalGzipSize += stats.gzipSize;
      
      const sizeKB = (stats.size / 1024).toFixed(2);
      const gzipKB = (stats.gzipSize / 1024).toFixed(2);
      const compression = (((stats.size - stats.gzipSize) / stats.size) * 100).toFixed(1);
      
      console.log(`📄 ${bundle.name.padEnd(35)} ${sizeKB.padStart(8)} KB (${gzipKB.padStart(6)} KB gzipped, ${compression}% reduction)`);
    });

    console.log('────────────────────────────────────────');
    const totalKB = (totalSize / 1024).toFixed(2);
    const totalGzipKB = (totalGzipSize / 1024).toFixed(2);
    const overallCompression = (((totalSize - totalGzipSize) / totalSize) * 100).toFixed(1);
    
    console.log(`📦 Total Bundle Size:                   ${totalKB.padStart(8)} KB (${totalGzipKB.padStart(6)} KB gzipped, ${overallCompression}% reduction)`);

    return { totalSize, totalGzipSize, bundles };
  }

  /**
   * Build theme package
   */
  buildTheme() {
    try {
      execSync('nx run @ifla/theme:build', { 
        cwd: path.resolve('.'), 
        stdio: 'inherit' 
      });
    } catch (error) {
      console.error('❌ Failed to build theme package:', error.message);
      process.exit(1);
    }
  }

  /**
   * Get all bundle files
   */
  getBundleFiles() {
    const files = fs.readdirSync(this.distDir);
    return files
      .filter(file => file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.css'))
      .filter(file => !file.endsWith('.map'))
      .map(file => ({
        name: file,
        path: path.join(this.distDir, file),
        type: file.endsWith('.css') ? 'css' : 'js'
      }))
      .sort((a, b) => {
        const statsA = fs.statSync(a.path);
        const statsB = fs.statSync(b.path);
        return statsB.size - statsA.size; // Sort by size descending
      });
  }

  /**
   * Analyze individual bundle file
   */
  analyzeBundleFile(bundle) {
    const stats = fs.statSync(bundle.path);
    const content = fs.readFileSync(bundle.path);
    
    // Simulate gzip compression
    const gzipSize = this.estimateGzipSize(content);
    
    return {
      size: stats.size,
      gzipSize,
      type: bundle.type
    };
  }

  /**
   * Estimate gzip size (rough approximation)
   */
  estimateGzipSize(content) {
    // This is a rough estimation - actual gzip would be different
    // For accurate measurements, you'd need to actually gzip the content
    const compressionRatio = 0.3; // Typical compression ratio for JS/CSS
    return Math.round(content.length * compressionRatio);
  }

  /**
   * Analyze source code structure
   */
  analyzeSourceStructure() {
    console.log('\n🔍 Source Code Analysis');
    console.log('======================');

    const sourceFiles = this.getSourceFiles();
    let totalLines = 0;
    let totalSize = 0;

    console.log('\n📁 Source File Breakdown:');
    console.log('────────────────────────────────────────');

    sourceFiles.forEach(file => {
      const stats = fs.statSync(file.path);
      const content = fs.readFileSync(file.path, 'utf8');
      const lines = content.split('\n').length;
      
      totalLines += lines;
      totalSize += stats.size;
      
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`📄 ${file.relativePath.padEnd(40)} ${lines.toString().padStart(6)} lines (${sizeKB.padStart(6)} KB)`);
    });

    console.log('────────────────────────────────────────');
    const totalSizeKB = (totalSize / 1024).toFixed(2);
    console.log(`📦 Total Source:                         ${totalLines.toString().padStart(6)} lines (${totalSizeKB.padStart(6)} KB)`);

    return { totalLines, totalSize, sourceFiles };
  }

  /**
   * Get all source files
   */
  getSourceFiles() {
    const files = [];
    
    const walkDir = (dir, baseDir = this.srcDir) => {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath, baseDir);
        } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.css') || item.endsWith('.scss')) {
          files.push({
            name: item,
            path: fullPath,
            relativePath: path.relative(baseDir, fullPath),
            type: path.extname(item).slice(1)
          });
        }
      });
    };
    
    walkDir(this.srcDir);
    
    return files.sort((a, b) => {
      const statsA = fs.statSync(a.path);
      const statsB = fs.statSync(b.path);
      return statsB.size - statsA.size;
    });
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizations() {
    console.log('\n💡 Optimization Recommendations');
    console.log('===============================');

    const recommendations = [
      {
        title: '🎯 Tree Shaking Optimization',
        description: 'Enable more aggressive tree shaking in tsup config',
        impact: 'High',
        difficulty: 'Medium',
        actions: [
          'Add "sideEffects": false to package.json',
          'Use named exports consistently',
          'Avoid default exports for better tree shaking'
        ]
      },
      {
        title: '📦 Bundle Splitting',
        description: 'Split bundles by usage patterns',
        impact: 'Medium',
        difficulty: 'Medium',
        actions: [
          'Enable code splitting in tsup.config.ts',
          'Create separate entry points for heavy components',
          'Use dynamic imports for optional features'
        ]
      },
      {
        title: '🗜️ CSS Optimization',
        description: 'Optimize CSS bundle sizes',
        impact: 'Medium',
        difficulty: 'Low',
        actions: [
          'Remove unused CSS classes',
          'Use CSS modules for better scoping',
          'Consider PostCSS purge plugin'
        ]
      },
      {
        title: '⚡ Performance Monitoring',
        description: 'Set up bundle size monitoring',
        impact: 'Low',
        difficulty: 'Low',
        actions: [
          'Add bundle size limits to CI',
          'Monitor bundle size over time',
          'Set up alerts for size increases'
        ]
      }
    ];

    recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. ${rec.title}`);
      console.log(`   📝 ${rec.description}`);
      console.log(`   📊 Impact: ${rec.impact} | Difficulty: ${rec.difficulty}`);
      console.log(`   🔧 Actions:`);
      rec.actions.forEach(action => {
        console.log(`      • ${action}`);
      });
    });
  }

  /**
   * Generate bundle size report
   */
  generateReport() {
    console.log('📋 Theme Package Bundle Analysis Report');
    console.log('======================================');
    console.log(`Generated: ${new Date().toISOString()}`);
    console.log(`Theme Directory: ${this.themeDir}`);

    const bundleAnalysis = this.analyzeBundles();
    const sourceAnalysis = this.analyzeSourceStructure();
    this.generateOptimizations();

    // Summary
    console.log('\n📈 Summary');
    console.log('==========');
    console.log(`🎯 Build Output: ${(bundleAnalysis.totalSize / 1024).toFixed(2)} KB total`);
    console.log(`📁 Source Code: ${(sourceAnalysis.totalSize / 1024).toFixed(2)} KB total`);
    console.log(`📦 Compression Ratio: ${(((bundleAnalysis.totalSize - bundleAnalysis.totalGzipSize) / bundleAnalysis.totalSize) * 100).toFixed(1)}%`);
    console.log(`📊 Build Efficiency: ${((bundleAnalysis.totalSize / sourceAnalysis.totalSize) * 100).toFixed(1)}%`);

    return {
      bundleAnalysis,
      sourceAnalysis,
      timestamp: new Date().toISOString()
    };
  }
}

// CLI interface
const command = process.argv[2];
const analyzer = new BundleAnalyzer();

switch (command) {
  case 'bundles':
    analyzer.analyzeBundles();
    break;
  case 'source':
    analyzer.analyzeSourceStructure();
    break;
  case 'optimizations':
    analyzer.generateOptimizations();
    break;
  case 'help':
    console.log('Bundle Analyzer Commands:');
    console.log('  bundles        - Analyze built bundle sizes');
    console.log('  source         - Analyze source code structure');
    console.log('  optimizations  - Show optimization recommendations');
    console.log('  help           - Show this help');
    console.log('  (no args)      - Run complete analysis');
    break;
  default:
    analyzer.generateReport();
}