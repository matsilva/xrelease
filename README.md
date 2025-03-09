# xrelease

> "I build in Python, Go, Scala, Node, Swift... got tired of each having its own release dance. So I made one that Just Works™ for everything." - [@matsilva](https://x.com/MatSilva)

## TL;DR - Yet Another Release Tool™

"Look, I just wanted releases to suck less. No plugins, no drama, just releases."

What it does:

- Works with any language
- One config file that humans can read
- Same commands everywhere
- Just shell commands under the hood

That's it. That's the pitch.

Want the fancy marketing speak? See `docs/`. Want the legal mumbo jumbo? See `docs/legal/ymmv.md`. Want to just ship code? `xrelease create` 🚀

## What It Does

- ✨ Works with ANY language (Python, Go, Scala, Node, Swift, etc.)
- 🤖 Handles versioning, changelogs, git tags
- 🔄 Same workflow everywhere - learn once, use everywhere
- 🎯 Zero config needed (but fully customizable if you want)
- 🔋 Batteries included - no plugins required for core features
-

## Common Commands

```bash
xrelease create        # Create a release
xrelease create -M     # Major release
xrelease create -m     # Minor release
xrelease create -p     # Patch release
```

## More Details

- 📚 [Installation Options](docs/installation.md)
- ⚙️ [Configuration Guide](docs/configuration.md)
- 🔄 [CI/CD Integration](docs/ci-cd.md)

## A Note for Scala Devs

Yes, it's built with Node.js, not "sleek, performant Scala with higher-order functions" 😉. But like `sbt` or `mill`, it's just a build tool - it won't touch your production code. Promise!... maybe

## The Opinionated Bit

xrelease uses `package.json` as the single source of truth for versioning in ALL projects, regardless of language. Why?

- 🎯 One consistent way to handle version
- 🔄 Proven, battle-tested version bumping
- 🛠 Works with existing tools and CI systems
- 📦 Minimal config (just version, marked as private)

Learn more about [why package.json](./docs/why_package_json.md)

\*\* Terms and conditions may apply, see [docs/legal/ymmv.md](docs/legal/ymmv.md)

## License

MIT
