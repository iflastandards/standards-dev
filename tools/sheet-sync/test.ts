#!/usr/bin/env node

/**
 * Simple test script for sheet-sync CLI
 * Tests basic functionality without requiring Google Sheets credentials
 */

const { execSync } = require('child_process');
const { existsSync } = require('fs');

function runTest(name: string, testFn: () => void) {
  try {
    console.log(`🧪 Testing: ${name}`);
    testFn();
    console.log(`✅ PASS: ${name}`);
  } catch (error) {
    console.log(`❌ FAIL: ${name} - ${error}`);
    process.exit(1);
  }
}

function testListCommand() {
  const output = execSync('npx ts-node index.ts list', { encoding: 'utf8' });
  
  // Check that all expected standards are listed
  const expectedStandards = ['ISBDM', 'LRM', 'fr', 'isbd', 'muldicat', 'unimarc'];
  for (const standard of expectedStandards) {
    if (!output.includes(standard)) {
      throw new Error(`Standard ${standard} not found in list output`);
    }
  }
  
  // Check that CSV and Config paths are shown
  if (!output.includes('CSV:') || !output.includes('Config:')) {
    throw new Error('CSV and Config paths not shown in list output');
  }
}

function testInvalidStandard() {
  try {
    execSync('npx ts-node index.ts status INVALID_STANDARD', { encoding: 'utf8' });
    throw new Error('Should have failed with invalid standard');
  } catch (error: any) {
    // Expected to fail
    if (!error.message.includes('Unknown standard')) {
      throw new Error('Should show "Unknown standard" error message');
    }
  }
}

function testConfigurationFiles() {
  const expectedConfigs = [
    'standards/ISBDM/.config/sheet.json',
    'standards/LRM/.config/sheet.json',
    'standards/fr/.config/sheet.json',
    'standards/isbd/.config/sheet.json',
    'standards/muldicat/.config/sheet.json',
    'standards/unimarc/.config/sheet.json'
  ];
  
  for (const configPath of expectedConfigs) {
    if (!existsSync(`../../${configPath}`)) {
      throw new Error(`Configuration file missing: ${configPath}`);
    }
  }
}

function testHelpCommand() {
  const output = execSync('npx ts-node index.ts --help', { encoding: 'utf8' });
  
  // Check that help shows available commands
  const expectedCommands = ['pull', 'push', 'status', 'list'];
  for (const command of expectedCommands) {
    if (!output.includes(command)) {
      throw new Error(`Command ${command} not found in help output`);
    }
  }
}

// Run tests
console.log('🚀 Running sheet-sync CLI tests...\n');

runTest('List command shows all standards', testListCommand);
runTest('Invalid standard shows error', testInvalidStandard);
runTest('Configuration files exist', testConfigurationFiles);
runTest('Help command shows available commands', testHelpCommand);

console.log('\n🎉 All tests passed!');
console.log('\n📝 Note: Google Sheets integration tests require GSHEETS_SA_KEY environment variable');
