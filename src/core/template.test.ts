import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupTemplates, updateVersionInFile } from './template.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { TEMPLATES } from './template.js';

const TEST_DIR = 'test-output/template-tests';

describe('setupTemplates', () => {
  beforeEach(async () => {
    // Clean up and create test directory
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch {
      // Directory might not exist, that's fine
    }
    await fs.mkdir(TEST_DIR, { recursive: true });

    vi.resetAllMocks();
  });

  it('should create package.json if it does not exist', async () => {
    await setupTemplates({ workflow: true, changelog: false, hooks: false }, TEMPLATES, TEST_DIR);

    const pkgJson = JSON.parse(await fs.readFile(path.join(TEST_DIR, 'package.json'), 'utf-8'));
    expect(pkgJson).toEqual({
      name: path.basename(TEST_DIR),
      version: '0.1.0',
      private: true,
      type: 'module',
      scripts: {
        test: 'echo "add your test command here"',
      },
    });
  });

  it('should not create package.json if it already exists', async () => {
    // Create package.json first
    const existingPkg = {
      name: 'existing-project',
      version: '1.0.0',
      private: true,
      type: 'module',
      scripts: {
        test: 'echo "add your test command here"',
      },
    };
    await fs.writeFile(path.join(TEST_DIR, 'package.json'), JSON.stringify(existingPkg, null, 2));

    await setupTemplates({ workflow: true, changelog: false, hooks: false }, TEMPLATES, TEST_DIR);

    // Verify package.json wasn't modified
    const pkgJson = JSON.parse(await fs.readFile(path.join(TEST_DIR, 'package.json'), 'utf-8'));
    expect(pkgJson).toEqual(existingPkg);
  });

  it('should process workflow templates when workflow is true', async () => {
    await setupTemplates({ workflow: true, changelog: false, hooks: false }, TEMPLATES, TEST_DIR);

    // Verify workflow file exists and has content
    const workflowPath = path.join(TEST_DIR, '.github/workflows/release.yml');
    const content = await fs.readFile(workflowPath, 'utf-8');
    expect(content).toContain('name: Release');
  });

  it('should process changelog templates when changelog is true', async () => {
    await setupTemplates({ workflow: false, changelog: true, hooks: false }, TEMPLATES, TEST_DIR);

    // Verify versionrc exists and has content
    const content = await fs.readFile(path.join(TEST_DIR, '.versionrc'), 'utf-8');
    expect(content).toBeTruthy();
  });

  it('should process both workflow and changelog templates when both are true', async () => {
    await setupTemplates({ workflow: true, changelog: true, hooks: false }, TEMPLATES, TEST_DIR);

    // Verify both files exist
    const workflowPath = path.join(TEST_DIR, '.github/workflows/release.yml');
    const content = await fs.readFile(workflowPath, 'utf-8');
    expect(content).toContain('name: Release');

    const versionrcPath = path.join(TEST_DIR, '.versionrc');
    const versionrcContent = await fs.readFile(versionrcPath, 'utf-8');
    expect(versionrcContent).toBeTruthy();
  });

  it('should use specified language for templates', async () => {
    await setupTemplates({ workflow: true, changelog: true, hooks: false, language: 'go' }, TEMPLATES, TEST_DIR);

    // Verify Go-specific workflow file exists and has Go-specific content
    const workflowPath = path.join(TEST_DIR, '.github/workflows/release.yml');
    const content = await fs.readFile(workflowPath, 'utf-8');
    expect(content).toContain('Setup Go');
  });

  it('should throw error with message when directory cannot be created', async () => {
    // Make a file where we want a directory to prevent directory creation
    await fs.mkdir(path.join(TEST_DIR, '.github'), { recursive: true });
    await fs.writeFile(path.join(TEST_DIR, '.github/workflows'), ''); // This will prevent creating workflows directory

    await expect(setupTemplates({ workflow: true, changelog: false, hooks: false }, TEMPLATES, TEST_DIR)).rejects.toThrow();
  });

  it('should create destination directories before writing files', async () => {
    await setupTemplates({ workflow: true, changelog: true, hooks: false }, TEMPLATES, TEST_DIR);

    // Verify directories exist
    await expect(fs.access(path.join(TEST_DIR, '.github'))).resolves.toBeUndefined();
    await expect(fs.access(path.join(TEST_DIR, '.github/workflows'))).resolves.toBeUndefined();
  });

  it('should show final success message when all templates are configured', async () => {
    await setupTemplates({ workflow: true, changelog: true, hooks: false }, TEMPLATES, TEST_DIR);
  });

  it('should use module name from go.mod only when language is go', async () => {
    // Create a go.mod file first
    const goModContent = `module github.com/silvabyte/AudeticLinkInstaller

go 1.22.5

require (
    github.com/alecthomas/kong v1.8.1
    github.com/fatih/color v1.16.0
)`;
    await fs.writeFile(path.join(TEST_DIR, 'go.mod'), goModContent);

    // Test with Go language - should use go.mod name
    await setupTemplates({ workflow: true, changelog: false, hooks: false, language: 'go' }, TEMPLATES, TEST_DIR);
    let pkgJson = JSON.parse(await fs.readFile(path.join(TEST_DIR, 'package.json'), 'utf-8'));
    expect(pkgJson).toEqual({
      name: 'AudeticLinkInstaller',
      version: '0.1.0',
      private: true,
      type: 'module',
      scripts: {
        test: 'echo "add your test command here"',
      },
    });

    // Delete package.json and test with Node language - should use directory name
    await fs.unlink(path.join(TEST_DIR, 'package.json'));
    await setupTemplates({ workflow: true, changelog: false, hooks: false, language: 'node' }, TEMPLATES, TEST_DIR);
    pkgJson = JSON.parse(await fs.readFile(path.join(TEST_DIR, 'package.json'), 'utf-8'));
    expect(pkgJson).toEqual({
      name: path.basename(TEST_DIR),
      version: '0.1.0',
      private: true,
      type: 'module',
      scripts: {
        test: 'echo "add your test command here"',
      },
    });
  });

  it('should handle go module paths correctly', async () => {
    // Create a go.mod file with a full module path
    const modulePath = 'github.com/silvabyte/AudeticLinkInstaller';
    const goModContent = `module ${modulePath}

go 1.22.5

require (
    github.com/alecthomas/kong v1.8.1
    github.com/fatih/color v1.16.0
)`;
    await fs.writeFile(path.join(TEST_DIR, 'go.mod'), goModContent);

    // Test with Go language
    await setupTemplates({ workflow: true, changelog: false, hooks: false, language: 'go' }, TEMPLATES, TEST_DIR);

    // Verify package.json uses just the project name
    const pkgJson = JSON.parse(await fs.readFile(path.join(TEST_DIR, 'package.json'), 'utf-8'));
    expect(pkgJson.name).toBe('AudeticLinkInstaller');

    // Verify go.mod still has the full module path
    const updatedGoMod = await fs.readFile(path.join(TEST_DIR, 'go.mod'), 'utf-8');
    expect(updatedGoMod).toContain(`module ${modulePath}`);
  });
});

