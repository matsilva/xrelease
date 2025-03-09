import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initCommand } from '../init.js';
import { setupTemplates, TEMPLATES } from '../../../core/template.js';
import { setupGitHooks } from '../../../core/hooks.js';
import inquirer from 'inquirer';
import fs from 'fs/promises';
// Mock dependencies
vi.mock('../../../core/template.js');
vi.mock('../../../core/hooks.js');
vi.mock('inquirer');

const TEST_DIR = 'test-output/init-tests';

describe('initCommand', () => {
  beforeEach(async () => {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
    vi.resetAllMocks();
    vi.mocked(setupTemplates).mockResolvedValue(undefined);
    vi.mocked(setupGitHooks).mockResolvedValue(undefined);
    await fs.mkdir(TEST_DIR, { recursive: true });
  });

  it('should call setup functions with correct args when using --yes flag', async () => {
    await initCommand({ yes: true, installationDir: TEST_DIR });

    // Verify setupTemplates was called with correct args
    expect(setupTemplates).toHaveBeenCalledWith(
      {
        workflow: true,
        changelog: true,
        hooks: true,
        language: 'node',
      },
      TEMPLATES,
      TEST_DIR
    );

    // Verify setupGitHooks was called with correct directory
    expect(setupGitHooks).toHaveBeenCalledWith(TEST_DIR);
  });

  it('should call setup functions with correct args when using interactive mode', async () => {
    vi.mocked(inquirer.prompt).mockResolvedValue({
      language: 'go',
      components: ['workflow', 'changelog'], // Explicitly not including hooks
    });

    await initCommand({ yes: false, installationDir: TEST_DIR });

    // Verify setupTemplates was called with correct args
    expect(setupTemplates).toHaveBeenCalledWith(
      {
        workflow: true,
        changelog: true,
        hooks: false,
        language: 'go',
      },
      TEMPLATES,
      TEST_DIR
    );

    // Verify setupGitHooks was not called since hooks weren't selected
    expect(setupGitHooks).not.toHaveBeenCalled();
  });

  it('should respect CLI language option', async () => {
    await initCommand({ yes: true, installationDir: TEST_DIR, language: 'go' });

    expect(setupTemplates).toHaveBeenCalledWith(
      {
        workflow: true,
        changelog: true,
        hooks: true,
        language: 'go',
      },
      TEMPLATES,
      TEST_DIR
    );
  });
});
