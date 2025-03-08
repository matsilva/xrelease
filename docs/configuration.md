# Configuration Guide

## Quickstart Config

Copy this into `.xrelease.yml` to get started:

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

## Parameter Reference

### version

- Type: `number`
- Required: yes
- Default: `1`
- Purpose: Config file version

### release.branch

- Type: `string`
- Required: yes
- Default: `main`
- Purpose: Branch to create releases from

### release.defaultBump

- Type: `string`
- Required: no
- Options: `major` | `minor` | `patch`
- Default: `patch`
- Purpose: Default version increment type

### release.changelog

- Type: `object`
- Required: no
- Properties:
  - `enabled`: `boolean` - Generate changelog
  - `template`: `string` - Changelog format (`conventional` | `simple`)
- Purpose: Controls changelog generation

### release.checks

- Type: `array`
- Required: no
- Items: Pre-release validation steps
- Available checks:
  - `lint`: Run code linter
  - `test`: Run test suite
  - `build`: Verify build
  - Custom: `{ type: string, command: string }`
- Purpose: Validates release readiness

### release.actions

- Type: `array`
- Required: no
- Available actions:
  - `git-tag`: Create and push git tag
  - `github-release`: Create GitHub release
  - Custom: `{ type: string, command: string }`
- Purpose: Actions to perform on release

## Language Examples

### Python (Poetry)

```yaml
version: 1
release:
  branch: main
  defaultBump: patch
  checks:
    - type: lint
      command: 'poetry run flake8'
    - type: test
      command: 'poetry run pytest'
    - type: build
      command: 'poetry build'
  actions:
    - type: git-tag
    - type: github-release
    - type: custom
      command: 'poetry publish'
```

### Scala (sbt)

```yaml
version: 1
release:
  branch: main
  defaultBump: minor # Scala often uses minor for features
  checks:
    - type: lint
      command: 'sbt scalafmtCheckAll'
    - type: test
      command: 'sbt test'
    - type: build
      command: 'sbt package'
  actions:
    - type: git-tag
    - type: github-release
    - type: custom
      command: 'sbt publish'
```

### Go

```yaml
version: 1
release:
  branch: main
  defaultBump: patch
  checks:
    - type: lint
      command: 'golangci-lint run'
    - type: test
      command: 'go test ./...'
    - type: build
      command: 'go build'
  actions:
    - type: git-tag
    - type: github-release
```

### Swift (SPM)

```yaml
version: 1
release:
  branch: main
  defaultBump: minor
  checks:
    - type: lint
      command: 'swiftlint'
    - type: test
      command: 'swift test'
    - type: build
      command: 'swift build'
  actions:
    - type: git-tag
    - type: github-release
    - type: custom
      command: 'pod trunk push' # If using CocoaPods
```

### Rust (Cargo)

```yaml
version: 1
release:
  branch: main
  defaultBump: patch
  checks:
    - type: lint
      command: 'cargo clippy'
    - type: test
      command: 'cargo test'
    - type: build
      command: 'cargo build --release'
  actions:
    - type: git-tag
    - type: github-release
    - type: custom
      command: 'cargo publish'
```
