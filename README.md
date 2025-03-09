# xrelease

[![CI](https://github.com/matsilva/xrelease/actions/workflows/ci.yml/badge.svg)](https://github.com/matsilva/xrelease/actions/workflows/ci.yml)

## TL;DR - Yet Another Release Tool™

Backstory:

- I build in Python, Go, Scala, Node, Swift... & I got tired of each having its own release dance.
- I wanted to live in a world where I could setup automated releases for my project in one command.

Now I can with: `xrelease` 🚀 and it Just Works™ for everything. \*\*

## What It Does

- ✨ Works with ANY language (Python, Go, Scala, Node, Swift, etc.)
- 🤖 Handles versioning, changelogs, git tags
- 🔄 Same workflow everywhere - learn once, use everywhere
- 🎯 Zero config needed (but fully customizable if you want)
- 🔋 Batteries included - no plugins required for core features

## Common Commands

`npm install -g xrelease` - install xrelease

```bash
xrelease init          # Setup xrelease for your project
xrelease create        # Create a release - defauts to patch
xrelease create -M     # Major release
xrelease create -m     # Minor release
xrelease create -p     # Patch release
```

## CLI Options TL;DR

### `xrelease init` 🏁

Sets up automated releases for your project.

```bash
-y, --yes              # Skip prompts and use defaults
-l, --language <type>  # Project language (node, go)
```

### `xrelease create` 🚀

Creates a new release, using the `.xrelease.yml` config steps created in `xrelease init`

```bash
-M, --major           # Create major release
-m, --minor           # Create minor release
-p, --patch           # Create patch release
--bump <type>         # Specify version bump (major, minor, patch)
--branch <name>       # Branch to create release from
--config <path>       # Path to config file
```

### `xrelease add` ➕

Add specific components to your release config

```bash
workflow   # Add GitHub Actions workflow
changelog  # Add changelog configuration
hooks     # Add Git hooks configuration
```

## More Details

- 📚 [Installation Options](docs/installation.md)
- ⚙️ [Configuration Guide](docs/configuration.md)
- 🔄 [CI/CD Integration](docs/ci-cd.md)

## A Note for Scala Devs 🎯

Yes, it's built with Node.js, not "sleek, performant Scala with higher-order functions" 😉. But like `sbt` or `mill`, it's just a build tool - it won't touch your production code. Promise!... maybe

## The Opinionated Bit 💭

xrelease uses `package.json` as the single source of truth for versioning in ALL projects, regardless of language. Why?

- 🎯 One consistent way to handle version
- 🔄 Proven, battle-tested version bumping
- 🛠 Works with existing tools and CI systems
- 📦 Minimal config (just version, marked as private)

Learn more about [why package.json](./docs/why_package_json.md)

\*\* Terms and conditions may apply, see [ymmv](docs/legal/ymmv.md)

## License

MIT
