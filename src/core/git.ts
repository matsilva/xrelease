import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import type { GitHookConfig } from '../types/index.js';

const DEFAULT_HOOKS: GitHookConfig[] = [
  {
    name: 'commit-msg',
    command: 'npx --no -- commitlint --edit $1'
  },
  {
    name: 'pre-commit',
    command: 'npm run lint && npm test'
  }
];

export async function setupGitHooks(): Promise<void> {
  try {
    // Ensure .husky directory exists
    await fs.mkdir('.husky', { recursive: true });

    // Initialize husky
    await execa('npx', ['husky', 'install']);

    // Create hook files
    for (const hook of DEFAULT_HOOKS) {
      const hookPath = path.join('.husky', hook.name);
      
      // Create hook file with shebang and command
      const hookContent = [
        '#!/usr/bin/env sh',
        '. "$(dirname -- "$0")/_/husky.sh"',
        '',
        hook.command
      ].join('\n');

      await fs.writeFile(hookPath, hookContent, { mode: 0o755 });
    }

    // Add commitlint config if it doesn't exist
    const commitlintPath = '.commitlintrc.json';
    const commitlintExists = await fs.access(commitlintPath)
      .then(() => true)
      .catch(() => false);

    if (!commitlintExists) {
      const commitlintConfig = {
        extends: ['@commitlint/config-conventional']
      };
      await fs.writeFile(
        commitlintPath,
        JSON.stringify(commitlintConfig, null, 2)
      );
    }

    // Install commitlint dependencies
    await execa('npm', [
      'install',
      '--save-dev',
      '@commitlint/cli',
      '@commitlint/config-conventional'
    ]);

  } catch (error) {
    throw new Error(
      `Failed to setup Git hooks: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
} 