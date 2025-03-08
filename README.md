# xrelease

Getting tired of reinventing the release wheel for each project/language? xrelease provides a standardized way to manage your release process across any project.

## Quickstart Guide

### 1. Installation

Choose one of the following installation methods:

#### Option A: From npm registry (recommended)

```bash
npm install -g xrelease
```

#### Option B: From GitHub

```bash
# Clone the repository
git clone https://github.com/yourusername/xrelease.git
cd xrelease

# Install dependencies
npm install

# Build the project
npm run build

# Make the CLI executable
chmod +x dist/cli/index.js

# Create a global symlink
npm link

# Verify installation
xrelease --help
```

#### Option C: As a local project dependency

```bash
# Clone and build first
git clone https://github.com/yourusername/xrelease.git
cd xrelease
npm install
npm run build
chmod +x dist/cli/index.js

# Then in your project's package.json
{
  "devDependencies": {
    "xrelease": "file:../path/to/xrelease"
  }
}

# Install in your project
npm install
```

### 2. Setup in Your Project

1. Navigate to your project root:

```bash
cd your-project
```

2. Initialize xrelease:

```bash
xrelease init
```

This will create a `.xrelease.yml` configuration file in your project root.

3. Set up conventional commits (optional but recommended):

```bash
# Install necessary dependencies
npm install --save-dev @commitlint/cli @commitlint/config-conventional husky

# Initialize husky
npx husky install

# Add commit-msg hook for commitlint
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'

# Create commitlint config file
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js
```

This setup will enforce conventional commit messages with the following format:

```
type(scope): subject

[optional body]
[optional footer(s)]
```

Valid types:

- feat: A new feature
- fix: A bug fix
- docs: Documentation changes
- style: Code style changes (formatting, etc)
- refactor: Code refactoring
- test: Adding or modifying tests
- chore: Maintenance tasks

Example commit messages:

```
feat(auth): add OAuth2 support
fix(api): handle null response from endpoint
docs(readme): update installation instructions
```

### 3. Configuration

Edit `.xrelease.yml` to match your project needs:

```yaml
version: 1
release:
  # Branch to create releases from
  branch: main

  # Version bump type (major, minor, patch)
  defaultBump: patch

  # Changelog configuration
  changelog:
    enabled: true
    template: conventional

  # Pre-release checks
  checks:
    - type: lint
    - type: test
    - type: build

  # Post-release actions
  actions:
    - type: git-tag
    - type: github-release
```

### 4. Creating a Release

To create a new release:

```bash
xrelease create
```

This will:

1. Run pre-release checks
2. Bump version according to conventional commits
3. Generate changelog
4. Create git tag
5. Push release to GitHub (if configured)

### 5. Common Commands

```bash
# View current version
xrelease version

# Preview next release
xrelease preview

# Create release with specific bump
xrelease create --bump minor

# View release history
xrelease history
```

### 6. CI/CD Integration

Add to your CI pipeline:

```yaml
steps:
  - name: Create Release
    run: |
      npm install -g xrelease
      xrelease create --ci
```

## Features

- 🚀 Automated version bumping
- 📝 Changelog generation
- ✅ Pre-release checks
- 🔄 CI/CD integration
- 🎯 Configurable workflows
- 🔌 Plugin system for custom actions

## License

MIT
