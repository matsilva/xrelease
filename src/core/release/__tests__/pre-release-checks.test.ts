import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execa } from 'execa';
import fs from 'fs/promises';
import { runPreReleaseChecks } from '../pre-release-checks.js';

// Mock dependencies
vi.mock('execa');
vi.mock('fs/promises');

describe('runPreReleaseChecks', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should run configured checks successfully', async () => {
    // Mock config file
    vi.mocked(fs.readFile).mockResolvedValue(`
      release:
        checks:
          - type: lint
            command: npm run lint
          - type: test
            command: npm test
    `);

    vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '' } as any);

    await expect(runPreReleaseChecks()).resolves.not.toThrow();
    expect(execa).toHaveBeenCalledTimes(2);
  });

  it('should skip checks if no config file exists', async () => {
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'));

    await expect(runPreReleaseChecks()).resolves.not.toThrow();
    expect(execa).not.toHaveBeenCalled();
  });

  it('should skip checks if no checks configured', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(`
      release:
        branch: main
    `);

    await expect(runPreReleaseChecks()).resolves.not.toThrow();
    expect(execa).not.toHaveBeenCalled();
  });

  it('should throw if a check fails', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(`
      release:
        checks:
          - type: lint
            command: npm run lint
    `);

    vi.mocked(execa).mockRejectedValue(new Error('lint failed'));

    await expect(runPreReleaseChecks()).rejects.toThrow('lint check failed: lint failed');
  });
});
