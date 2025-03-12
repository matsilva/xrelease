import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { GitHookConfig } from '../types/index.js';
import ora from 'ora';

const DEFAULT_HOOKS: GitHookConfig[] = [
  {
    name: 'commit-msg',
    command: 'npx --no -- commitlint --edit $1',
  },
  //TODO: allow users to configure pre-commit hook
  // {
  //   name: 'pre-commit',
  //   command: 'npm run lint && npm test',
  // },
];

export async function detectHuskyConfig(dir = process.cwd()): Promise<boolean> {
  try {
    // Check package.json for husky config
    const pkgJson = JSON.parse(await fs.readFile(path.join(dir, 'package.json'), 'utf-8'));
    if (pkgJson.husky || pkgJson.scripts?.prepare?.includes('husky')) {
      return true;
    }

    // Check for .husky directory
    await fs.access(path.join(dir, '.husky'));
    return true;
  } catch {
    return false;
  }
}

export async function detectCommitlintConfig(dir = process.cwd()): Promise<boolean> {
  try {
    // Check for various commitlint config files
    const configFiles = [
      '.commitlintrc.json',
      '.commitlintrc.js',
      '.commitlintrc.cjs',
      '.commitlintrc.yml',
      '.commitlintrc.yaml',
      'commitlint.config.js',
      'commitlint.config.cjs',
    ];

    for (const file of configFiles) {
      try {
        await fs.access(path.join(dir, file));
        return true;
      } catch {
        continue;
      }
    }

    // Check package.json for commitlint config
    const pkgJson = JSON.parse(await fs.readFile(path.join(dir, 'package.json'), 'utf-8'));
    return !!pkgJson.commitlint;
  } catch {
    return false;
  }
}

export async function setupGitHooks(dir = process.cwd()): Promise<void> {
  const spinner = ora();
  try {
    spinner.start('Setting up Git hooks...');
    const hasHusky = await detectHuskyConfig(dir);
    const hasCommitlint = await detectCommitlintConfig(dir);

    if (!hasHusky) {
      // Ensure .husky directory exists
      spinner.start('Creating .husky directory...');
      await fs.mkdir(path.join(dir, '.husky'), { recursive: true });
      spinner.succeed('Created .husky directory');

      // Initialize husky
      spinner.start('Initializing husky...');
      await execa('npm', ['install', 'husky', '--save-dev'], { cwd: dir });
      await execa('npx', ['husky', 'init'], { cwd: dir });
      spinner.succeed('Initialized husky');
    }

    // Create hook files
    for (const hook of DEFAULT_HOOKS) {
      const hookPath = path.join(dir, '.husky', hook.name);
      spinner.start(`Creating ${hook.name} hook...`);
      // Skip commit-msg hook if commitlint is already configured
      if (hook.name === 'commit-msg' && hasCommitlint) {
        spinner.succeed(`Skipping ${hook.name} hook because commitlint is already configured`);
        continue;
      }

      // Create hook file with just the command (new husky format)
      const hookContent = hook.command;

      await fs.writeFile(hookPath, hookContent, { mode: 0o755 });
      spinner.succeed(`Created ${hook.name} hook`);

      // Setup commitlint if not already configured
      if (!hasCommitlint) {
        // Add commitlint config using modern ES modules format
        const commitlintConfig = `export default { extends: ['@commitlint/config-conventional'] };`;
        spinner.start('Creating commitlint config...');
        await fs.writeFile(path.join(dir, 'commitlint.config.js'), commitlintConfig);
        spinner.succeed('Created commitlint config');

        spinner.start('Installing commitlint dependencies...');
        // Install commitlint dependencies
        await execa('npm', ['install', '--save-dev', '@commitlint/cli', '@commitlint/config-conventional'], { cwd: dir });
        spinner.succeed('Installed commitlint dependencies');
      }
    }

    spinner.succeed('Git hooks setup complete');
  } catch (error) {
    spinner.fail('Failed to setup Git hooks');
    throw new Error(`Failed to setup Git hooks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
