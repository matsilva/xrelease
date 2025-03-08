import ora from 'ora';
import chalk from 'chalk';
import fs from 'fs/promises';
import { readConfig } from '../../core/config.js';
import { checkBranch } from '../../core/release/check-branch.js';
import { runPreReleaseChecks } from '../../core/release/pre-release-checks.js';
import { bumpVersion, type BumpType } from '../../core/release/bump-version.js';
import { generateChangelog } from '../../core/release/generate-changelog.js';
import { createAndPushTag } from '../../core/release/git-tag.js';
import { execa } from 'execa';

interface CreateOptions {
  ci?: boolean;
  bump?: BumpType;
  branch?: string;
  config?: string;
}

export async function createCommand(options: CreateOptions): Promise<void> {
  const spinner = ora();

  try {
    // Read config first to determine release process
    const config = await readConfig(options.config);

    // 1. Check current branch
    spinner.start('Checking current branch...');
    await checkBranch(options.branch, options.config);
    spinner.succeed('Branch check passed');

    // 2. Run pre-release checks
    spinner.start('Running pre-release checks...');
    await runPreReleaseChecks(options.config);
    spinner.succeed('Pre-release checks passed');

    // 3. Bump version
    spinner.start('Bumping version...');
    const newVersion = await bumpVersion(options.bump || config.release.defaultBump);
    spinner.succeed(`Version bumped to ${newVersion}`);

    // 4. Update version in configured files
    if (config.release.version?.files?.length) {
      spinner.start('Updating version in configured files...');
      for (const file of config.release.version.files) {
        try {
          const content = await fs.readFile(file.path, 'utf-8');
          const regex = new RegExp(file.pattern);
          const newContent = content.replace(regex, file.template.replace('${version}', newVersion));
          await fs.writeFile(file.path, newContent);
        } catch (error) {
          throw new Error(`Failed to update version in ${file.path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      spinner.succeed('Version updated in all configured files');
    }

    // 5. Generate changelog if enabled
    if (config.release.changelog?.enabled) {
      spinner.start('Generating changelog...');
      await generateChangelog(newVersion, config.release.changelog.template);
      spinner.succeed('Changelog updated');
    }

    // 6. Run post-release actions
    if (config.release.actions?.length) {
      for (const action of config.release.actions) {
        const actionName = action.name || action.type;
        spinner.start(`Running ${actionName}...`);

        switch (action.type) {
          case 'git-tag':
            await createAndPushTag(newVersion);
            break;
          case 'github-release':
            // TODO: Implement GitHub release creation
            break;
          case 'custom':
            if (action.command) {
              try {
                await execa(action.command, { shell: true });
              } catch (error) {
                throw new Error(`Custom action '${actionName}' failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
              }
            }
            break;
          default:
            console.warn(chalk.yellow(`Unknown action type: ${action.type}`));
        }

        spinner.succeed(`${actionName} completed`);
      }
    }

    console.log(chalk.green(`\n✨ Release v${newVersion} created successfully!`));
  } catch (error) {
    spinner.fail('Failed to create release');
    console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : 'Unknown error occurred'}`));
    if (!options.ci) {
      console.log('\nTry running with --ci flag for more detailed output');
    }
    process.exit(1);
  }
}
