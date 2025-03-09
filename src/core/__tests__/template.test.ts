import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupTemplates } from '../template.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { TEMPLATES } from '../template.js';

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
    });
  });

  it('should not create package.json if it already exists', async () => {
    // Create package.json first
    const existingPkg = {
      name: 'existing-project',
      version: '1.0.0',
      private: true,
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
});
