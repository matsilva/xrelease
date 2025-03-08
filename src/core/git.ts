import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import type { GitHookConfig } from '../types/index.js';

const DEFAULT_HOOKS: GitHookConfig[] = [
  {
    name: 'commit-msg',
    command: 'npx --no -- commitlint --edit $1',
  },
  {
    name: 'pre-commit',
    command: 'npm run lint && npm test',
  },
];

async function detectHuskyConfig(): Promise<boolean> {
  try {
    // Check package.json for husky config
    const pkgJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
    if (pkgJson.husky || pkgJson.scripts?.prepare?.includes('husky')) {
      return true;
    }

    // Check for .husky directory
    await fs.access('.husky');
    return true;
  } catch {
    return false;
  }
}

async function detectCommitlintConfig(): Promise<boolean> {
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
        await fs.access(file);
        return true;
      } catch {
        continue;
      }
    }

    // Check package.json for commitlint config
    const pkgJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
    return !!pkgJson.commitlint;
  } catch {
    return false;
  }
}

export async function setupGitHooks(): Promise<void> {
  try {
    const hasHusky = await detectHuskyConfig();
    const hasCommitlint = await detectCommitlintConfig();

    if (!hasHusky) {
      // Ensure .husky directory exists
      await fs.mkdir('.husky', { recursive: true });

      // Initialize husky
      await execa('npx', ['husky', 'install']);

      // Add husky prepare script to package.json if it doesn't exist
      const pkgJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
      if (!pkgJson.scripts?.prepare?.includes('husky')) {
        pkgJson.scripts = {
          ...pkgJson.scripts,
          prepare: pkgJson.scripts?.prepare ? `${pkgJson.scripts.prepare} && husky install` : 'husky install',
        };
        await fs.writeFile('package.json', JSON.stringify(pkgJson, null, 2));
      }
    }

    // Create hook files
    for (const hook of DEFAULT_HOOKS) {
      const hookPath = path.join('.husky', hook.name);

      // Skip commit-msg hook if commitlint is already configured
      if (hook.name === 'commit-msg' && hasCommitlint) {
        continue;
      }

      // Create hook file with shebang and command
      const hookContent = ['#!/usr/bin/env sh', '. "$(dirname -- "$0")/_/husky.sh"', '', hook.command].join('\n');

      await fs.writeFile(hookPath, hookContent, { mode: 0o755 });
    }

    // Setup commitlint if not already configured
    if (!hasCommitlint) {
      // Add commitlint config
      const commitlintConfig = {
        extends: ['@commitlint/config-conventional'],
      };
      await fs.writeFile('.commitlintrc.json', JSON.stringify(commitlintConfig, null, 2));

      // Install commitlint dependencies
      await execa('npm', ['install', '--save-dev', '@commitlint/cli', '@commitlint/config-conventional']);
    }
  } catch (error) {
    throw new Error(`Failed to setup Git hooks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
