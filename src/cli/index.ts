#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init.js';
import { addCommand } from './commands/add.js';

const program = new Command();

program
  .name('release-toolkit')
  .description('A reusable release infrastructure toolkit for Node.js projects')
  .version('0.1.0');

// Initialize command
program
  .command('init')
  .description('Initialize release toolkit in your project')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .action(initCommand);

// Add command
program
  .command('add')
  .description('Add individual components to your project')
  .argument('<component>', 'Component to add (workflow, changelog, hooks)')
  .action(addCommand);

// Error handling
program.on('command:*', () => {
  console.error(chalk.red('Invalid command'));
  console.log(`See ${chalk.blue('--help')} for a list of available commands.`);
  process.exit(1);
});

program.parse(); 