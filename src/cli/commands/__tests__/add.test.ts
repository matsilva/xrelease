import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addCommand } from '../add.js';
import ora from 'ora';
import chalk from 'chalk';
import { setupGitHooks } from '../../../core/git.js';
import { setupTemplates } from '../../../core/template.js';

// Mock dependencies
vi.mock('ora');
vi.mock('chalk', async () => {
  const actual = await vi.importActual('chalk');
  return {
    ...actual,
    default: {
      red: (str: string) => str,
      green: (str: string) => str,
    },
  };
});
vi.mock('../../../core/git.js');
vi.mock('../../../core/template.js');

describe('addCommand', () => {
  const mockSpinner = {
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
  };

  beforeEach(() => {
    vi.resetAllMocks();

    // Setup default mock implementations
    vi.mocked(ora).mockReturnValue(mockSpinner as any);
    vi.mocked(setupGitHooks).mockResolvedValue(undefined);
    vi.mocked(setupTemplates).mockResolvedValue(undefined);
  });

  it('should add workflow component', async () => {
    await addCommand('workflow');

    expect(setupTemplates).toHaveBeenCalledWith({
      workflow: true,
      changelog: false,
      hooks: false,
    });
    expect(mockSpinner.succeed).toHaveBeenCalledWith('GitHub Actions workflow added successfully');
  });

  it('should add changelog component', async () => {
    await addCommand('changelog');

    expect(setupTemplates).toHaveBeenCalledWith({
      workflow: false,
      changelog: true,
      hooks: false,
    });
    expect(mockSpinner.succeed).toHaveBeenCalledWith('Changelog configuration added successfully');
  });

  it('should add hooks component', async () => {
    await addCommand('hooks');

    expect(setupGitHooks).toHaveBeenCalled();
    expect(mockSpinner.succeed).toHaveBeenCalledWith('Git hooks configured successfully');
  });

  it('should show error for invalid component', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const processSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    await addCommand('invalid' as any);

    expect(consoleSpy).toHaveBeenCalledWith('Invalid component: invalid');
    expect(processSpy).toHaveBeenCalledWith(1);
  });

  it('should handle errors when adding workflow', async () => {
    const error = new Error('Failed to add workflow');
    vi.mocked(setupTemplates).mockRejectedValue(error);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const processSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    await addCommand('workflow');

    expect(mockSpinner.fail).toHaveBeenCalledWith("Failed to add component 'workflow'");
    expect(consoleSpy).toHaveBeenCalledWith('\nError: Failed to add workflow');
    expect(processSpy).toHaveBeenCalledWith(1);
  });

  it('should handle errors when adding hooks', async () => {
    const error = new Error('Failed to add hooks');
    vi.mocked(setupGitHooks).mockRejectedValue(error);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const processSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    await addCommand('hooks');

    expect(mockSpinner.fail).toHaveBeenCalledWith("Failed to add component 'hooks'");
    expect(consoleSpy).toHaveBeenCalledWith('\nError: Failed to add hooks');
    expect(processSpy).toHaveBeenCalledWith(1);
  });

  it('should handle non-Error objects in error handling', async () => {
    vi.mocked(setupTemplates).mockRejectedValue('String error');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const processSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    await addCommand('workflow');

    expect(mockSpinner.fail).toHaveBeenCalledWith("Failed to add component 'workflow'");
    expect(consoleSpy).toHaveBeenCalledWith('\nError: Unknown error occurred');
    expect(processSpy).toHaveBeenCalledWith(1);
  });
});
