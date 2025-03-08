import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ComponentConfig, TemplateConfig } from '../types/index.js';

const TEMPLATE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../templates');

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
      {
        source: 'scripts/generate-changelog.js',
        destination: 'scripts/generate-changelog.js',
      },
    ],
    go: [
      {
        source: 'configs/versionrc.json',
        destination: '.versionrc',
      },
      {
        source: 'scripts/generate-changelog.js',
        destination: 'scripts/generate-changelog.js',
      },
    ],
  },
};

export async function setupTemplates(components: ComponentConfig): Promise<void> {
  try {
    // Process workflow templates
    if (components.workflow) {
      const language = components.language || 'node'; // Default to Node.js
      await processTemplates(TEMPLATES.workflow[language]);
    }

    // Process changelog templates
    if (components.changelog) {
      const language = components.language || 'node';
      await processTemplates(TEMPLATES.changelog[language]);

      // Update package.json with changelog scripts
      const pkgPath = 'package.json';
      const pkgExists = await fs
        .access(pkgPath)
        .then(() => true)
        .catch(() => false);

      if (pkgExists) {
        const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
        pkg.scripts = {
          ...pkg.scripts,
          'generate-changelog': 'node scripts/generate-changelog.js',
        };
        await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
      }
    }
  } catch (error) {
    throw new Error(`Failed to setup templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
