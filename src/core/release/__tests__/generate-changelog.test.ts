import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execa, type Options, type BufferEncodingOption } from 'execa';
import fs from 'fs/promises';
import { generateChangelog } from '../generate-changelog.js';

// Mock dependencies
vi.mock('execa');
vi.mock('fs/promises');

describe('generateChangelog', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01'));
  });

  it('should generate changelog with commits since last tag', async () => {
    // Mock git commands
    vi.mocked(execa).mockImplementation((file: string, options?: Options<BufferEncodingOption>) => {
      const args = Array.isArray(options) ? options : [];
      if (args[0] === 'describe') {
        return Promise.resolve({ stdout: 'v1.0.0', stderr: '' }) as any;
      }
      if (args[0] === 'log') {
        return Promise.resolve({
          stdout: 'feat: new feature\nfix: bug fix',
          stderr: '',
        }) as any;
      }
      return Promise.reject(new Error('Unknown command'));
    });

    // Mock file operations
    vi.mocked(fs.readFile).mockResolvedValue('# Changelog\n\n');
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);

    await generateChangelog('1.1.0');

    expect(fs.writeFile).toHaveBeenCalledWith(
      'CHANGELOG.md',
      expect.stringContaining('## [1.1.0] - 2024-01-01\n\n* feat: new feature\n* fix: bug fix\n\n')
    );
  });

  it('should create new changelog if none exists', async () => {
    // Mock git commands
    vi.mocked(execa).mockImplementation((file: string, options?: Options<BufferEncodingOption>) => {
      const args = Array.isArray(options) ? options : [];
      if (args[0] === 'describe') {
        return Promise.reject(new Error('No tags')); // No previous tags
      }
      if (args[0] === 'log') {
        return Promise.resolve({ stdout: 'initial commit', stderr: '' }) as any;
      }
      return Promise.reject(new Error('Unknown command'));
    });

    // Mock file operations
    vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);

    await generateChangelog('1.0.0');

    expect(fs.writeFile).toHaveBeenCalledWith('CHANGELOG.md', expect.stringContaining('## [1.0.0] - 2024-01-01\n\n* initial commit\n\n'));
  });

  it('should handle no commits since last tag', async () => {
    // Mock git commands
    vi.mocked(execa).mockImplementation((file: string, options?: Options<BufferEncodingOption>) => {
      const args = Array.isArray(options) ? options : [];
      if (args[0] === 'describe') {
        return Promise.resolve({ stdout: 'v1.0.0', stderr: '' }) as any;
      }
      if (args[0] === 'log') {
        return Promise.resolve({ stdout: '', stderr: '' }) as any;
      }
      return Promise.reject(new Error('Unknown command'));
    });

    // Mock file operations
    vi.mocked(fs.readFile).mockResolvedValue('# Changelog\n\n');
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);

    await generateChangelog('1.0.1');

    expect(fs.writeFile).toHaveBeenCalledWith('CHANGELOG.md', expect.stringContaining('## [1.0.1] - 2024-01-01\n\n* No changes\n\n'));
  });

  it('should throw if changelog update fails', async () => {
    // Mock git commands to succeed
    vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '' } as any);

    // Mock file write to fail
    vi.mocked(fs.writeFile).mockRejectedValue(new Error('Write failed'));

    await expect(generateChangelog('1.0.0')).rejects.toThrow('Write failed');
  });
});
