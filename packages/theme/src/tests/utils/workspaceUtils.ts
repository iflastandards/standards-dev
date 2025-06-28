/**
 * Utility functions for test workspace management
 * Provides consistent directory handling across all test files
 */

import path from 'path';
import fs from 'fs';

/**
 * Finds the workspace root by looking for package.json with "name": "standards-dev"
 * This is more reliable than process.cwd() which can vary depending on test execution context
 * 
 * @returns {string} Absolute path to the workspace root
 * @throws {Error} If workspace root cannot be found
 */
export const findWorkspaceRoot = (): string => {
  let currentDir = __dirname;
  
  while (currentDir !== path.dirname(currentDir)) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = require(packageJsonPath);
        if (packageJson.name === 'standards-dev') {
          return currentDir;
        }
      } catch (e) {
        // Continue searching if package.json is malformed
      }
    }
    
    currentDir = path.dirname(currentDir);
  }
  
  throw new Error('Could not find workspace root - no package.json with name "standards-dev" found');
};

/**
 * Gets the absolute path to a script in the workspace scripts directory
 * 
 * @param scriptName - Name of the script file (e.g., 'vocabulary-comparison.mjs')
 * @returns {string} Absolute path to the script
 */
export const getScriptPath = (scriptName: string): string => {
  const workspaceRoot = findWorkspaceRoot();
  return path.join(workspaceRoot, 'scripts', scriptName);
};

/**
 * Gets the absolute path to a directory relative to workspace root
 * 
 * @param relativePath - Path relative to workspace root (e.g., 'tmp', 'packages/theme')
 * @returns {string} Absolute path to the directory
 */
export const getWorkspacePath = (relativePath: string): string => {
  const workspaceRoot = findWorkspaceRoot();
  return path.join(workspaceRoot, relativePath);
};

/**
 * Sets up common test environment paths
 * Returns commonly used paths for integration tests
 * 
 * @returns {object} Object containing commonly used paths
 */
export const setupTestPaths = () => {
  const workspaceRoot = findWorkspaceRoot();
  
  return {
    workspaceRoot,
    scriptsDir: path.join(workspaceRoot, 'scripts'),
    tmpDir: path.join(workspaceRoot, 'tmp'),
    packagesDir: path.join(workspaceRoot, 'packages'),
    themeDir: path.join(workspaceRoot, 'packages', 'theme')
  };
};