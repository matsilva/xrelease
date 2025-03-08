import { execa } from 'execa';
import fs from 'fs/promises';

export type ChangelogTemplate = 'conventional' | 'simple';

export async function generateChangelog(version: string, template: ChangelogTemplate = 'conventional'): Promise<void> {
  try {
    // Get commits since last tag
    const { stdout: commits } = await execa('git', ['log', '--oneline', '--no-merges', '$(git describe --tags --abbrev=0)..HEAD']);

    // Generate changelog content
    const date = new Date().toISOString().split('T')[0];
    const header = `## [${version}] - ${date}\n\n`;

    let content = '';
    if (!commits.trim()) {
      content = '* No changes\n\n';
    } else if (template === 'conventional') {
      content = formatConventionalCommits(commits);
    } else {
      content = formatSimpleCommits(commits);
    }

    const changelogContent = header + content;

    try {
      // Try to read existing changelog
      const existingChangelog = await fs.readFile('CHANGELOG.md', 'utf-8');
      const updatedChangelog = existingChangelog.replace(/^(# Changelog\n\n)?/, ''); // Remove existing header if present
      await fs.writeFile('CHANGELOG.md', changelogContent + updatedChangelog);
    } catch (error) {
      // If file doesn't exist, create new one
      await fs.writeFile('CHANGELOG.md', changelogContent);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      throw new Error('Failed to update changelog file');
    }
    throw error;
  }
}

function formatConventionalCommits(commits: string): string {
  const lines = commits.split('\n').filter(Boolean);
  const formatted = lines.map((line) => {
    const match = line.match(/^[a-f0-9]+ (feat|fix|docs|style|refactor|test|chore)(\([^)]+\))?: (.+)$/);
    if (match) {
      const [, type, , message] = match;
      return `* ${type}: ${message}`;
    }
    return `* ${line.replace(/^[a-f0-9]+ /, '')}`;
  });
  return formatted.join('\n') + '\n\n';
}

function formatSimpleCommits(commits: string): string {
  return (
    commits
      .split('\n')
      .filter(Boolean)
      .map((line) => `* ${line.replace(/^[a-f0-9]+ /, '')}`)
      .join('\n') + '\n\n'
  );
}
