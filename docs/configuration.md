# Configuration Guide

## Configuration File

The `.xrelease.yml` configuration file supports the following options:

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

## Conventional Commits Setup

For consistent versioning, we recommend using conventional commits:

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

### Commit Message Format

```
type(scope): subject

[optional body]
[optional footer(s)]
```

Valid types:

- feat: A new feature
- fix: A bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Adding/modifying tests
- chore: Maintenance tasks

Example messages:

```
feat(auth): add OAuth2 support
fix(api): handle null response
docs(readme): update instructions
```
