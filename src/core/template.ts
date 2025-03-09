import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ComponentConfig, TemplateConfig } from '../types/index.js';
import ora from 'ora';

const TEMPLATE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../templates');

const TEMPLATES: Record<string, Record<string, TemplateConfig[]>> = {
  workflow: {
    node: [
      {
        source: 'github-workflows/release.node.yml',
        destination: '.github/workflows/release.yml',
      },
    ],
    go: [
      {
        source: 'github-workflows/release.go.yml',
        destination: '.github/workflows/release.yml',
      },
    ],
  },
  changelog: {
    node: [
      {
        source: 'configs/versionrc.json',
        destination: '.versionrc',
      },
    ],
    go: [
      {
        source: 'configs/versionrc.json',
        destination: '.versionrc',
      },
    ],
  },
};

export async function setupTemplates(components: ComponentConfig): Promise<void> {
  const spinner = ora();
  spinner.start('Setting up project templates...');
  try {
    // Create package.json if it doesn't exist (for version tracking)
    spinner.start('Creating package.json...');
    const pkgStatus = await setupPackageJson();
    if (pkgStatus === 'exists') {
      spinner.succeed('package.json already exists');
    } else {
      spinner.succeed('Created package.json with default version: 0.1.0. Adjust as needed.');
    }
    // Process workflow templates
    if (components.workflow) {
      const language = components.language || 'node'; // Default to Node.js
      const workflow = TEMPLATES.workflow[language];
      spinner.start(`Setting up ${language}: ${workflow[0].destination}`);
      await processTemplates(workflow);
      spinner.succeed(`${language} workflow configured successfully`);
    }

    // Process changelog templates
    if (components.changelog) {
      const language = components.language || 'node';
      const changelog = TEMPLATES.changelog[language];
      spinner.start(`Setting up ${language}: ${changelog[0].destination}`);
      await processTemplates(changelog);
      spinner.succeed(`${language} changelog configured successfully`);
    }
    spinner.succeed('Templates configured successfully');
  } catch (error) {
    spinner.fail(`Failed to setup templates`);
    throw new Error(`Failed to setup templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function setupPackageJson(): Promise<string> {
  try {
    await fs.access('package.json');
    return 'exists';
  } catch {
    await fs.writeFile(
      'package.json',
      JSON.stringify(
        {
          name: path.basename(process.cwd()),
          version: '0.1.0',
          private: true,
        },
        null,
        2
      )
    );
    return 'created';
  }
}

async function processTemplates(templates: TemplateConfig[]): Promise<void> {
  for (const template of templates) {
    const sourcePath = path.join(TEMPLATE_DIR, template.source);

    // Ensure destination directory exists
    const destDir = path.dirname(template.destination);
    await fs.mkdir(destDir, { recursive: true });

    // Read and transform template content
    let content = await fs.readFile(sourcePath, 'utf-8');
    if (template.transform) {
      content = template.transform(content);
    }

    // Write to destination
    await fs.writeFile(template.destination, content);
  }
}

//TODO: move the xrelease template logic to this file
