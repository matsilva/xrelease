import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execa } from 'execa';
import { checkGitHubCLI, isGitHubCLIAuthenticated, createGitHubRelease } from '../gh-cli.js';

vi.mock('execa');

describe('GitHub CLI utilities', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('checkGitHubCLI', () => {
    it('should return true if gh CLI is available', async () => {
      vi.mocked(execa).mockResolvedValueOnce({ stdout: 'gh version 2.0.0' } as any);
      expect(await checkGitHubCLI()).toBe(true);
    });

    it('should return false if gh CLI is not available', async () => {
      vi.mocked(execa).mockRejectedValueOnce(new Error('command not found'));
      expect(await checkGitHubCLI()).toBe(false);
    });
  });

  describe('isGitHubCLIAuthenticated', () => {
    it('should return true if gh CLI is authenticated', async () => {
      vi.mocked(execa).mockResolvedValueOnce({ stdout: 'Logged in to github.com' } as any);
      expect(await isGitHubCLIAuthenticated()).toBe(true);
    });

    it('should return false if gh CLI is not authenticated', async () => {
      vi.mocked(execa).mockRejectedValueOnce(new Error('not logged in'));
      expect(await isGitHubCLIAuthenticated()).toBe(false);
    });
  });

  describe('createGitHubRelease', () => {
    it('should create a release with version only', async () => {
      await createGitHubRelease({ version: '1.0.0' });
      expect(execa).toHaveBeenCalledWith('gh', ['release', 'create', 'v1.0.0']);
    });

    it('should create a release with notes', async () => {
      await createGitHubRelease({ version: '1.0.0', body: 'Release notes' });
      expect(execa).toHaveBeenCalledWith('gh', ['release', 'create', 'v1.0.0', '--notes', 'Release notes']);
    });

    it('should create a release with assets', async () => {
      await createGitHubRelease({
        version: '1.0.0',
        assets: ['dist/app.js', 'dist/app.css'],
      });
      expect(execa).toHaveBeenCalledWith('gh', ['release', 'create', 'v1.0.0', '--attach', 'dist/app.js', '--attach', 'dist/app.css']);
    });

    it('should handle release creation errors', async () => {
      vi.mocked(execa).mockRejectedValueOnce(new Error('Failed to create release'));
      await expect(createGitHubRelease({ version: '1.0.0' })).rejects.toThrow('Failed to create GitHub release: Failed to create release');
    });
  });
});
