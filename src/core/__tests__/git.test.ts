import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createAndPushTag, commitAndPush } from '../git.js';
import { execa } from 'execa';
// Only mock execa since we don't want to run actual git commands
vi.mock('execa');

describe('createAndPushTag', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '' } as any);
  });

  it('should create and push tag successfully', async () => {
    await createAndPushTag('1.0.0');

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
    vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '' } as any);
  });

  it('should commit and push changes successfully', async () => {
    await commitAndPush('1.0.0');

    expect(execa).toHaveBeenCalledWith('git', ['add', '.']);
    expect(execa).toHaveBeenCalledWith('git', ['commit', '-m', 'chore: release v1.0.0']);
    expect(execa).toHaveBeenCalledWith('git', ['push']);
  });

  it('should throw error with message when commit fails', async () => {
    vi.mocked(execa).mockRejectedValueOnce(new Error('Network error'));

    await expect(commitAndPush('1.0.0')).rejects.toThrow('Network error');
  });
});
