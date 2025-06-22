#!/usr/bin/env node

/**
 * Mark Tests as Run
 * 
 * Updates the .git/.last-regression-test file to track when tests were last run
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

function markTestsRun() {
  try {
    // Get current commit hash
    const currentCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    
    // Write to tracking file
    const testFile = '.git/.last-regression-test';
    fs.writeFileSync(testFile, currentCommit);
    
    console.log('✅ Marked regression tests as run for commit:', currentCommit.substring(0, 8));
  } catch (error) {
    console.log('⚠️  Could not mark tests as run:', error.message);
  }
}

if (require.main === module) {
  markTestsRun();
}

module.exports = { markTestsRun };