describe('updateVersionInFile', () => {
  beforeEach(async () => {
    // Clean up and create test directory
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch {
      // Directory might not exist, that's fine
    }
    await fs.mkdir(TEST_DIR, { recursive: true });
  });

  it('should update version in package.json', async () => {
    // Create test package.json
    const pkgJson = {
      name: 'test-project',
      version: '1.0.0',
    };
    const pkgPath = path.join(TEST_DIR, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify(pkgJson, null, 2));

    // Update version
    await updateVersionInFile({
      path: pkgPath,
      pattern: '"version":\\s*"([^"]+)"',
      template: '"version": "${version}"',
      version: '2.0.0',
    });

    // Verify update
    const updated = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
    expect(updated.version).toBe('2.0.0');
  });

  it('should preserve module path in go.mod while updating', async () => {
    // Test cases for different module path formats
    const testCases = [
      {
        desc: 'module path without version',
        input: 'module github.com/user/project',
        expected: 'module github.com/user/project',
      },
      {
        desc: 'module path with version',
        input: 'module github.com/user/project/v2',
        expected: 'module github.com/user/project/v2',
      },
    ];

    for (const tc of testCases) {
      // Create test go.mod
      const goModContent = `${tc.input}

go 1.22.5

require (
    github.com/alecthomas/kong v1.8.1
)`;
      const goModPath = path.join(TEST_DIR, 'go.mod');
      await fs.writeFile(goModPath, goModContent);

      // Update with pattern that should preserve module path
      await updateVersionInFile({
        path: goModPath,
        pattern: '^module\\s+([^\\s]+)',
        template: 'module ${1}',
        version: '2.0.0', // This version should not affect the output
      });

      // Verify module path is preserved exactly as it was
      const updated = await fs.readFile(goModPath, 'utf-8');
      expect(updated).toContain(tc.expected);
      expect(updated).not.toContain('${1}'); // Make sure template placeholder is replaced
    }
  });

  it('should handle multiple capture groups', async () => {
    // Create test file with multiple groups
    const testPath = path.join(TEST_DIR, 'test.txt');
    await fs.writeFile(testPath, 'prefix-abc-xyz-suffix');

    // Update with multiple capture groups
    await updateVersionInFile({
      path: testPath,
      pattern: 'prefix-([^-]+)-([^-]+)-suffix',
      template: 'prefix-${1}-${version}-${2}-suffix',
      version: '2.0.0',
    });

    // Verify all placeholders are replaced correctly
    const updated = await fs.readFile(testPath, 'utf-8');
    expect(updated).toBe('prefix-abc-2.0.0-xyz-suffix');
  });

  it('should throw error if file does not exist', async () => {
    const nonExistentPath = path.join(TEST_DIR, 'nonexistent.txt');

    await expect(
      updateVersionInFile({
        path: nonExistentPath,
        pattern: 'version:\\s*(.*)',
        template: 'version: ${version}',
        version: '1.0.0',
      })
    ).rejects.toThrow();
  });
});
