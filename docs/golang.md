# Golang Release Guide

## Setup

1. Add a minimal `package.json` for version management:

```json
{
  "name": "your-go-module",
  "version": "1.0.0",
  "private": true
}
```

2. Create `.xrelease.yml`:

```yaml
version: 1
release:
  branch: main
  defaultBump: patch

  # Pre-release checks
  checks:
    - type: lint
      command: 'golangci-lint run'
    - type: test
      command: 'go test ./...'
    - type: build
      command: 'go build'

  # Version management
  version:
    files:
      # package.json is handled automatically
      - path: 'go.mod'
        pattern: "module\\s+(?<module>[^\\s]+)\\s+(?<version>v\\d+)"
        template: 'module ${module} ${version}'

  # Release actions
  actions:
    # Standard actions
    - type: git-tag
    - type: github-release

    # Go-specific actions
    - type: custom
      name: 'update-go-mod'
      command: |
        # Extract version without 'v' prefix
        VERSION=$(node -p "require('./package.json').version")

        # Update go.mod
        go mod edit -module "$(go list -m)"/v${VERSION%%.*}
        go mod tidy

        # Verify module version
        go list -m
```

## How It Works

1. **Version Source of Truth**

   - Uses `package.json` for version management
   - xrelease handles version bumping automatically
   - Keeps versioning consistent across tools

2. **Go Module Updates**

   - Automatically updates `go.mod` based on major version
   - Follows Go module versioning conventions (v2+ in module path)
   - Runs `go mod tidy` to ensure dependencies are clean

3. **Checks and Validations**
   - Runs golangci-lint for code quality
   - Executes tests
   - Verifies build works

## Example Workflow

1. Start with v1.0.0:

```go
// go.mod
module github.com/user/repo
```

2. After minor update to v1.1.0:

```go
// go.mod (unchanged)
module github.com/user/repo
```

3. After major update to v2.0.0:

```go
// go.mod (automatically updated)
module github.com/user/repo/v2
```

## Common Commands

```bash
# Create patch release (1.0.0 -> 1.0.1)
xrelease create -p

# Create minor release (1.0.1 -> 1.1.0)
xrelease create -m

# Create major release (1.1.0 -> 2.0.0)
# This will update the go.mod module path
xrelease create -M
```

## CI/CD Integration

```yaml
name: Release
on:
  workflow_dispatch:
    inputs:
      version_bump:
        description: 'Version bump type'
        required: true
        default: 'patch'
        type: choice
        options:
          - patch
          - minor
          - major

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-go@v5
        with:
          go-version: '1.22'

      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install xrelease
        run: npm install -g xrelease

      - name: Configure Git
        run: |
          git config --global user.name 'github-actions[bot]'
          git config --global user.email 'github-actions[bot]@users.noreply.github.com'

      - name: Create Release
        run: xrelease create --ci --bump ${{ inputs.version_bump }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Best Practices

1. **Module Path Updates**

   - Major version changes (v2+) update the module path
   - This follows Go's module versioning convention
   - Ensures proper dependency resolution

2. **Version Synchronization**

   - Keep `package.json` version as source of truth
   - Go module path updates happen automatically
   - Reduces version management complexity

3. **Semantic Versioning**
   - Use patch for bug fixes
   - Use minor for backwards-compatible features
   - Use major for breaking changes (updates module path)
