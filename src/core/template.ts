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
    const pkgStatus = await setupPackageJson(destDir, components.language);
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

export async function setupPackageJson(dir = process.cwd(), language = 'node'): Promise<string> {
  try {
    await fs.access(path.join(dir, 'package.json'));
    //TODO: check for esm module compatibility and provide a warning if it's not compatible
    //TODO: check for test command and provide a warning if it is not set
    return 'exists';
  } catch {
    let packageName = path.basename(dir);

    // Only try to get name from go.mod if language is Go
    if (language === 'go') {
      try {
        const goModContent = await fs.readFile(path.join(dir, 'go.mod'), 'utf-8');
        const moduleMatch = goModContent.match(/^module\s+([^\s]+)/m);
        if (moduleMatch) {
          // Extract just the last part of the module path
          packageName = moduleMatch[1].split('/').pop() || packageName;
        }
      } catch {
        // go.mod doesn't exist or can't be read, use directory name
      }
    }

    await fs.writeFile(
      path.join(dir, 'package.json'),
      JSON.stringify(
        {
          name: packageName,
          version: '0.1.0',
          type: 'module',
          scripts: {
            test: 'echo "add your test command here"',
          },
          private: true,
        },
        null,
        2
      )
    );
    return 'created';
  }
}

export async function processTemplates(templates: TemplateConfig[], baseDestDir = process.cwd()): Promise<void> {
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

/**
 * Updates version strings in a file using regex pattern and template.
 * Supports both ${version} for new version and ${N} for regex capture groups.
 *
 * @example
 * // Update go.mod module path while preserving the path
 * await updateVersionInFile({
 *   path: 'go.mod',
 *   pattern: '^module\\s+([^\\s]+)',
 *   template: 'module ${1}',
 *   version: '1.0.0'
 * });
 *
 * // Update package.json version
 * await updateVersionInFile({
 *   path: 'package.json',
 *   pattern: '"version":\\s*"([^"]+)"',
 *   template: '"version": "${version}"',
 *   version: '1.0.0'
 * });
 */
export async function updateVersionInFile({
  path: filePath,
  pattern,
  template,
  version,
}: {
  path: string;
  pattern: string;
  template: string;
  version: string;
}): Promise<void> {
  const content = await fs.readFile(filePath, 'utf-8');
  const regex = new RegExp(pattern);

  // Handle both ${version} and ${N} capture group references
  const newContent = content.replace(regex, (...args) => {
    let result = template;

    // Replace ${version} with the new version
    result = result.replace(/\$\{version\}/g, version);

    // Replace ${N} with capture groups (args[1] is first group, args[2] second, etc)
    for (let i = 1; i < args.length - 2; i++) {
      result = result.replace(new RegExp(`\\$\\{${i}\\}`, 'g'), args[i]);
    }

    return result;
  });

  await fs.writeFile(filePath, newContent);
}

//TODO: move the xrelease template logic to this file
