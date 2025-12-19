# Installation Guide

## Requirements

- Node.js 18 or later (required for all projects, even non-Node.js ones)
- Git

## Installation Options

> xrelease works with npm, pnpm, and bun. The examples below use npm commands — feel free to swap in your preferred package manager.

### Option A: From npm registry (recommended)

```bash
# Verify Node.js version
node --version  # Should be 18 or later

# Install xrelease globally
npm install -g xrelease

# Verify installation
xrelease --version
```

### Option B: From GitHub

```bash
# Verify Node.js version
node --version  # Should be 18 or later

# Clone the repository
git clone https://github.com/matsilva/xrelease.git
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

### Option C: As a local project dependency

```bash
# Verify Node.js version
node --version  # Should be 18 or later

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

## Post-Installation

After installing xrelease, you'll need to initialize it in your project:

```bash
# Navigate to your project
cd your-project

# Initialize xrelease
xrelease init
```

This will:

1. Create a minimal `package.json` if it doesn't exist (used for version tracking)
2. Create `.xrelease.yml` configuration
3. Add necessary entries to `.gitignore`
4. Set up conventional commits (optional)

## Note About package.json

Even for non-Node.js projects, xrelease uses `package.json` as the single source of truth for versioning. This file will be created automatically and marked as `private: true` to prevent accidental npm publishing. It's just a version file, similar to how `.gitignore` isn't language-specific.
