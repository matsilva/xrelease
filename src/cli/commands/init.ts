import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { setupGitHooks } from '../../core/git.js';
import { setupTemplates } from '../../core/template.js';
import type { InitOptions } from '../../types/index.js';

export async function initCommand(options: InitOptions): Promise<void> {
  const spinner = ora();
  
  try {
    let components = {
      workflow: true,
      changelog: true,
      hooks: true
    };

    if (!options.yes) {
      const answers = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'components',
          message: 'Select components to initialize:',
          choices: [
            { name: 'GitHub Actions workflow', value: 'workflow', checked: true },
            { name: 'Changelog generation', value: 'changelog', checked: true },
            { name: 'Git hooks', value: 'hooks', checked: true }
          ]
        }
      ]);

      components = {
        workflow: answers.components.includes('workflow'),
        changelog: answers.components.includes('changelog'),
        hooks: answers.components.includes('hooks')
      };
    }

    // Setup templates
    spinner.start('Setting up project templates...');
    await setupTemplates(components);
    spinner.succeed('Templates configured successfully');

    // Setup Git hooks if selected
    if (components.hooks) {
      spinner.start('Setting up Git hooks...');
      await setupGitHooks();
      spinner.succeed('Git hooks configured successfully');
    }

    console.log(chalk.green('\n✨ Release toolkit initialized successfully!'));
    console.log('\nNext steps:');
    console.log('  1. Review the generated configuration files');
    console.log(`  2. Run ${chalk.cyan('git commit')} to test the commit hooks`);
    console.log(`  3. Create a new tag to test the release workflow`);
  } catch (error) {
    spinner.fail('Initialization failed');
    console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : 'Unknown error occurred'}`));
    process.exit(1);
  }
} 