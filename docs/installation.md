# Detailed Installation Guide

## Option A: From npm registry (recommended)

```bash
npm install -g xrelease
```

## Option B: From GitHub

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

## Option C: As a local project dependency

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
