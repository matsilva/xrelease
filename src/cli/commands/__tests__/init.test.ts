import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initCommand } from '../init.js';
import inquirer from 'inquirer';
import ora, { Ora } from 'ora';
import chalk from 'chalk';
import { setupGitHooks } from '../../../core/git.js';
import { setupTemplates } from '../../../core/template.js';

// Mock dependencies
vi.mock('inquirer');
vi.mock('ora');
vi.mock('chalk', async () => {
  const actual = await vi.importActual('chalk');
  return {
    ...actual,
    default: {
      green: (str: string) => str,
      cyan: (str: string) => str,
      red: (str: string) => str,
    },
  };
});
vi.mock('../../../core/git.js');
vi.mock('../../../core/template.js');

describe('initCommand', () => {
  const mockSpinner: Partial<Ora> = {
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
    render: vi.fn().mockReturnThis(),
    frame: vi.fn().mockReturnThis(),
    text: '',
    isSpinning: false,
  };

  beforeEach(() => {
    vi.resetAllMocks();

    // Setup default mock implementations
    vi.mocked(ora).mockReturnValue(mockSpinner as Ora);
    vi.mocked(setupGitHooks).mockResolvedValue(undefined);
    vi.mocked(setupTemplates).mockResolvedValue(undefined);
  });

  it('should use default components when --yes flag is provided', async () => {
    await initCommand({ yes: true });

    expect(inquirer.prompt).not.toHaveBeenCalled();
    expect(setupTemplates).toHaveBeenCalledWith({
      workflow: true,
      changelog: true,
      hooks: true,
    });
  });

  it('should prompt for component selection when --yes flag is not provided', async () => {
    vi.mocked(inquirer.prompt).mockResolvedValue({
      components: ['workflow', 'changelog'],
    });

    await initCommand({ yes: false });

    expect(inquirer.prompt).toHaveBeenCalledWith([
      expect.objectContaining({
        type: 'checkbox',
        name: 'components',
        message: 'Select components to initialize:',
        choices: expect.arrayContaining([
          expect.objectContaining({ value: 'workflow' }),
          expect.objectContaining({ value: 'changelog' }),
          expect.objectContaining({ value: 'hooks' }),
        ]),
      }),
    ]);

    expect(setupTemplates).toHaveBeenCalledWith({
      workflow: true,
      changelog: true,
      hooks: false,
    });
  });

  it('should setup Git hooks when selected', async () => {
    vi.mocked(inquirer.prompt).mockResolvedValue({
      components: ['hooks'],
    });

    await initCommand({ yes: false });

    expect(setupGitHooks).toHaveBeenCalled();
    expect(mockSpinner.succeed).toHaveBeenCalledWith('Git hooks configured successfully');
  });

  it('should show success message on completion', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await initCommand({ yes: true });

    expect(consoleSpy).toHaveBeenCalledWith('\n✨ Release toolkit initialized successfully!');
    expect(consoleSpy).toHaveBeenCalledWith('\nNext steps:');
  });

  it('should handle errors and show error message', async () => {
    const error = new Error('Setup failed');
    vi.mocked(setupTemplates).mockRejectedValue(error);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const processSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    await initCommand({ yes: true });

    expect(mockSpinner.fail).toHaveBeenCalledWith('Initialization failed');
    expect(consoleSpy).toHaveBeenCalledWith('\nError: Setup failed');
    expect(processSpy).toHaveBeenCalledWith(1);
  });

  it('should handle non-Error objects in error handling', async () => {
    vi.mocked(setupTemplates).mockRejectedValue('String error');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const processSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    await initCommand({ yes: true });

    expect(mockSpinner.fail).toHaveBeenCalledWith('Initialization failed');
    expect(consoleSpy).toHaveBeenCalledWith('\nError: Unknown error occurred');
    expect(processSpy).toHaveBeenCalledWith(1);
  });
});
