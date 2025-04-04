# xrelease — Unified Release Automation for Any Project

[![CI](https://github.com/matsilva/xrelease/actions/workflows/ci.yml/badge.svg)](https://github.com/matsilva/xrelease/actions/workflows/ci.yml)
[![Release: Automated with xrelease](https://img.shields.io/badge/Release-Automated%20with%20xrelease-blueviolet?logo=github&logoColor=white)](https://github.com/matsilva/xrelease)

xrelease provides a consistent, automated release process across all programming languages and frameworks. Create versioned releases with changelogs and Git tags using the same workflow everywhere, regardless of whether you're working with Python, Go, Scala, Node, Swift, or any other language.

## About

xrelease solves the challenge of maintaining different release workflows for each language or framework. It offers a standardized approach that works universally across your projects.

- One consistent workflow for all projects
- Automated versioning, changelogs, and git tags
- Zero-config operation with full customization options

## Features

- **Language agnostic**: Works with any language (Python, Go, Scala, Node, Swift, etc.)
- **Automated essentials**: Handles versioning, changelogs, git tags automatically
- **Consistency**: Same workflow everywhere - learn once, use everywhere
- **Zero-config**: Works out-of-the-box with sensible defaults
- **Fully extensible**: Customize with hooks and plugins when needed
- **CI/CD integration**: Seamlessly integrates with GitHub Actions and other CI systems

## Quick Start

1. Install xrelease

```bash
npm install -g xrelease
```

2. Initialize in your project

```bash
xrelease init
```

3. Create a release

```bash
xrelease create
```

Your project now has an updated version, changelog, and git tag!

## Common Commands

```bash
xrelease init          # Setup xrelease for your project
xrelease create        # Create a release - defaults to patch
xrelease create -M     # Major release
xrelease create -m     # Minor release
xrelease create -p     # Patch release
```

## CLI Options

### `xrelease init`

Sets up automated releases for your project.

```bash
-y, --yes              # Skip prompts and use defaults
-l, --language <type>  # Project language (node, go)
```

### `xrelease create`

Creates a new release, using the `.xrelease.yml` config steps created in `xrelease init`

```bash
-M, --major           # Create major release
-m, --minor           # Create minor release
-p, --patch           # Create patch release
--bump <type>         # Specify version bump (major, minor, patch)
--branch <name>       # Branch to create release from
--config <path>       # Path to config file
```

### `xrelease add`

Add specific components to your release config

```bash
workflow   # Add GitHub Actions workflow
changelog  # Add changelog configuration
hooks      # Add Git hooks configuration
```

## Why xrelease?

| Problem                                       | xrelease Solution               |
| --------------------------------------------- | ------------------------------- |
| Different release processes for each language | One consistent workflow         |
| Manual version tracking and changelog updates | Fully automated releases        |
| Complex CI/CD setup for release management    | One-command CI integration      |
| No standardization across project repos       | Same release pattern everywhere |

## Documentation

- [Installation Options](docs/installation.md)
- [Configuration Guide](docs/configuration.md)
- [CI/CD Integration](docs/ci-cd.md)

## FAQ

**Why does xrelease use package.json for all projects?**
xrelease uses `package.json` as the single source of truth for versioning in ALL projects, regardless of language. This provides one consistent way to handle versioning, proven and battle-tested version bumping mechanisms, compatibility with existing tools and CI systems, and minimal configuration (just version, marked as private). Learn more about [why package.json](./docs/why_package_json.md).

**How does xrelease compare to semantic-release?**
While [semantic-release](https://github.com/semantic-release/semantic-release) is a powerful tool that supports multiple languages through plugins, xrelease takes a "batteries included" approach that works out-of-the-box with minimal setup. semantic-release offers extensive customization but requires significant configuration through plugins for most use cases. In contrast, xrelease focuses on providing a simple, ready-to-use release workflow for any language with sensible defaults. If you need a highly customizable release pipeline and don't mind the configuration overhead, semantic-release is excellent. However, if you want to get automated releases working quickly across different projects and languages without wrestling with complex setup, xrelease provides a more straightforward path with its simplified, consistent approach.

**Does xrelease work with my CI/CD system?**
Yes! xrelease is designed to integrate with GitHub Actions, CircleCI, Jenkins, and other CI systems. See our [CI/CD Integration](docs/ci-cd.md) guide for details.

**Can I customize the release process?**
Absolutely. While xrelease works without configuration, you can fully customize the release process through the `.xrelease.yml` configuration file. See our [Configuration Guide](docs/configuration.md).

**I'm a Scala dev - why use a Node-based tool?**
Yes, it's built with Node.js, not "sleek, performant Scala with higher-order functions". But like `sbt` or `mill`, it's just a build tool - it won't touch your production code. Promise!... maybe

## License

MIT

\*\* Terms and conditions may apply, see [ymmv](docs/legal/ymmv.md)
