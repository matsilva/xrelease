import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupGitHooks } from '../git.js';
import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';

// Mock external dependencies
vi.mock('execa');
vi.mock('fs/promises');
vi.mock('path');

describe('setupGitHooks', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();

    // Setup default mock implementations
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
    vi.mocked(fs.access).mockRejectedValue(new Error('File not found'));
    vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
    vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '' } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create .husky directory and initialize husky', async () => {
    await setupGitHooks();

    expect(fs.mkdir).toHaveBeenCalledWith('.husky', { recursive: true });
    expect(execa).toHaveBeenCalledWith('npx', ['husky', 'install']);
  });

  it('should create hook files with correct content and permissions', async () => {
    await setupGitHooks();

    // Check commit-msg hook
    expect(fs.writeFile).toHaveBeenCalledWith('.husky/commit-msg', expect.stringContaining('npx --no -- commitlint --edit $1'), {
      mode: 0o755,
    });

    // Check pre-commit hook
    expect(fs.writeFile).toHaveBeenCalledWith('.husky/pre-commit', expect.stringContaining('npm run lint && npm test'), { mode: 0o755 });
  });

  it('should create commitlint config if it does not exist', async () => {
    await setupGitHooks();

    expect(fs.writeFile).toHaveBeenCalledWith(
      '.commitlintrc.json',
      JSON.stringify({ extends: ['@commitlint/config-conventional'] }, null, 2)
    );
  });

  it('should skip creating commitlint config if it already exists', async () => {
    // Mock fs.access to indicate file exists
    vi.mocked(fs.access).mockResolvedValue(undefined);

    await setupGitHooks();

    // Should not write commitlint config
    expect(fs.writeFile).not.toHaveBeenCalledWith('.commitlintrc.json', expect.any(String));
  });

  it('should install commitlint dependencies', async () => {
    await setupGitHooks();

    expect(execa).toHaveBeenCalledWith('npm', ['install', '--save-dev', '@commitlint/cli', '@commitlint/config-conventional']);
  });

  it('should throw error with message when setup fails', async () => {
    const errorMessage = 'Failed to create directory';
    vi.mocked(fs.mkdir).mockRejectedValue(new Error(errorMessage));

    await expect(setupGitHooks()).rejects.toThrow(`Failed to setup Git hooks: ${errorMessage}`);
  });
});
