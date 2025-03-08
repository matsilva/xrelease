import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ComponentConfig, TemplateConfig } from '../types/index.js';

const TEMPLATE_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../templates'
);

const TEMPLATES: Record<string, TemplateConfig[]> = {
  workflow: [
    {
      source: 'github-workflows/release.yml',
      destination: '.github/workflows/release.yml'
    }
  ],
  changelog: [
    {
      source: 'configs/versionrc.json',
      destination: '.versionrc'
    },
    {
      source: 'scripts/generate-changelog.js',
      destination: 'scripts/generate-changelog.js'
    }
  ]
};

export async function setupTemplates(components: ComponentConfig): Promise<void> {
  try {
    // Process workflow templates
    if (components.workflow) {
      await processTemplates(TEMPLATES.workflow);
    }

    // Process changelog templates
    if (components.changelog) {
      await processTemplates(TEMPLATES.changelog);
      
      // Update package.json with changelog scripts
      const pkgPath = 'package.json';
      const pkgExists = await fs.access(pkgPath)
        .then(() => true)
        .catch(() => false);

      if (pkgExists) {
        const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
        pkg.scripts = {
          ...pkg.scripts,
          release: 'standard-version',
          'generate-changelog': 'node scripts/generate-changelog.js'
        };
        await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
      }
    }
  } catch (error) {
    throw new Error(
      `Failed to setup templates: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
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