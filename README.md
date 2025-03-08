# release-toolkit

Getting tired of reinventing the release wheel for each project/language? Release-toolkit provides a standardized way to manage your release process across any project.

## Quickstart Guide

### 1. Installation

Choose one of the following installation methods:

#### Option A: From npm registry (recommended)

```bash
npm install -g @release-toolkit/cli
```

#### Option B: From GitHub

```bash
# Clone the repository
git clone https://github.com/yourusername/release-toolkit.git
cd release-toolkit

# Install dependencies
npm install

# Build the project
npm run build

# Create a global symlink
npm link

# Or use directly with npx
npx /path/to/release-toolkit/cli.js
```

#### Option C: As a local project dependency

```bash
# Add as a local dependency in your project's package.json
{
  "devDependencies": {
    "release-toolkit": "file:../path/to/release-toolkit"
  }
}

# Then install
npm install
```

### 2. Setup in Your Project

1. Navigate to your project root:

```bash
cd your-project
```

2. Initialize release-toolkit:

```bash
release-toolkit init
```

This will create a `.release-toolkit.yml` configuration file in your project root.

### 3. Configuration

Edit `.release-toolkit.yml` to match your project needs:

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
release-toolkit create
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
release-toolkit version

# Preview next release
release-toolkit preview

# Create release with specific bump
release-toolkit create --bump minor

# View release history
release-toolkit history
```

### 6. CI/CD Integration

Add to your CI pipeline:

```yaml
steps:
  - name: Create Release
    run: |
      npm install -g @release-toolkit/cli
      release-toolkit create --ci
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
