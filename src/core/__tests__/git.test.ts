import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupGitHooks, createAndPushTag, commitAndPush } from '../git.js';
import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';

// Mock external dependencies
vi.mock('execa');
vi.mock('fs/promises');
vi.mock('path');

describe('setupGitHooks', () => {
  const mockPackageJson = {
    scripts: {},
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();

    // Setup default mock implementations
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
    vi.mocked(fs.access).mockRejectedValue(new Error('File not found'));
    vi.mocked(fs.readFile).mockImplementation((path) => {
      if (path === 'package.json') {
        return Promise.resolve(JSON.stringify(mockPackageJson));
      }
      throw new Error('File not found');
    });
    vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
    vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '' } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create .husky directory and initialize husky', async () => {
    await setupGitHooks();

    expect(fs.mkdir).toHaveBeenCalledWith('.husky', { recursive: true });
    expect(execa).toHaveBeenCalledWith('npx', ['husky', 'init']);
  });

  it('should create hook files with correct content and permissions', async () => {
    await setupGitHooks();

    // Check commit-msg hook
    expect(fs.writeFile).toHaveBeenCalledWith('.husky/commit-msg', 'npx --no -- commitlint --edit $1', { mode: 0o755 });
  });

  it('should create commitlint config if it does not exist', async () => {
    await setupGitHooks();

    expect(fs.writeFile).toHaveBeenCalledWith('commitlint.config.js', "export default { extends: ['@commitlint/config-conventional'] };");
  });

  it('should skip creating commitlint config if it already exists', async () => {
    // Mock fs.access to indicate commitlint config exists
    vi.mocked(fs.access).mockImplementation((path) => {
      if (path === 'commitlint.config.js') {
        return Promise.resolve(undefined);
      }
      return Promise.reject(new Error('File not found'));
    });

    await setupGitHooks();

    // Should not write commitlint config
    expect(fs.writeFile).not.toHaveBeenCalledWith('commitlint.config.js', expect.any(String));
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

  it('should skip husky setup if already configured', async () => {
    // Mock package.json with husky in prepare script
    vi.mocked(fs.readFile).mockImplementation((path) => {
      if (path === 'package.json') {
        return Promise.resolve(
          JSON.stringify({
            scripts: {
              prepare: 'npx husky init',
            },
          })
        );
      }
      throw new Error('File not found');
    });

    await setupGitHooks();

    // Should not initialize husky again
    expect(execa).not.toHaveBeenCalledWith('npx', ['husky', 'init']);
  });

  it('should skip commitlint setup if already configured in package.json', async () => {
    // Mock package.json with commitlint config
    vi.mocked(fs.readFile).mockImplementation((path) => {
      if (path === 'package.json') {
        return Promise.resolve(
          JSON.stringify({
            scripts: {},
            commitlint: {
              extends: ['@commitlint/config-conventional'],
            },
          })
        );
      }
      throw new Error('File not found');
    });

    await setupGitHooks();

    // Should not create commitlint config or install dependencies
    expect(fs.writeFile).not.toHaveBeenCalledWith('commitlint.config.js', expect.any(String));
    expect(execa).not.toHaveBeenCalledWith('npm', expect.arrayContaining(['@commitlint/cli']));
  });
});

describe('createAndPushTag', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should create and push tag successfully', async () => {
    vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '' } as any);

    await expect(createAndPushTag('1.0.0')).resolves.not.toThrow();

    expect(execa).toHaveBeenCalledWith('git', ['tag', '-a', 'v1.0.0', '-m', 'Release v1.0.0']);
    expect(execa).toHaveBeenCalledWith('git', ['push', 'origin', 'v1.0.0']);
  });

  it('should throw if tag creation fails', async () => {
    vi.mocked(execa).mockRejectedValueOnce(new Error('Tag already exists'));

    await expect(createAndPushTag('1.0.0')).rejects.toThrow('Tag already exists');
  });

  it('should throw if tag push fails', async () => {
    vi.mocked(execa)
      .mockResolvedValueOnce({ stdout: '', stderr: '' } as any)
      .mockRejectedValueOnce(new Error('Network error'));

    await expect(createAndPushTag('1.0.0')).rejects.toThrow('Network error');
  });
});

describe('commitAndPush', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should commit and push changes successfully', async () => {
    vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '' } as any);

    await expect(commitAndPush('1.0.0')).resolves.not.toThrow();

    expect(execa).toHaveBeenCalledWith('git', ['add', '.']);
    expect(execa).toHaveBeenCalledWith('git', ['commit', '-m', 'chore: release v1.0.0']);
    expect(execa).toHaveBeenCalledWith('git', ['push']);
  });

  it('should throw error with message when commit fails', async () => {
    vi.mocked(execa).mockRejectedValueOnce(new Error('Network error'));

    await expect(commitAndPush('1.0.0')).rejects.toThrow('Network error');
  });
});
