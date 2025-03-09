import ora from 'ora';
import chalk from 'chalk';
import { setupGitHooks } from '../../core/hooks.js';
import { setupTemplates, TEMPLATES } from '../../core/template.js';

type Component = 'workflow' | 'changelog' | 'hooks';

export async function addCommand(component: Component, installationDir: string = process.cwd()): Promise<void> {
  const spinner = ora();

  try {
    switch (component) {
      case 'workflow':
        spinner.start('Adding GitHub Actions workflow...');
        await setupTemplates({ workflow: true, changelog: false, hooks: false }, TEMPLATES, installationDir);
        spinner.succeed('GitHub Actions workflow added successfully');
        break;

      case 'changelog':
        spinner.start('Adding changelog configuration...');
        await setupTemplates({ workflow: false, changelog: true, hooks: false }, TEMPLATES, installationDir);
        spinner.succeed('Changelog configuration added successfully');
        break;

      case 'hooks':
        spinner.start('Setting up Git hooks...');
        await setupGitHooks(installationDir);
        spinner.succeed('Git hooks configured successfully');
        break;

      default:
        console.error(chalk.red(`Invalid component: ${component}`));
        console.log('Available components:');
        console.log('  - workflow: GitHub Actions release workflow');
        console.log('  - changelog: Changelog generation setup');
        console.log('  - hooks: Git hooks configuration');
        process.exit(1);
    }

    console.log(chalk.green(`\n✨ Component '${component}' added successfully!`));
  } catch (error) {
    spinner.fail(`Failed to add component '${component}'`);
    console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : 'Unknown error occurred'}`));
    process.exit(1);
  }
}
