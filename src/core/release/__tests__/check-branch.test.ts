import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execa } from 'execa';
import fs from 'fs/promises';
import { checkBranch } from '../check-branch.js';

// Mock dependencies
vi.mock('execa');
vi.mock('fs/promises');

describe('checkBranch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should pass when on a configured branch', async () => {
    // Mock git command
    vi.mocked(execa).mockResolvedValue({ stdout: 'main', stderr: '' } as any);

    // Mock config file
    vi.mocked(fs.readFile).mockResolvedValue(`
      release:
        branch: main
    `);

    await expect(checkBranch()).resolves.not.toThrow();
  });

  it('should pass when on one of multiple configured branches', async () => {
    // Mock git command
    vi.mocked(execa).mockResolvedValue({ stdout: 'hotfix/1.0.1', stderr: '' } as any);

    // Mock config file with multiple allowed branches
    vi.mocked(fs.readFile).mockResolvedValue(`
      release:
        branches:
          - main
          - develop
          - hotfix/*
    `);

    await expect(checkBranch()).resolves.not.toThrow();
  });

  it('should pass when branch is overridden', async () => {
    // Mock git command
    vi.mocked(execa).mockResolvedValue({ stdout: 'feature/test', stderr: '' } as any);

    // Mock config file with different branch
    vi.mocked(fs.readFile).mockResolvedValue(`
      release:
        branch: main
    `);

    await expect(checkBranch('feature/test')).resolves.not.toThrow();
  });

  it('should use main as default when no config exists', async () => {
    // Mock git command
    vi.mocked(execa).mockResolvedValue({ stdout: 'develop', stderr: '' } as any);

    // Mock missing config file
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'));

    await expect(checkBranch()).rejects.toThrow("Release must be created from one of these branches: 'main'");
  });

  it('should throw when on wrong branch', async () => {
    // Mock git command
    vi.mocked(execa).mockResolvedValue({ stdout: 'feature/test', stderr: '' } as any);

    // Mock config file
    vi.mocked(fs.readFile).mockResolvedValue(`
      release:
        branches:
          - main
          - hotfix/*
    `);

    await expect(checkBranch()).rejects.toThrow("Release must be created from one of these branches: 'main', 'hotfix/*'");
  });

  it('should throw when git command fails', async () => {
    vi.mocked(execa).mockRejectedValue(new Error('git command failed'));

    await expect(checkBranch()).rejects.toThrow('git command failed');
  });

  it('should throw when config file is invalid', async () => {
    // Mock git command
    vi.mocked(execa).mockResolvedValue({ stdout: 'main', stderr: '' } as any);

    // Mock invalid config file
    vi.mocked(fs.readFile).mockResolvedValue('invalid: yaml: content');

    await expect(checkBranch()).rejects.toThrow();
  });
});
