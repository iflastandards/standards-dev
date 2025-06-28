import { describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs';
import { findWorkspaceRoot, getScriptPath, getWorkspacePath, setupTestPaths } from './workspaceUtils';

describe('workspaceUtils', () => {
  describe('findWorkspaceRoot', () => {
    it('should find the workspace root directory', () => {
      const workspaceRoot = findWorkspaceRoot();
      
      // Should be an absolute path
      expect(path.isAbsolute(workspaceRoot)).toBe(true);
      
      // Should contain a package.json with the correct name
      const packageJsonPath = path.join(workspaceRoot, 'package.json');
      expect(fs.existsSync(packageJsonPath)).toBe(true);
      
      const packageJson = require(packageJsonPath);
      expect(packageJson.name).toBe('standards-dev');
    });

    it('should return the same path when called multiple times', () => {
      const path1 = findWorkspaceRoot();
      const path2 = findWorkspaceRoot();
      
      expect(path1).toBe(path2);
    });
  });

  describe('getScriptPath', () => {
    it('should return correct path for script files', () => {
      const scriptPath = getScriptPath('vocabulary-comparison.mjs');
      
      expect(path.isAbsolute(scriptPath)).toBe(true);
      expect(scriptPath).toContain('scripts');
      expect(scriptPath).toContain('vocabulary-comparison.mjs');
    });
  });

  describe('getWorkspacePath', () => {
    it('should return correct path for relative workspace paths', () => {
      const tmpPath = getWorkspacePath('tmp');
      const packagesPath = getWorkspacePath('packages/theme');
      
      expect(path.isAbsolute(tmpPath)).toBe(true);
      expect(path.isAbsolute(packagesPath)).toBe(true);
      expect(tmpPath).toContain('tmp');
      expect(packagesPath).toContain('packages');
      expect(packagesPath).toContain('theme');
    });
  });

  describe('setupTestPaths', () => {
    it('should return all common test paths', () => {
      const paths = setupTestPaths();
      
      expect(paths).toHaveProperty('workspaceRoot');
      expect(paths).toHaveProperty('scriptsDir');
      expect(paths).toHaveProperty('tmpDir');
      expect(paths).toHaveProperty('packagesDir');
      expect(paths).toHaveProperty('themeDir');
      
      // All paths should be absolute
      Object.values(paths).forEach(pathValue => {
        expect(path.isAbsolute(pathValue)).toBe(true);
      });
    });

    it('should return paths that exist in the workspace', () => {
      const { workspaceRoot, scriptsDir, packagesDir } = setupTestPaths();
      
      // These directories should exist
      expect(fs.existsSync(workspaceRoot)).toBe(true);
      expect(fs.existsSync(scriptsDir)).toBe(true);
      expect(fs.existsSync(packagesDir)).toBe(true);
    });
  });
});