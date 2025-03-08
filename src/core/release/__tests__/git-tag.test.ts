import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execa } from 'execa';
import { createAndPushTag } from '../git-tag.js';

// Mock dependencies
vi.mock('execa');

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
