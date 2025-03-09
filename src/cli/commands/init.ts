import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { setupGitHooks } from '../../core/hooks.js';

import { setupTemplates, TEMPLATES } from '../../core/template.js';
import type { InitOptions } from '../../types/index.js';

export async function initCommand(options: InitOptions): Promise<void> {
  const spinner = ora();
  const configFile = options.configPath || (process.env.NODE_ENV === 'test' ? '.testxrelease.yml' : '.xrelease.yml');
  const installationDir = options.installationDir || process.cwd();

  try {
    let components = {
      workflow: true,
      changelog: true,
      hooks: true,
      language: options.language || 'node',
    };

    if (!options.yes) {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'language',
          message: 'Select your project language:',
          choices: [
            { name: 'Node.js', value: 'node' },
            { name: 'Go', value: 'go' },
          ],
          default: options.language || 'node',
        },
        {
          type: 'checkbox',
          name: 'components',
          message: 'Select components to initialize:',
          choices: [
            { name: 'GitHub Actions workflow', value: 'workflow', checked: true },
            { name: 'Changelog generation', value: 'changelog', checked: true },
            { name: 'Git hooks', value: 'hooks', checked: true },
          ],
        },
      ]);

      components = {
        workflow: answers.components.includes('workflow'),
        changelog: answers.components.includes('changelog'),
        hooks: answers.components.includes('hooks'),
        language: answers.language,
      };
    }

    // Setup templates
    await setupTemplates(components, TEMPLATES, installationDir);

    // Setup Git hooks if selected
    if (components.hooks) {
      spinner.start('Setting up Git hooks...');
      await setupGitHooks(options.installationDir);
      spinner.succeed('Git hooks configured successfully');
    }

    // Get template path for .xrelease.yml
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const templatePath = path.join(__dirname, '../../templates', `xrelease.${components.language}.yml`);

    // Create config file
    spinner.start(`Creating ${configFile}...`);
    // Read template
    const template = await fs.readFile(templatePath, 'utf-8');

    try {
      await fs.access(configFile);
      if (!options.yes) {
        spinner.fail(`${configFile} already exists. Use --yes to overwrite`);
        return;
      }
      spinner.info(`${configFile} exists, overwriting...`);
    } catch {
      // Create directory if it doesn't exist
      const configDir = path.dirname(configFile);
      if (configDir !== '.') {
        await fs.mkdir(configDir, { recursive: true });
      }
    }

    await fs.writeFile(configFile, template);
    spinner.succeed(`Created ${configFile}`);
    // Create .gitignore if it doesn't exist
    spinner.start('Creating .gitignore...');
    try {
      await fs.access(path.join(installationDir, '.gitignore'));
      spinner.succeed('.gitignore already exists');
      //TODO: add node_modules if it doesnt exist yet
      const gitignore = await fs.readFile(path.join(installationDir, '.gitignore'), 'utf-8');
      if (!gitignore.includes('node_modules/')) {
        await fs.appendFile(path.join(installationDir, '.gitignore'), 'node_modules/\n');
      }
    } catch {
      await fs.writeFile(path.join(installationDir, '.gitignore'), 'node_modules/\n.DS_Store\n');
      spinner.succeed('Created .gitignore');
    }

    console.log('\n✨ xrelease initialized successfully!');
    console.log('\nNext steps:');
    console.log('  1. Review the generated configuration files');
    console.log(`  2. Run ${chalk.cyan('git commit')} to test the commit hooks`);
    console.log('  3. Create a new tag to test the release workflow');

    // Add language-specific instructions
    if (components.language === 'go') {
      console.log('\nGo-specific setup:');
      console.log('  1. Ensure your go.mod file is initialized');
      console.log('  2. Install golangci-lint for code quality checks');
      console.log('  3. The workflow will use package.json for version management');
    }
  } catch (error) {
    spinner.fail('Initialization failed');

    if (error instanceof Error) {
      console.error(`\nError: ${error.message}`);
    } else if (typeof error === 'string') {
      console.error('\nError: Unknown error occurred');
    } else {
      console.error('\nError: Unknown error occurred');
    }

    // Only exit in non-test environment
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }

    // In test environment, throw the error
    throw error;
  }
}
