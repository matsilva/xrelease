import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ComponentConfig, TemplateConfig } from '../types/index.js';
import ora from 'ora';

export const TEMPLATE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../templates');

export const TEMPLATES: Record<string, Record<string, TemplateConfig[]>> = {
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

export async function setupTemplates(components: ComponentConfig, templates: typeof TEMPLATES, destDir = process.cwd()): Promise<void> {
  const spinner = ora();
  spinner.start('Setting up project templates...');
  try {
    // Create package.json if it doesn't exist (for version tracking)
    spinner.start('Creating package.json...');
    const pkgStatus = await setupPackageJson(destDir);
    if (pkgStatus === 'exists') {
      spinner.succeed('package.json already exists');
    } else {
      spinner.succeed('Created package.json with default version: 0.1.0. Adjust as needed.');
    }
    // Process workflow templates
    if (components.workflow) {
      const language = components.language || 'node'; // Default to Node.js
      const workflow = templates.workflow[language];
      spinner.start(`Setting up ${language}: ${workflow[0].destination}`);
      await processTemplates(workflow, destDir);
      spinner.succeed(`${language} workflow configured successfully`);
    }

    // Process changelog templates
    if (components.changelog) {
      const language = components.language || 'node';
      const changelog = templates.changelog[language];
      spinner.start(`Setting up ${language}: ${changelog[0].destination}`);
      await processTemplates(changelog, destDir);
      spinner.succeed(`${language} changelog configured successfully`);
    }
    spinner.succeed('Templates configured successfully');
  } catch (error) {
    spinner.fail(`Failed to setup templates`);
    throw new Error(`Failed to setup templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function setupPackageJson(dir = process.cwd()): Promise<string> {
  try {
    await fs.access(path.join(dir, 'package.json'));
    return 'exists';
  } catch {
    await fs.writeFile(
      path.join(dir, 'package.json'),
      JSON.stringify(
        {
          name: path.basename(dir),
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

async function processTemplates(templates: TemplateConfig[], baseDestDir = process.cwd()): Promise<void> {
  for (const template of templates) {
    const sourcePath = path.join(TEMPLATE_DIR, template.source);
    const destPath = path.join(baseDestDir, template.destination);

    // Ensure destination directory exists
    const destDir = path.dirname(destPath);
    await fs.mkdir(destDir, { recursive: true });

    // Read and transform template content
    let content = await fs.readFile(sourcePath, 'utf-8');
    if (template.transform) {
      content = template.transform(content);
    }

    // Write to destination
    await fs.writeFile(destPath, content);
  }
}

//TODO: move the xrelease template logic to this file
