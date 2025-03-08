import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupTemplates } from '../template.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Mock external dependencies
vi.mock('fs/promises');
vi.mock('path');
vi.mock('url');

describe('setupTemplates', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Setup default mock implementations
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue('{}');
    vi.mocked(fs.access).mockRejectedValue(new Error('File not found'));
    vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
    vi.mocked(path.dirname).mockImplementation((p) => p.split('/').slice(0, -1).join('/'));
    vi.mocked(fileURLToPath).mockReturnValue('/mock/path');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should process workflow templates when workflow is true', async () => {
    await setupTemplates({ workflow: true, changelog: false, hooks: false });

    expect(fs.mkdir).toHaveBeenCalledWith('.github/workflows', { recursive: true });
    expect(fs.writeFile).toHaveBeenCalledWith('.github/workflows/release.yml', expect.any(String));
  });

  it('should process changelog templates when changelog is true', async () => {
    await setupTemplates({ workflow: false, changelog: true, hooks: false });

    expect(fs.writeFile).toHaveBeenCalledWith('.versionrc', expect.any(String));
    expect(fs.writeFile).toHaveBeenCalledWith('scripts/generate-changelog.js', expect.any(String));
  });

  it('should update package.json scripts when changelog is true', async () => {
    const mockPackageJson = {
      scripts: {
        test: 'vitest',
      },
    };
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson));
    vi.mocked(fs.access).mockResolvedValue(undefined);

    await setupTemplates({ workflow: false, changelog: true, hooks: false });

    expect(fs.writeFile).toHaveBeenCalledWith(
      'package.json',
      JSON.stringify(
        {
          scripts: {
            test: 'vitest',
            release: 'standard-version',
            'generate-changelog': 'node scripts/generate-changelog.js',
          },
        },
        null,
        2
      )
    );
  });

  it('should skip package.json update if file does not exist', async () => {
    await setupTemplates({ workflow: false, changelog: true, hooks: false });

    expect(fs.writeFile).not.toHaveBeenCalledWith('package.json', expect.any(String));
  });

  it('should process both workflow and changelog templates when both are true', async () => {
    await setupTemplates({ workflow: true, changelog: true, hooks: false });

    // Check workflow files
    expect(fs.writeFile).toHaveBeenCalledWith('.github/workflows/release.yml', expect.any(String));

    // Check changelog files
    expect(fs.writeFile).toHaveBeenCalledWith('.versionrc', expect.any(String));
    expect(fs.writeFile).toHaveBeenCalledWith('scripts/generate-changelog.js', expect.any(String));
  });

  it('should throw error with message when setup fails', async () => {
    const errorMessage = 'Failed to create directory';
    vi.mocked(fs.mkdir).mockRejectedValue(new Error(errorMessage));

    await expect(setupTemplates({ workflow: true, changelog: false, hooks: false })).rejects.toThrow(
      `Failed to setup templates: ${errorMessage}`
    );
  });

  it('should create destination directories before writing files', async () => {
    await setupTemplates({ workflow: true, changelog: true, hooks: false });

    // Check that directories are created before files are written
    const mkdirCalls = vi.mocked(fs.mkdir).mock.calls.map((call) => call[0]);
    const writeFileCalls = vi.mocked(fs.writeFile).mock.calls.map((call) => call[0]);

    for (const writeFile of writeFileCalls) {
      const dir = path.dirname(writeFile as string);
      expect(mkdirCalls).toContain(dir);
      expect(vi.mocked(fs.mkdir).mock.invocationCallOrder[mkdirCalls.indexOf(dir)]).toBeLessThan(
        vi.mocked(fs.writeFile).mock.invocationCallOrder[writeFileCalls.indexOf(writeFile)]
      );
    }
  });
});
