#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Get the latest tag
const latestTag = execSync('git describe --tags --abbrev=0').toString().trim();

// Generate changelog content
const changelogContent = execSync(
    `git log ${latestTag}..HEAD --pretty=format:"* %s (%h)" --no-merges`
).toString();

// Read existing CHANGELOG.md if it exists
let existingChangelog = '';
const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');

if (fs.existsSync(changelogPath)) {
    existingChangelog = fs.readFileSync(changelogPath, 'utf-8');
}

// Create new changelog content
const newChangelog = `# Changelog

## [Unreleased]
${changelogContent}

${existingChangelog}`;

// Write the new changelog
fs.writeFileSync(changelogPath, newChangelog);

console.log('✨ Changelog generated successfully!'); 